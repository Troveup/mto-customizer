
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
    this.wrappedCanvas.centerOrigin();

    this.selectedCharm = null;
    this.groundBody = null;

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

/*MTOItem.prototype.testDangle = function() {

    this.roofBody = this.physics.createBox(roofX, roofY, 0, oblongWidth, oblongHeight, 'static');
    this.groundBody = this.physics.createBox(groundX, groundY, 0, oblongWidth, oblongHeight, 'static');

    this.testLinkCharms = [];

    var anchorOffsetDist = 46;
    var linkWidth = 112 / 3;
    var linkHeight = 350 / 3;

    var that = this;
    function createAndAttachLink(lastBody, lastAnchorOffset) {

        // new link center = lastBody pos + lastAnchorOffset + anchorOffsetDist
        var lastPos = lastBody.GetPosition();
        var newCenter = {
            x: lastPos.get_x() + lastAnchorOffset.get_x(),
            y: lastPos.get_y() + lastAnchorOffset.get_y() - anchorOffsetDist
        };
        //console.log( "Calculated new center: (%s, %s)", newCenter.x, newCenter.y);

        var newCharm = that.spawnCharm(newCenter.x, newCenter.y, anchorOffsetDist);
        var newLinkBody = newCharm.body; // that.physics.createBox(newCenter.x, newCenter.y, 0, linkWidth, linkHeight, 'dynamic');

        //that.logVec("Newly created link position", newCharm.body.GetPosition());

        // add revolute joint attaching last body using parameters, and definition of new body
        var joint_def = new Box2D.b2RevoluteJointDef();
		joint_def.set_bodyA( lastBody );
		joint_def.set_localAnchorA( lastAnchorOffset );
		joint_def.set_bodyB( newLinkBody );
		joint_def.set_localAnchorB( new Box2D.b2Vec2(0, anchorOffsetDist) );

        that.physics.world.CreateJoint(joint_def);

        var newAnchorOffset = new Box2D.b2Vec2(0, -anchorOffsetDist);
        return { newCharm, newLinkBody, newAnchorOffset };
    }

    var lastBody = this.roofBody;
    var lastAnchorOffset = new Box2D.b2Vec2( 0, 0 );

    var NUM_LINKS = 3;
    for (var i = 0; i < NUM_LINKS; i++) {
        var lastBodyPos = lastBody.GetPosition();
        //this.logVec("Previous body position", lastBody.GetPosition());
        //this.logVec("Last anchor offset", lastAnchorOffset);

        var created = createAndAttachLink( lastBody, lastAnchorOffset );
        lastBody = created.newLinkBody;
        lastAnchorOffset = created.newAnchorOffset;
        this.testLinkCharms.push( created.newCharm );
    }
};*/

//MTOItem.prototype.logVec = function(label, boxVec) {
    //console.log("Dumping vec \"%s\": (%s, %s)", label, boxVec.get_x(), boxVec.get_y());
//}

MTOItem.prototype.iterateCharms = function(callback) {
    return this.charmList.map(callback);
};

MTOItem.prototype.render = function() {
    this.wrappedCanvas.clean();

    //this.wrappedCanvas.drawGrid(200, 200, 25);

    this.iterateCharms(function(charm) {
        this.wrappedCanvas.drawRectangle(charm.pos.x, charm.pos.y, charm.angleInRadians, charm.width+2, charm.height+2, 'black');
        this.wrappedCanvas.drawRectangle(charm.pos.x, charm.pos.y, charm.angleInRadians, charm.width, charm.height, 'white');
        this.wrappedCanvas.drawImage(charm.pos.x, charm.pos.y, charm.angleInRadians, charm.width, charm.height, charm.img);
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
}
Charm.prototype.compareAnchors = function(comparison) {
    var lenA = this.anchors.length;
    var lenB = comparison.anchors.length;
    var pointA = new THREE.Vector2();
    var pointB = new THREE.Vector2();
    var overlapDiameter = 10;
    for (var i = 0; i < lenA; i++) {
        for (var j = i; j < lenB; j++) {
            pointA.copy(this.anchors[i].position).add(this.position);
            pointB.copy(comparison.anchors[j].position).add(comparison.position);
            var dist = pointA.distanceTo(pointB);
            if (dist < overlapDiameter) {
                return {
                    hit: true,
                    dist: dist,
                    indexA: i,
                    indexB: j
                }
            }
        }
    }

    return {
        hit: false
    };
}
*/

MTOItem.prototype.iterateAnchors = function(callback) {
};

MTOItem.prototype.handleMousedown = function(callback) {
};

MTOItem.prototype.handleMousemouve = function(callback) {
};

module.exports = MTOItem;
