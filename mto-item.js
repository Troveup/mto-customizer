
var WrappedCanvas = require("./wrapped-canvas.js");
var Charm = require("./charm.js");
var Box2DHelper = require("./box2d-helper.js");
var Box2D = require("box2d");

function MTOItem(canvasID, baseSpec, charmSpecList) {
    this.baseChain = new Charm(baseSpec);
    this.charmList = charmSpecList.map(function(spec) {
        return new Charm(spec);
    });

    this.wrappedCanvas = new WrappedCanvas(canvasID);
    this.wrappedCanvas.setup({
        pixelsToMeter: 10
    });

    this.selectedCharm = null;
    this.groundBody = null;
    //this.roofBody = null;

    this.physics = new Box2DHelper();
    this.physics.init();

    // potential ways to store non-linked charms
    //this.looseRoots
    //this.chainList
}

MTOItem.prototype.spawnCharm = function(x, y, anchorOffsetDist) {
    var linkWidth = 112 / 3;
    var linkHeight = 350 / 3;
    var proceduralSpec = {
        imgURL: "/resources/img/charm-link.png",
        position: new THREE.Vector2(x, y),
        rotation: 0,
        width: linkWidth,
        height: linkHeight,
        upperAnchor: new THREE.Vector2(0, anchorOffsetDist),
        lowerAnchor: new THREE.Vector2(0, -anchorOffsetDist)
    };

    var c = new Charm(proceduralSpec);
    c.body = this.physics.createBox(c.pos.x, c.pos.y, c.angleInRadians, c.width, c.height, 'dynamic');
    return c;
}


var groundX = 0;
var groundY = -20;
//var roofX = 0;
//var roofY = 29.5;
var oblongWidth = 60;
var oblongHeight = 1;

MTOItem.prototype.loadAssets = function() {
    var loadingPromises = this.charmList.map(function(charm){
        return charm.loadAssets();
    }.bind(this));
    loadingPromises.push( this.baseChain.loadAssets() );

    return Promise.all(loadingPromises);
};

MTOItem.prototype.addCharmsToSim = function() {
    // this is a debug line, should eventually remove
    this.groundBody = this.physics.createBox(groundX, groundY, 0, oblongWidth, oblongHeight, 'static');
    //this.baseChain.body = this.physics.createBox(roofX, roofY, 0, oblongWidth, oblongHeight, 'static');
    var b = this.baseChain;
    b.body = this.physics.createBox( b.pos.x, b.pos.y, b.angleInRadians, b.width, b.height, 'static' );

    this.charmList.map(function(c){
        c.body = this.physics.createBox(c.pos.x, c.pos.y, c.angleInRadians, c.width, c.height, 'dynamic');
    }.bind(this));

};

MTOItem.prototype.iterateCharms = function(callback) {
    return this.charmList.map(callback);
};

MTOItem.prototype.render = function() {
    this.wrappedCanvas.clean();

    this.iterateCharms(function(charm) {
        this.wrappedCanvas.drawImage(charm.pos.x, charm.pos.y, charm.angleInRadians, charm.width, charm.height, charm.img);
        charm.eachAnchor(function(anchor, isParent) {
            var o = anchor.getTransformedOffset();
            this.wrappedCanvas.drawCircle(o.x, o.y, 5, 'black');
        }.bind(this));
        this.wrappedCanvas.strokeRectangle(charm.pos.x, charm.pos.y, 0, charm.width, charm.height, 'black'); // FIXME: drawing real hitbox
        this.wrappedCanvas.strokeRectangle(charm.pos.x, charm.pos.y, charm.angleInRadians, charm.width, charm.height, 'black'); // FIXME: drawing real hitbox
    }.bind(this));

    var r = this.physics.summarize(this.baseChain.body);
    this.wrappedCanvas.drawRectangle(r.x, r.y, r.angle, oblongWidth, oblongHeight, 'black');
    this.baseChain.eachAnchor(function(anchor, isParent) {
        var o = anchor.getTransformedOffset();
        this.wrappedCanvas.drawCircle(o.x, o.y, 5, 'black');
    }.bind(this));

    this.drawGround();
};

MTOItem.prototype.drawGround = function() {
    var g = this.physics.summarize(this.groundBody);
    this.wrappedCanvas.drawRectangle(g.x, g.y, g.angle, oblongWidth, oblongHeight, 'black');
};

MTOItem.prototype.stepPhysics = function(dt) {
    this.physics.tick(dt);

    // sync physics body data with containg Charm object
    this.iterateCharms(function(charm) {
        var physData = this.physics.summarize(charm.body);
        charm.pos.x = physData.x;
        charm.pos.y = physData.y;
        charm.angleInRadians = physData.angle;
    }.bind(this));
};

