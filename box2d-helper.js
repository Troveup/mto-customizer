
var Box2D = require('box2d');

function Box2DHelper() {
    this.world = null;
    this.bodies = [];
}

Box2DHelper.prototype.init = function() {
    var earthGravity = new Box2D.b2Vec2( 0.0, -9.8 );
    this.world = new Box2D.b2World( earthGravity );

    this.bodyDef = new Box2D.b2BodyDef();

    this.fixtureDef = new Box2D.b2FixtureDef();
    this.fixtureDef.set_density( 1.0 );
    this.fixtureDef.set_friction( 0.5 );
}

Box2DHelper.prototype.createBox = function(x, y, width, height, type) {
    this.bodyDef.set_position( new Box2D.b2Vec2( x, y ) );
    if (type == 'static') {
        this.bodyDef.set_type(Box2D.b2_staticBody);
    } else {
        this.bodyDef.set_type(Box2D.b2_dynamicBody);
    }
    
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(width / 2, height / 2);
    this.fixtureDef.set_shape( shape );

    var newBody = world.CreateBody(this.bodyDef);
    newBody.CreateFixture( this.fixtureDef );
    this.bodies.push( newBody );

    return newBody;
}

Box2DHelper.prototype.summarize = function(body) {
    var bpos = body.GetPosition();
    return {
        x: bpos.get_x(),
        y: bpos.get_y(),
        angle: body.GetAngle()
    };
}

Box2DHelper.prototype.tick = function(dt) {
    this.world.Step(dt, 2, 2);

    // is this necessary?
    //this.world.ClearForces();
}

