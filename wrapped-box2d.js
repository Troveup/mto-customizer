
var Box2D = require('box2d');

export default class WrappedBox2D {
    constructor() {
        this.world = null;
        this.bodies = [];
    }

    init() {
        this.world = null;
    }

    createBox(x, y, width, height, type) {
        var newBody = null;
        this.bodies.push( newBody );
    }

    tick(dt) {
    }
}

