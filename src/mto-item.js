
var WrappedCanvas = require("./wrapped-canvas.js");
var Charm = require("./charm.js");
var Box2DHelper = require("./box2d-helper.js");

var groundX = 0;
var groundY = -29.5;
var oblongWidth = 60;
var oblongHeight = 1;

function MTOItem(canvasID, baseSpec, charmSpecList) {
    this.baseChain = null;
    this.charmList = [];

    this.selectedCharm = null;
    this.draggingCharm = false;
    this.groundBody = null;

    this.physics = new Box2DHelper();
    this.physics.init();

    this.wrappedCanvas = new WrappedCanvas(canvasID);
    this.wrappedCanvas.setup({
        pixelsToMeter: 10
    });

    this.groundBody = this.physics.createBox(groundX, groundY, 0, oblongWidth, oblongHeight, 'static');
    this.setBaseChain(baseSpec);
    charmSpecList.map(function(spec) {
        this.addCharm(spec);
    }.bind(this));
}

MTOItem.prototype.addCharm = function(newCharmSpec) {
    var newCharm = new Charm(newCharmSpec);
    newCharm.body = this.physics.createBox(newCharm.pos.x, newCharm.pos.y, newCharm.angleInRadians, newCharm.width, newCharm.height, 'dynamic');
    newCharm.loadAssets().then(function(){
        this.charmList.push(newCharm);
    }.bind(this));
};

MTOItem.prototype.setBaseChain = function(newCharmSpec) {
    if (this.baseChain) {
        console.warn("TODO: delete body of existing base chain");
    }

    var b = new Charm(newCharmSpec);
    b.body = this.physics.createBox( b.pos.x, b.pos.y, b.angleInRadians, 1, 1, 'static');
    b.loadAssets().then(function() {
        this.baseChain = b;
    }.bind(this));
};

MTOItem.prototype.iterateCharms = function(callback) {
    return this.charmList.map(callback);
};

