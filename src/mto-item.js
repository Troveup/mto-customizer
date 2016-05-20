
var WrappedCanvas = require("./wrapped-canvas.js");
var Charm = require("./charm.js");
var Box2DHelper = require("./box2d-helper.js");

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

    this.physics = new Box2DHelper();
    this.physics.init();
}

MTOItem.prototype.spawnCharm = function(x, y, anchorOffsetDist) {
    var linkWidth = 112 / 3;
    var linkHeight = 350 / 3;
    var proceduralSpec = {
        imgURL: "/resources/img/directed-charm-link.png",
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
};


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

var anchorRadius = 2;
MTOItem.prototype.render = function() {
    this.wrappedCanvas.clean();

    this.wrappedCanvas.drawGrid(28, 28, 5);

    this.iterateCharms(function(charm) {
        this.wrappedCanvas.drawImage(charm.pos.x, charm.pos.y, charm.angleInRadians, charm.width, charm.height, charm.img);
        if (charm == this.selectedCharm) {
            this.wrappedCanvas.strokeRectangle(charm.pos.x, charm.pos.y, charm.angleInRadians, charm.width, charm.height, 'black');
        }
        charm.eachAnchor(function(anchor, isParent) {
            var o = anchor.getTransformedOffset();
            this.wrappedCanvas.drawCircle(o.x, o.y, anchorRadius, 'black');
        }.bind(this));
    }.bind(this));

    var r = this.physics.summarize(this.baseChain.body);
    this.wrappedCanvas.drawRectangle(r.x, r.y, r.angle, oblongWidth, oblongHeight, 'black');
    this.baseChain.eachAnchor(function(anchor, isParent) {
        var o = anchor.getTransformedOffset();
        this.wrappedCanvas.drawCircle(o.x, o.y, anchorRadius, 'black');
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

MTOItem.prototype.debugCachedAnchors = function() {
    var rootStrings = this.openRootAnchors.map(function(anchor) {
        return anchor.toString();
    });
    var focusStrings = this.openFocusAnchors.map(function(anchor) {
        return anchor.toString();
    });

    var debugStrings = ["Root anchors: "].concat(rootStrings, ["Focus anchors:"], focusStrings);
    console.log("Debug strings", debugStrings);
    return debugStrings.join("<br>");
};

// use base chain as starting point for valid anchors to attach to, will be used to
// check against any open anchors on the focused charm for connections
MTOItem.prototype.cacheLiveAnchors = function() {
    var that = this;
    this.openRootAnchors = [];
    this.openFocusAnchors = [];

    console.warn("Sorting anchors not properly iterating through linked anchors");
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

console.warn("TODO: fix buggy logic for detecting anchor collisions");
MTOItem.prototype.findAnchorCollisions = function(overlapRadius = 5) {
    var overlappingAnchorPairs = [];

    for (var i = 0; i < this.openFocusAnchors.length; i++) {
        for (var j = 0; j < this.openRootAnchors.length; j++) {
            var selectionAnchor = this.openFocusAnchors[i];
            var hangingAnchor = this.openRootAnchors[j];

            var result = selectionAnchor.checkCollision(hangingAnchor, overlapRadius);
            if (result.hit) {
                result.selectionAnchor = selectionAnchor;
                result.hangingAnchor = hangingAnchor;
                overlappingAnchorPairs.push( result );
            }
        }
    }
    return overlappingAnchorPairs;
};

MTOItem.prototype.attachAnchors = function(anchorA, anchorB) {
    console.log("TODO: connect anchors and add joint to physics");
    var bodyA = anchorA.ownerCharm.body;
    var bodyB = anchorB.ownerCharm.body;

    var newJoint = this.physics.createJoint(bodyA, anchorA.offset, bodyB, anchorB.offset);
    anchorA.joint = newJoint;
    anchorB.joint = newJoint;
    anchorA.attachedAnchor = anchorB;
    anchorB.attachedAnchor = anchorA;
};

// mousedown
    // determine clicked charm, quit if none
    // detach clicked charm
    // immobilize clicked charm
    // cache relevant anchor sets
    // set item.grabbed to clicked charm
// mouseup
    //

MTOItem.prototype.handleMousedown = function(evt) {
    var mousePos = this.wrappedCanvas.getTransformedCoords(evt.clientX, evt.clientY);
    var selected = this.getClosestCharmClicked(mousePos);
    if (selected) {
        this.selectedCharm = selected;

        this.detachParentCharm(selected);
        this.cacheLiveAnchors();
        this.selectedCharm.halt();

        this.selectedCharm.status = 'selected';
    }
};

MTOItem.prototype.handleMouseup = function(evt) {
    if (this.selectedCharm) {
        this.selectedCharm.resume();
        this.selectedCharm = null;

        var collisions = this.findAnchorCollisions(2*anchorRadius);
        var closest = null;
        var closestDist = Infinity;
        if (collisions.length > 0) {
            collisions.map(function(hitReport) {
                if (!closest || hitReport.separation < closestDist) {
                    closest = hitReport;
                    closestDist = hitReport.separation;
                }
            });

            var ownerCharm = closest.selectionAnchor.ownerCharm;
            var physData = this.physics.summarize(ownerCharm.body);
            closest.selectionAnchor.ownerCharm.translate(physData, closest.dx, closest.dy);
            this.attachAnchors(closest.selectionAnchor, closest.hangingAnchor);
            this.openRootAnchors = [];
            this.openFocusAnchors = [];
        }
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
    }
    oldMousePos = mousePos;
};

module.exports = MTOItem;

