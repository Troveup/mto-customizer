
var Anchor = require('./anchor.js');
var Box2D = require('box2d');

function createGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

function Charm(spec) {
    this.key = createGUID(); // think of better method...
    this.imgURL = spec.imgURL;
    this.pos = spec.position.clone();
    this.width = spec.width;
    this.height = spec.height;
    this.angleInRadians = spec.rotation || 0;

    // invariant: `parentAnchor` should be cleared if not connecting to a parent charm anchor
    this.parentAnchor = null;

    this.anchors = Object.create(null);
    var anchorSpecs = spec.anchors || [];
    anchorSpecs.map(function(anchorSpec) {
        anchorSpec.key = anchorSpec.offset.x + "," + anchorSpec.offset.y;
        this.anchors[anchorSpec.key] = new Anchor(anchorSpec, this);
    }.bind(this));

    this.body = null; // set by containing item
    this.status = 'normal';
}

Charm.prototype.toString = function() {
    return "Charm at [ "+ this.pos.x +", "+ this.pos.y +" ]";
}

Charm.prototype.halt = function() {
    this.body.SetGravityScale(0);
    this.body.SetLinearVelocity( Box2D.b2Vec2( 0, 0) );
    this.body.SetAngularVelocity( 0 );
};

Charm.prototype.resume = function() {
    //this.selectedCharm.status = 'normal';
    this.body.SetGravityScale(1);
};

Charm.prototype.translate = function(oldPhys, dx, dy) {
    var b2Pos = new Box2D.b2Vec2( oldPhys.x + dx, oldPhys.y + dy);
    this.body.SetTransform( b2Pos, oldPhys.angle );
};

Charm.prototype.moveTo = function(x, y) {
    var b2Pos = new Box2D.b2Vec2( x, y );
    this.body.SetTransform( b2Pos, this.body.GetAngle() );
};

Charm.prototype.loadAssets = function() {
    var that = this;

    return new Promise(function(resolve, reject){
        var img = new Image()
        img.onload = function(){
            resolve(that)
        }
        img.onerror = function(){
            reject(that)
        }

        img.src = that.imgURL
        that.img = img;
    });
};

var upFromScreen = new THREE.Vector3(0, 0, 1);
Charm.prototype.hitCheck = function(checkPos) {
    var hx = this.width / 2;
    var hy = this.height / 2;
    var minX = this.pos.x - hx;
    var maxX = this.pos.x + hx;
    var minY = this.pos.y - hy;
    var maxY = this.pos.y + hy;

    // to transform rectangular region with known rotation and width x height to centered
    // translate by negative position, rotate by negative angle, translate back by position
    var checkCenterOffset = new THREE.Vector3(checkPos.x - this.pos.x, checkPos.y - this.pos.y, 0); // apparently 2D vecs don't need to rotate
    checkCenterOffset.applyAxisAngle( upFromScreen, -this.angleInRadians );
    checkCenterOffset.add( this.pos );

    var miss = { hit: false };
    if (checkCenterOffset.x < minX) return miss;
    if (checkCenterOffset.x > maxX) return miss;
    if (checkCenterOffset.y < minY) return miss;
    if (checkCenterOffset.y > maxY) return miss;

    // TODO: use only Box2D vectors
    var center = this.pos.clone();
    var displacement = new THREE.Vector2(checkPos.x, checkPos.y).sub(center);

    return {
        hit: true,
        dist: displacement.length(),
        offset: displacement
    };
};

// pass callback of form
// fn(anchor, isParent)
Charm.prototype.eachAnchor = function(fn) {
    Object.keys(this.anchors).map(function(anchorKey) {
        var anchor = this.anchors[anchorKey];
        fn(anchor, anchor == this.parentAnchor);
    }.bind(this));
};

// TODO: es6 changes
Charm.prototype.compareAnchors = function(comparison) {
    var lenA = this.anchors.length;
    var lenB = comparison.anchors.length;
    var pointA = new THREE.Vector2();
    var pointB = new THREE.Vector2();
    var cutoffRadius = 10;
    for (var i = 0; i < lenA; i++) {
        for (var j = i; j < lenB; j++) {
            pointA.copy(this.anchors[i].position).add(this.position);
            pointB.copy(comparison.anchors[j].position).add(comparison.position);
            var dist = pointA.distanceTo(pointB);
            if (dist < cutoffRadius) {
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
};

// these functions have to do with non-physical means of specifying change in location
Charm.prototype.transitionTo = function(x, y, duration) {
    this.transitionActive = true;

    this.transitionStart = Date.now();
    this.duration = duration;

    this.startPos = this.pos.clone();
    this.endPos = new THREE.Vector2(x, y);
}

Charm.prototype.syncTransition = function() {
    if (!this.transitionActive) {
        return;
    }

    var progress = (Date.now() - this.transitionStart) / this.duration;
    if (progress >= 1) {
        this.transitionActive = false;
        return;
    }

    this.pos.lerpVectors(this.startPos, this.endPos, progress);
}
// end of non-physical location manipulation 

module.exports = Charm;