var anchorDrawRadius = 0.5;
var anchorSnapRadius = 3;
MTOItem.prototype.render = function() {
    this.wrappedCanvas.clean();

    if (this.baseChain) {
        var b = this.baseChain;
        this.wrappedCanvas.drawImage(b.pos.x, b.pos.y, b.angleInRadians, b.width, b.height, b.img);
    }

    this.iterateCharms(function(charm) {
        this.wrappedCanvas.drawImage(charm.pos.x, charm.pos.y, charm.angleInRadians, charm.width, charm.height, charm.img);
        if (charm == this.selectedCharm) {
            this.wrappedCanvas.strokeRectangle(charm.pos.x, charm.pos.y, charm.angleInRadians, charm.width, charm.height, 'black');
        }
        charm.eachAnchor(function(anchor, isParent) {
            var o = anchor.getTransformedOffset();
            this.wrappedCanvas.drawCircle(o.x, o.y, anchorDrawRadius, 'black');
        }.bind(this));
    }.bind(this));

    if (this.baseChain) {
        this.baseChain.eachAnchor(function(anchor, isParent) {
            var o = anchor.getTransformedOffset();
            this.wrappedCanvas.drawCircle(o.x, o.y, anchorDrawRadius, 'black');
        }.bind(this));
    }

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

MTOItem.prototype.traverseHanging = function(seedCharm, fn) {
    var checkQueue = [ seedCharm ];
    for (var i = 0; i < checkQueue.length; i++) {
        fn(checkQueue[i]);
        checkQueue[i].eachAnchor(function(anchor, isParent) {
            if (!isParent && anchor.attachedAnchor) {
                checkQueue.push(anchor.attachedAnchor.ownerCharm);
            }
        });
    }
};

MTOItem.prototype.traverseConnected = function(seedCharm, fn) {
    var visited = Object.create(null);
    var checkQueue = [ seedCharm ];
    visited[seedCharm.key] = true;

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
    if (this.openRootAnchors) {
        var rootStrings = this.openRootAnchors.map(function(anchor) {
            return anchor.toString();
        });
    }

    if (this.openFocusAnchors) {
        var focusStrings = this.openFocusAnchors.map(function(anchor) {
            return anchor.toString();
        });
    }

    return ["Root anchors: "].concat(rootStrings, ["Focus anchors:"], focusStrings).join("<br>");
};

MTOItem.prototype.clearAnchorCache = function() {
    this.openRootAnchors = [];
    this.openFocusAnchors = [];
}

// use base chain as starting point for valid anchors to attach to, will be used to
// check against any open anchors on the focused charm for connections
MTOItem.prototype.cacheLiveAnchors = function() {
    var that = this;
    this.openRootAnchors = [];
    this.openFocusAnchors = [];

    this.traverseConnected(this.baseChain, function(charm) {
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
        selectedCharm.parentAnchor = null;
        return parentCharm;
    }

    return null;
};

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
    var bodyA = anchorA.ownerCharm.body;
    var bodyB = anchorB.ownerCharm.body;

    var newJoint = this.physics.createJoint(bodyA, anchorA.offset, bodyB, anchorB.offset);
    anchorA.joint = newJoint;
    anchorB.joint = newJoint;
    anchorA.attachedAnchor = anchorB;
    anchorB.attachedAnchor = anchorA;
};

MTOItem.prototype.handleMousedown = function(evt) {
    var mousePos = this.wrappedCanvas.getTransformedCoords(evt.clientX, evt.clientY);
    var clickedCharm = this.getClosestCharmClicked(mousePos);
    if (clickedCharm) {
        this.selectedCharm = clickedCharm;
        this.draggingCharm = true;

        this.detachParentCharm(clickedCharm);
        this.cacheLiveAnchors();
        this.selectedCharm.halt();
    } else {
        this.selectedCharm = null;
        console.warn("TODO: could check gravity here?");
    }
};

MTOItem.prototype.handleMouseup = function(evt) {
    if (this.draggingCharm) {
        this.selectedCharm.resume();

        var collisions = this.findAnchorCollisions(2*anchorSnapRadius);
        if (collisions.length > 0) {
            var closest = null;
            var closestDist = Infinity;
            collisions.map(function(hitReport) {
                if (!closest || hitReport.separation < closestDist) {
                    closest = hitReport;
                    closestDist = hitReport.separation;
                }
            });

            var selectionCharm = closest.selectionAnchor.ownerCharm;
            this.traverseHanging(selectionCharm, function(hangingCharm) {
                var physData = this.physics.summarize(hangingCharm.body);
                hangingCharm.translate(physData, closest.dx, closest.dy);
            }.bind(this));

            this.attachAnchors(closest.selectionAnchor, closest.hangingAnchor);
            selectionCharm.parentAnchor = closest.selectionAnchor;
        }
        this.clearAnchorCache();
    }
    this.draggingCharm = false;
};

MTOItem.prototype.deleteCharm = function() {
    if (this.selectedCharm) {
        this.physics.world.DestroyBody( this.selectedCharm.body );

        var deleteIndex = -1;
        this.charmList.map(function(charm, i) {
            if (charm == this.selectedCharm) {
                deleteIndex = i;
            }
        }.bind(this));

        if (deleteIndex > -1) {
            this.charmList.splice(deleteIndex, 1);
        }
        this.selectedCharm = null;
        this.draggingCharm = false;
    }
};

var oldMousePos;
MTOItem.prototype.handleMousemove = function(evt) {
    var mousePos = this.wrappedCanvas.getTransformedCoords(evt.clientX, evt.clientY);
    if (this.draggingCharm) {

        var dx = mousePos.x - oldMousePos.x;
        var dy = mousePos.y - oldMousePos.y;

        // use this if you only want to translate the selected charm
        //var physData = this.physics.summarize(this.selectedCharm.body);
        //this.selectedCharm.translate(physData, dx, dy);

        // use this if you want to translate the selected charm and all those hanging from it
        this.traverseHanging(this.selectedCharm, function(hangingCharm) {
            var physData = this.physics.summarize(hangingCharm.body);
            hangingCharm.translate(physData, dx, dy);
        }.bind(this));
    }
    oldMousePos = mousePos;
};

module.exports = MTOItem;

