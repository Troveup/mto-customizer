
var Box2D = require('box2d');

// realizing this functionality should be a mixin

function Box2DHelper() {
    this.world = null;
    this.bodies = [];
};


Box2DHelper.prototype.init = function() {
    var earthGravity = new Box2D.b2Vec2( 0.0, -9.8 );
    this.world = new Box2D.b2World( earthGravity );

    this.bodyDef = new Box2D.b2BodyDef();

    this.fixtureDef = new Box2D.b2FixtureDef();
    this.fixtureDef.set_density( 1.0 );
    this.fixtureDef.set_friction( 0.5 );
};

Box2DHelper.prototype.createBox = function(x, y, desiredAngle, width, height, type) {
    if (type == 'static') {
        this.bodyDef.set_type(Box2D.b2_staticBody);
    } else {
        this.bodyDef.set_type(Box2D.b2_dynamicBody);
    }
    
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(width / 2, height / 2);
    this.fixtureDef.set_shape( shape );

    var newBody = this.world.CreateBody(this.bodyDef);
    newBody.CreateFixture( this.fixtureDef );

    newBody.SetTransform( new Box2D.b2Vec2( x, y ), desiredAngle );

    this.bodies.push( newBody );

    return newBody;
};

Box2DHelper.prototype.createJoint = function(bodyA, vectorLikeA, bodyB, vectorLikeB) {
    var offsetA = new Box2D.b2Vec2(vectorLikeA.x, vectorLikeA.y);
    var offsetB = new Box2D.b2Vec2(vectorLikeB.x, vectorLikeB.y);

    var joint_def = new Box2D.b2RevoluteJointDef();
    joint_def.set_bodyA( bodyA );
    joint_def.set_localAnchorA( offsetA );
    joint_def.set_bodyB( bodyB );
    joint_def.set_localAnchorB( offsetB );

    return Box2D.castObject( this.world.CreateJoint(joint_def), Box2D.b2RevoluteJoint );
}


Box2DHelper.prototype.summarize = function(body) {
    var bpos = body.GetPosition();
    return {
        x: bpos.get_x(),
        y: bpos.get_y(),
        angle: body.GetAngle()
    };
};

// FIXME: figure out way around extremely long deleta
// watch for the tab losing focus, if it does reset the `lastTime` upon returning to the tab
var timeScale = 1;
console.log("physics running at %s x real time delta", timeScale);
Box2DHelper.prototype.tick = function(dt) {
    var realDeltaInSeconds = dt / 1000;
    var desiredDelta = 1/60;
    this.world.Step(realDeltaInSeconds*timeScale, 2, 2);

    // is this necessary?
    this.world.ClearForces();
};

module.exports = Box2DHelper;

