
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
    this.roofBody = null;

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
var roofX = 0;
var roofY = 29.5;
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
    this.roofBody = this.physics.createBox(roofX, roofY, 0, oblongWidth, oblongHeight, 'static');

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

    this.drawGround();
};

MTOItem.prototype.drawGround = function() {
    var g = this.physics.summarize(this.groundBody);
    this.wrappedCanvas.drawRectangle(g.x, g.y, g.angle, oblongWidth, oblongHeight, 'black');

    var r = this.physics.summarize(this.roofBody);
    this.wrappedCanvas.drawRectangle(r.x, r.y, r.angle, oblongWidth, oblongHeight, 'black');
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
    var checkQueue = [ seedCharm ];
    for (var i = 0; i < checkQueue.length; i++) {
        fn(checkQueue[i]);
        console.log( "bleep bloop", checkQueue[i] );
    }
};

MTOItem.prototype.sortAnchorsOnFocus = function(detachedParent) {
    // for all connected charms
    var sel = this.selectedCharm;
    console.warn("TODO: implement sortAnchorsBySelectedCharm(), should be two lists");

    debugger;
    this.forConnectedCharms(detachedParent, function(charm) {
        console.log("In custom charm iterator: ", charm);
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

        // instead of parentCharm should use base chain as seed 
        this.sortAnchorsOnFocus(parentCharm);

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

        console.log("TODO: scan anchors and make connection if detected");
        //var anchorResult = model.anchorScan(this.selectedCharm)
        //if (anchorResult.snap) {
            //this.selectedCharm.anchors.upper.attachedComponent = anchorResult.freshAttachment;
            //anchorResult.lowerAnchor.attachedComponent = this.selectedCharm;

            //this.selectedCharm.translateChain(anchorResult.params.x, anchorResult.params.y)
        //}
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

        console.log("TODO: set status of overlapped anchors accordingly (for highlighting)");
        //var anchorResult = model.anchorScan(this.selectedCharm)
        //if (anchorResult.snap) {
            //anchorResult.lowerAnchor.hovered = true;
            //anchorResult.upperAnchor.hovered = true;
        //}
    }
    oldMousePos = mousePos;
};

module.exports = MTOItem;

