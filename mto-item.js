
var WrappedCanvas = require("./wrapped-canvas.js");
var Charm = require("./charm.js");
var Box2DHelper = require("./box2d-helper.js");

function MTOItem(canvasID, baseSpec, charmSpecList) {
    // this.baseChain = new Charm(baseSpec);
    this.charmList = charmSpecList.map(function(spec) {
        return new Charm(spec);
    });

    this.wrappedCanvas = new WrappedCanvas(canvasID);
    this.wrappedCanvas.centerOrigin();

    this.selectedCharm = null;
    this.ground = null;

    this.physics = new Box2DHelper();
    this.physics.init();

    // potential ways to store non-linked charms
    //this.looseRoots
    //this.chainList
}

MTOItem.prototype.timeStep = function(dt) {
    this.physics.tick(dt);
}

/*var fallSpeed = 0.3;
MTOItem.prototype.fallTest = function(dt) {
    var deltaY = dt * fallSpeed;
    this.iterateCharms(function(charm) {
        charm.pos.y -= deltaY;
    });
}*/

MTOItem.prototype.load = function() {
    var loadingPromises = this.charmList.map(function(charm){
        charm.body = this.physics.createBox(charm.pos.x, charm.pos.y, charm.rotation, charm.width, charm.height, 'dynamic');
        return charm.load();
    }.bind(this));
    //loadingPromises.push( this.baseChain.load() );

    return Promise.all(loadingPromises);
};

MTOItem.prototype.iterateCharms = function(callback) {
    return this.charmList.map(callback);
};

MTOItem.prototype.render = function() {
    this.wrappedCanvas.clean();
    this.drawCharms();
};

//var brokenDrop = false;
MTOItem.prototype.syncPhysics = function() {
    this.iterateCharms(function(charm) {

        var physData = this.physics.summarize(charm.body);
        //if (brokenDrop) debugger;
        //if (charm.pos.y == physData.y) {
            //brokenDrop = true;
            //console.log("unchanged y!");
        //}

        charm.pos.x = physData.x;
        charm.pos.y = physData.y;
        charm.rotation = physData.angle;
    }.bind(this));
};

MTOItem.prototype.drawCharms = function() {
    this.iterateCharms(function(charm) {
        this.wrappedCanvas.drawRectangle(charm.pos.x, charm.pos.y, charm.rotation, charm.width+2, charm.height+2, 'black');
        this.wrappedCanvas.drawRectangle(charm.pos.x, charm.pos.y, charm.rotation, charm.width, charm.height, 'orange');

        // asset draw
        //this.wrappedCanvas.drawImage(charm.pos.x, charm.pos.y, 0, charm.width, charm.height, charm.img);
    }.bind(this));
};


// ===========================

/*FlatModel.prototype.anchorScan = function(queryComponent) {
    var cutoffRadius = 30;
    var result = {
        snap: false
    }

    // assume top anchor must be open, so seek all open bottom anchors
    this.eachComponent(function(targetComponent) {
        if (targetComponent === queryComponent) {
            return;
        }

        var targetSite = targetComponent.anchors.lower;
        if (targetSite.attachedComponent) {
            return;
        }

        var tx = targetComponent.position.x + targetSite.offset.x
        var ty = targetComponent.position.y + targetSite.offset.y

        var sourceSite = queryComponent.anchors.upper;
        var qx = queryComponent.position.x + sourceSite.offset.x
        var qy = queryComponent.position.y + sourceSite.offset.y

        var dx = tx - qx;
        var dy = ty - qy;

        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < cutoffRadius) {
            result.snap = true;
            result.upperAnchor = sourceSite;
            result.lowerAnchor = targetSite;
            result.freshAttachment = targetComponent;
            result.params = {
                x: dx,
                y: dy
            }
        }
    });
    return result;
}

FlatModel.prototype.checkAnchors = function() {
    var len = this.componentList.length;
    var overlap = null;
    for (var i = 0; i < len; i++) {
        for (var j = i; j < len; j++) {
            if (i == j) continue;

            var objA = this.componentList[i];
            var objB = this.componentList[j];
            
            var results = objA.compareAnchors(objB);
            if (results.hit) {
                if (!overlap || results.dist < overlap.dist) {
                    overlap = {
                        dist: results.dist,
                        first: objA,
                        second: objB,
                        firstIndex: results.indexA,
                        secondIndex: results.indexB
                    };
                }
            }
        }
    }
    return overlap;
}*/

/*MTOItem.prototype.drawAnchors = function() {
    var anchorRenderRadius = 3;
    var posX = this.position.x;
    var posY = this.position.y;

    var that = this;
    Object.keys(this.anchors).map(function(anchorKey) {
        ctx.save();

        var anchor = that.anchors[anchorKey];
        var x = posX + anchor.offset.x;
        var y = posY + anchor.offset.y;

        var style = anchor.hovered ? anchorColors['overlap'] : anchor.debugStyle;
        anchor.hovered = false;
        
        // var anchorStyle = anchor.attachedComponent === null ? 'black' : 'green';
        drawCircle(ctx, x, y, anchorRenderRadius, style);

        ctx.restore();
    });
}*/

MTOItem.prototype.iterateAnchors = function(callback) {
};

MTOItem.prototype.handleMousedown = function(callback) {
};

MTOItem.prototype.handleMousemouve = function(callback) {
};

module.exports = MTOItem;
