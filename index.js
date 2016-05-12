

var Box2D = require('box2d');

// Import the basic Box2D libraries
var b2Vec2 = Box2D.b2Vec2
  , b2AABB = Box2D.b2AABB
  ,	b2BodyDef = Box2D.b2BodyDef
  ,	b2Body = Box2D.b2Body
  ,	b2FixtureDef = Box2D.b2FixtureDef
  ,	b2Fixture = Box2D.b2Fixture
  ,	b2World = Box2D.b2World
  ,	b2PolygonShape = Box2D.b2PolygonShape
  ,	b2CircleShape = Box2D.b2CircleShape
  // ,	b2DebugDraw = Box2D.b2DebugDraw
  , b2MouseJointDef =  Box2D.b2MouseJointDef
  , b2RevoluteJointDef =  Box2D.b2RevoluteJointDef
  // , b2BuoyancyController = Box2D.b2BuoyancyController
  ;
  

// Box2d world
var world = null;

// Pixel to Meter ratio
var PTM_RATIO = 30.0;

// Position on mouse in b2d_world
var mouse_pos = {x: 0, y:0};

// Flag to check if the mouse is pressed
var mouse_pressed = false;

// Mouse joint for when moving the chain
var mouse_joint = false;

// Reference to the ceiling body
var ceiling;


function createBox(w, h, x, y, type){
	// Create the fixture definition
	var fixDef = new b2FixtureDef();
	
	fixDef.set_density = 1.0;	// Set the density
	fixDef.set_friction = 1.0;	// Set the friction
	fixDef.set_restitution = 0.1;	// Set the restitution - bounciness 
	
	// Define the shape of the fixture
    var shape = new b2PolygonShape();
	shape.SetAsBox(
        w // input should be half the width
        , h // input should be half the height
	);
	fixDef.set_shape( shape );
    
    // Create the body definition
	var bodyDef = new b2BodyDef();
	bodyDef.set_type( type );
	
	// Set the position of the body
    var posVector = new Box2D.b2Vec2(x, y);
    bodyDef.set_position(posVector);

	// Damping reduces the velocity of bodies in the world,
	// like simulating moving through air.
	// This is important to make the chain eventually stop 
	// moving.
    bodyDef.set_linearDamping( 0.1 ); 
    bodyDef.set_angularDamping( 0.2 );
   
	// Create the body in the box2d world
	var b = world.CreateBody(bodyDef);
	b.CreateFixture(fixDef);
   
	return b;
}

//function setDebugDraw(w){
    //if(world !== null) {
        //var debugDraw = new Box2D.JSDraw();

        //debugdraw.setsprite(document.getelementbyid("canvas").getcontext("2d"));
        //debugdraw.setdrawscale(ptm_ratio); // set draw scale
        //debugdraw.setfillalpha(0.3);
        //debugdraw.setlinethickness(1.0);
        //debugdraw.setflags(b2debugdraw.e_shapebit | b2debugdraw.e_jointbit);
    
        //// set debug draw to the world
        //w.SetDebugDraw(debugDraw); 
    //}
//}


function getBodyAtMouse(includeStatic){
	var mouse_p = new b2Vec2(mouse_pos.x, mouse_pos.y);
	var sensitivity_offset = 0.001;

	aabb = new b2AABB();
	aabb.get_lowerBound().Set(mouse_p.x - sensitivity_offset, 
						mouse_p.y - sensitivity_offset);
						
	aabb.get_upperBound().Set(mouse_p.x + sensitivity_offset, 
						mouse_p.y + sensitivity_offset);

	var body = null;
	
	// Query the world for overlapping shapes.
    var myQueryCallback = new Box2D.JSQueryCallback();
    myQueryCallback.ReportFixture = function(fixturePtr) {
        var fixture = Box2D.wrapPointer( fixturePtr, b2Fixture );
        var shape = fixture.GetShape();

        if (fixture.GetBody().GetType() != Box2D.b2_staticBody || includeStatic) {
            var transform = fixture.GetBody().GetTransform();
            var inside = shape.TestPoint(transform, mouse_p);

            if (inside) {
                body = fixture.GetBody();
                return true;
            }
        }

        return false;
    };
    myQueryCallback.m_fixture = null;
    myQueryCallback.m_point = mouse_p;

    if ( myQueryCallback.m_fixture ) {
        console.log(myQueryCallback.m_fixture);
        //do something with the fixture that was clicked
    }

    world.QueryAABB( myQueryCallback, aabb );

	//world.QueryAABB(function(fixture) {
        //var shape = fixture.GetShape();

        //if (fixture.GetBody().GetType() != Box2D.b2_staticBody || includeStatic) {
            //var transform = fixture.GetBody().GetTransform();
            //var inside = shape.TestPoint(transform, mouse_p);

            //if (inside) {
                //body = fixture.GetBody();
                //return true;
            //}
        //}

        //return false;
    //}, aabb);
	
	return body;
}

