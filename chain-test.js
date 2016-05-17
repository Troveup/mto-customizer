
// NOTICE: this code may not work with the latest api, it is meant to be an example for using joints

MTOItem.prototype.testDangle = function() {

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
};