MTOItem.prototype.forConnectedCharms = function(seedCharm, fn) {
    console.log( "=== Executing forConnectedCharms..." );
    var visited = Object.create(null);
    var checkQueue = [ seedCharm ];
    for (var i = 0; i < checkQueue.length; i++) {
        fn(checkQueue[i]);
        checkQueue[i].eachAnchor(function(anchor, isParent) {
            if (anchor.attachedAnchor) {
                var expansionCharm = anchor.attachedAnchor.ownerCharm;
                if (!visited[expansionCharm.key]) {
                    visited[expansionCharm.key] = true;
                    checkQueue.push(expansionCharm);
                }
            }
        });
    }
};

// use base chain as starting point for valid anchors to attach to, will be used to
// check against any open anchors on the focused charm for connections
MTOItem.prototype.sortAnchorsOnFocus = function() {
    var that = this;
    this.openRootAnchors = [];
    this.openFocusAnchors = [];

    this.forConnectedCharms(this.baseChain, function(charm) {
        console.log(" base charm: ", charm);
        charm.eachAnchor(function(anchor) {
            if (!anchor.attachedAnchor) {
                that.openRootAnchors.push(anchor);
            }
        });
    });

    this.selectedCharm.eachAnchor(function(anchor) {
        if (!anchor.attachedAnchor) {
            that.openFocusAnchors.push(anchor);
        }
    });
};

MTOItem.prototype.getClosestCharmClicked = function(mousePos) {
    var closestDist = Infinity;
    var closestCharm = null;
    this.charmList.map(function(charm) {
        var result = charm.hitCheck(mousePos);
        if (result.hit) {
            if (!closestCharm || result.dist < closestDist) {
                closestCharm = charm;
                closestDist = result.dist;
            }
        }
    });
    return closestCharm;
};

MTOItem.prototype.detachParentCharm = function(selectedCharm) {
    var pa = selectedCharm.parentAnchor;
    if (pa) {
        var parentCharm = pa.attachedAnchor.ownerCharm;
        pa.attachedAnchor.attachedAnchor = null;
        pa.attachedAnchor = null;
        this.physics.world.DestroyJoint(pa.joint);
        return parentCharm;
    }

    return null;
};

MTOItem.prototype.handleMousedown = function(evt) {
    var mousePos = this.wrappedCanvas.getTransformedCoords(evt.clientX, evt.clientY);
    var selected = this.getClosestCharmClicked(mousePos);
    if (selected) {
        this.selectedCharm = selected;

        var parentCharm = this.detachParentCharm(selected);
        console.log("Detached parent: ", parentCharm);

        this.sortAnchorsOnFocus();

        var body = this.selectedCharm.body;
        body.SetGravityScale(0);
        body.SetLinearVelocity( Box2D.b2Vec2( 0, 0) );
        body.SetAngularVelocity( 0 );

        this.selectedCharm.status = 'selected';
    }
};

MTOItem.prototype.handleMouseup = function(evt) {
    if (this.selectedCharm) {
        this.selectedCharm.status = 'normal';
        this.selectedCharm.body.SetGravityScale(1);
        this.selectedCharm = null;

        var collisions = this.findAnchorCollisions();

        console.log("TODO: scan anchors and make connection if detected");
        //var anchorResult = model.anchorScan(this.selectedCharm)
        //if (anchorResult.snap) {
            //this.selectedCharm.anchors.upper.attachedComponent = anchorResult.freshAttachment;
            //anchorResult.lowerAnchor.attachedComponent = this.selectedCharm;

            //this.selectedCharm.translateChain(anchorResult.params.x, anchorResult.params.y)
        //}
    }
};

MTOItem.prototype.findAnchorCollisions = function() {
    console.warn("TODO: fix buggy logic for detecting anchor collisions");

    var bestResult = null;
    for (var i = 0; i < this.openFocusAnchors.length; i++) {
        for (var j = 0; j < this.openRootAnchors.length; j++) {
            var anchorMovable = this.openFocusAnchors[i];
            var anchorStable = this.openRootAnchors[j];

            var result = anchorMovable.checkCollision(anchorStable, 10);
            if (result.hit && (!bestResult || result.separation < bestResult.separation)) {
                bestResult = result;
            }
        }
    }

    if (bestResult) {
        var physData = this.physics.summarize(anchorMovable.ownerCharm.body);
        anchorMovable.ownerCharm.translate(physData, result.dx, result.dy);
    }
};

var oldMousePos;
MTOItem.prototype.handleMousemove = function(evt) {
    var mousePos = this.wrappedCanvas.getTransformedCoords(evt.clientX, evt.clientY);

    if (this.selectedCharm) {

        var dx = mousePos.x - oldMousePos.x;
        var dy = mousePos.y - oldMousePos.y;

        var oldPhysical = this.physics.summarize(this.selectedCharm.body);
        this.selectedCharm.translate(oldPhysical, dx, dy);

        //this.findAnchorCollisions();
    }
    oldMousePos = mousePos;
};

module.exports = MTOItem;

