
var Box2D = require('box2d');

function Box2DHelper() {
    this.world = null;
    this.bodies = [];
}

Box2DHelper.prototype.init = function() {
    this.world = null;
}

Box2DHelper.prototype.createBox = function(x, y, width, height, type) {
    var newBody = null;
    this.bodies.push( newBody );
}

Box2DHelper.prototype.tick = function(dt) {
}
