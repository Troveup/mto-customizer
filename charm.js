
function Charm(spec) {
    this.imgURL = spec.imgURL;
    this.pos = spec.position;
    this.width = spec.width;
    this.height = spec.height;
    this.anchors = {};
    this.angleInRadians = spec.rotation || 0;

    if (spec.upperAnchor) {
        this.anchors.upper = {
            // debugStyle: anchorColors['normal'],
            offset: spec.upperAnchor,
            attachedComponent: null
        }
    }

    if (spec.lowerAnchor) {
        this.anchors.lower = {
            // debugStyle: anchorColors['normal'],
            offset: spec.lowerAnchor,
            attachedComponent: null
        }
    }

    //this.setStatus('normal');
}

//Component.prototype.getGlobalAnchorPos = function(index) {
    //return {
        //x: this.anchors[index].position.x + this.position.x,
        //y: this.anchors[index].position.y + this.position.y
    //}
//};
//Component.prototype.setStatus = function(newStatus) {
    //this.style = charmColors[newStatus];
//}
//Component.prototype.translateChain = function(x, y) {
    //this.position.x += x;
    //this.position.y += y;

    //var hangingPiece = this.anchors.lower.attachedComponent;
    //if (hangingPiece) {
        //hangingPiece.translateChain(x, y);
    //}
//}


Charm.prototype.loadAssets = function() {
    var that = this;

    return new Promise(function(resolve, reject){
        var img = new Image()
        img.onload = function(){
            resolve(that.imgURL)
        }
        img.onerror = function(){
            reject(that.imgURL)
        }

        img.src = that.imgURL
        that.img = img;
    });
}


Charm.prototype.hitCheck = function(checkPos) {
    var hx = this.width / 2;
    var hy = this.height / 2;
    var minX = this.pos.x - hx;
    var maxX = this.pos.x + hx;
    var minY = this.pos.y - hy;
    var maxY = this.pos.y + hy

    var miss = { hit: false };
    if (checkPos.x < minX) return miss;
    if (checkPos.x > maxX) return miss;
    if (checkPos.y < minY) return miss;
    if (checkPos.y > maxY) return miss;

    // TODO: use only Box2D vectors
    var center = this.pos.clone();
    var displacement = new THREE.Vector2(checkPos.x, checkPos.y).sub(center);

    return {
        hit: true,
        dist: displacement.length()
    };
}

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
}


// these functions have to do with non-physical means of specifying change in location
Charm.prototype.moveTo = function(x, y) {
    this.pos.set(x, y);
}

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
