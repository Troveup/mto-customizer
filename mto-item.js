
var WrappedCanvas = require("./wrapped-canvas.js");
var Charm = require("./charm.js");
var Box2DHelper = require("./box2d-helper.js");

function MTOItem(canvasID, baseSpec, charmSpecList) {
    this.baseChain = new Charm(baseSpec);
    this.charmList = charmSpecList.map(function(spec) {
        return new Charm(spec);
    });

    this.wrappedCanvas = new WrappedCanvas(canvasID);
    this.wrappedCanvas.centerOrigin();

    this.selectedCharm = null;
    this.groundBody = null;

    this.physics = new Box2DHelper();
    this.physics.init();

    // potential ways to store non-linked charms
    //this.looseRoots
    //this.chainList
}

MTOItem.prototype.spawnCharm = function(x, y, anchorOffset) {
    var linkWidth = 112 / 3;
    var linkHeight = 350 / 3;
    var proceduralSpec = {
        imgURL: "/resources/img/charm-link.png",
        position: new THREE.Vector2(x, y),
        rotation: 0,
        width: linkWidth,
        height: linkHeight,
        upperAnchor: new THREE.Vector2(0, anchorOffset),
        lowerAnchor: new THREE.Vector2(0, -anchorOffset)
    };

    var c = new Charm(proceduralSpec);
    c.body = this.physics.createBox(c.pos.x, c.pos.y, c.angleInRadians, c.width, c.height, 'dynamic');
    return c;
}


MTOItem.prototype.timeStep = function(dt) {
    this.physics.tick(dt);
}

var groundX = 0;
var groundY = -200;
var roofX = 0;
var roofY = 200;
var oblongWidth = 600;
var oblongHeight = 10;

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

    this.charmList.map(function(c){
        c.body = this.physics.createBox(c.pos.x, c.pos.y, c.angleInRadians, c.width, c.height, 'dynamic');
    }.bind(this));
};

MTOItem.prototype.testDangle = function() {
    this.roofBody = this.physics.createBox(roofX, roofY, 0, oblongWidth, oblongHeight, 'static');
    this.groundBody = this.physics.createBox(groundX, groundY, 0, oblongWidth, oblongHeight, 'static');

    this.testLinks = [];

    var anchorOffset = 46;
    var lastPos = {
        x: roofX,
        y: roofY - anchorOffset
    };
    var lastBody = this.roofBody;

    var newCharm;
    var numLinks = 3;
    for (var i = 0; i < numLinks; i++) {
        newCharm = this.spawnCharm(lastPos.x, lastPos.y, anchorOffset);

        newCharm.upperAnchor

        this.testLinks.push( newCharm );
        lastPos.y -= 2 * anchorOffset;
    }
};

MTOItem.prototype.iterateCharms = function(callback) {
    return this.charmList.map(callback);
};

MTOItem.prototype.render = function() {
    this.wrappedCanvas.clean();
    this.drawCharms();
    this.drawGround();

};

MTOItem.prototype.drawGround = function() {
    var g = this.physics.summarize(this.groundBody);
    this.wrappedCanvas.drawRectangle(g.x, g.y, g.angle, oblongWidth, oblongHeight, 'black');
};

MTOItem.prototype.syncPhysics = function() {
    this.iterateCharms(function(charm) {
        var physData = this.physics.summarize(charm.body);
        charm.pos.x = physData.x;
        charm.pos.y = physData.y;
        charm.angleInRadians = physData.angle;
    }.bind(this));
};

MTOItem.prototype.drawCharms = function() {
    if (this.testLinks) {
        this.testLinks.map(function(charm) {
            console.log("Debug pos: ", charm.pos);
            this.wrappedCanvas.drawRectangle(charm.pos.x, charm.pos.y, charm.angleInRadians, charm.width+2, charm.height+2, 'black');
            this.wrappedCanvas.drawRectangle(charm.pos.x, charm.pos.y, charm.angleInRadians, charm.width, charm.height, 'white');
        }.bind(this));
        return;
    }

    this.iterateCharms(function(charm) {
        this.wrappedCanvas.drawRectangle(charm.pos.x, charm.pos.y, charm.angleInRadians, charm.width+2, charm.height+2, 'black');
        this.wrappedCanvas.drawRectangle(charm.pos.x, charm.pos.y, charm.angleInRadians, charm.width, charm.height, 'white');
        this.wrappedCanvas.drawImage(charm.pos.x, charm.pos.y, charm.angleInRadians, charm.width, charm.height, charm.img);
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