function getMousePos(src_elem, event){
	var totalOffsetX = 0;
	var totalOffsetY = 0;
	var x_pos = 0;
	var y_pos = 0;
	var currElement = src_elem;
	// console.log(src_elem);

	// IE, Chrome
	if(event.offsetX !== undefined && event.offsetY !== undefined) {
		x_pos = event.offsetX;
		y_pos = event.offsetY;
	}

	// Firefox

	else {
		do{
			totalOffsetX += currElement.offsetLeft - currElement.scrollLeft;
			totalOffsetY += currElement.offsetTop - currElement.scrollTop;
		}
		while(currElement = currElement.offsetParent)

		x_pos = event.pageX - totalOffsetX - document.body.scrollLeft; 
		y_pos = event.pageY - totalOffsetY - document.body.scrollTop;
	}
	
	return {x: x_pos / PTM_RATIO, y: y_pos / PTM_RATIO};
}

function init() {
	world = new b2World(
		  new b2Vec2(0, 10)    //gravity
	   ,  true                 //allow sleep
	);
	
	var canvas = document.getElementById('canvas');
	canvas_width_m = canvas.offsetWidth / PTM_RATIO;
	canvas_height_m = canvas.offsetHeight / PTM_RATIO;
	
	ceiling = createBox(canvas_width_m/2, 0.5, canvas_width_m/2, 0.5, Box2D.b2_staticBody);       
	//create chain
	var chain_length = 0.5;
	var last_link = ceiling;
	var last_anchor_point = new b2Vec2(0,0);
	var joint_def = new b2RevoluteJointDef();
	
	// The chain will have 6 links
	for(var i = 0; i <= 12; i++){
		var link = createBox(0.15, 
							 chain_length, 
							 canvas_width_m/2, 
							 chain_length + i*chain_length*2, 
							 Box2D.b2_dynamicBody);
	   
		joint_def.set_bodyA( last_link );
		joint_def.set_bodyB( link );
		
		// Now define the anchor points. These are points on bodyA and
		// bodyB specified as a b2Vec2, where the x values is the 
		// offset in the x-axis from the middle of the object, and 
		// the y value is the vertical offset. As an example, 
		// the localAnchorB is horizontally centered on the link body, 
		// bodyB, and at the -75% of the chain length towards bodyA.
		// This creates an overlap between the chain links. 
		
		joint_def.set_localAnchorA( last_anchor_point );
		joint_def.set_localAnchorB( new b2Vec2(0, -.75*chain_length) );
	   
		last_anchor_point = new b2Vec2(0, .75*chain_length);
	   
		world.CreateJoint(joint_def);
		last_link = link;
	}
	
	var weight = createBox(1, 
						 0.2, 
						 canvas_width_m/2, 
						 // If you're wondering where the 0.7 comes from 
						 // below, it's:
						 // 0.5 (ceiling height) + 0.2 (weight height) = 0.7
						 chain_length + i*chain_length*2 + 0.7, 
						 Box2D.b2_dynamicBody);
	joint_def.set_bodyA( last_link );
	joint_def.set_bodyB( weight );
	joint_def.set_localAnchorA( last_anchor_point );
	joint_def.set_localAnchorB( new b2Vec2(0, -0.2) );
	
	joint_def.set_enableLimit( true );
	joint_def.set_lowerAngle( -1 * Math.PI/4 );
	joint_def.set_upperAngle( Math.PI/4 );
	
	world.CreateJoint(joint_def);

	//setup debug draw
    //setDebugDraw(world)
	
	canvas.addEventListener('mousemove', function(e) {
		   mouse_pos = getMousePos(this, e);
		   b2d_pos = new b2Vec2(mouse_pos.x, mouse_pos.y)
		   
		   if(mouse_pressed && !mouse_joint) {
			   var body = getBodyAtMouse();
			   if(body) {
					// create the mouse joint
					var def = new b2MouseJointDef();
			
					// joints need two bodies, in the case of
					// mouse joints bodyA can be *any* body in
					// the world. I would use some static body.
					// It is not allowed to be null or undefined.
					def.set_bodyA( ceiling );
					def.set_bodyB( body );
					def.set_target( b2d_pos );
				   
					// disable collision detection between
					// connected bodies
					def.set_collideConnected( false );
				   
					// set the max for that can be exerted 
					// on the body based on the bodies mass
					def.set_maxForce( 1000 * body.GetMass() );
				   
					// Prevent oscillating
					def.set_dampingRatio( 1 );
			
					// create the mouse joint in the world
					mouse_joint = world.CreateJoint(def);
			
					// Wake up a body in case it is sleeping
					//body.SetAwake(false);
			   }
		   }
	
		   if(mouse_joint)
		   {
			   mouse_joint.SetTarget(b2d_pos);
		   }
	}, false);
	
	canvas.addEventListener('mousedown', function(e){
		mouse_pressed = true;
	}, false);
	
	canvas.addEventListener('mouseup', function(e){
		   mouse_pressed = false;
		   
		   if(mouse_joint){
			   world.DestroyJoint(mouse_joint);
			   mouse_joint = false;
		   }
	}, false);

	window.setInterval(update, 1000 / 60);
	
};

function update() {
   world.Step(
		 1 / 60   //frame-rate
	  ,  10       //velocity iterations
	  ,  10       //position iterations
   );
  
   world.DrawDebugData();
   world.ClearForces();
};

module.exports = {
    main: init
}
