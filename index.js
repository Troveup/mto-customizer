
var WrappedCanvas = require("./wrapped-canvas.js");
var MTOItem = require("./mto-item.js");
// var Box2DHelper = require("./box2d-helper.js");
// var Anchor = require("./anchor.js");

var necklaceSpec = {
    imgURL: "/resources/img/demo-chain.png",
    position: new THREE.Vector2(300, 50), // in untransformed grid, need to figure out less hacky way for this
    width: 600,
    height: 800,
    lowerAnchor: null //new THREE.Vector2(0, 100)
};

var linkWidth = 112 / 3;
var linkHeight = 350 / 3;

var componentSpecs = [
    {
        imgURL: "/resources/img/charm-link.png",
        position: new THREE.Vector2(-50, 120),
        width: 5,
        height: 5,
        lowerAnchor: new THREE.Vector2(0, 0)
    },
    {
        imgURL: "/resources/img/charm-link.png",
        position: new THREE.Vector2(60, 120),
        width: 5,
        height: 5,
        lowerAnchor: new THREE.Vector2(0, 0)
    },
    {
        imgURL: "/resources/img/charm-link.png",
        position: new THREE.Vector2(-50, 0),
        width: linkWidth,
        height: linkHeight,
        upperAnchor: new THREE.Vector2(0, 46),
        lowerAnchor: new THREE.Vector2(0, -46)
    },
    {
        imgURL: "/resources/img/charm-link.png",
        position: new THREE.Vector2(0, 0),
        width: linkWidth,
        height: linkHeight,
        upperAnchor: new THREE.Vector2(0, 46),
        lowerAnchor: new THREE.Vector2(0, -46)
    },
    {
        imgURL: "/resources/img/charm-link.png",
        position: new THREE.Vector2(50, 0),
        width: linkWidth,
        height: linkHeight,
        upperAnchor: new THREE.Vector2(0, 46),
        lowerAnchor: new THREE.Vector2(0, -46)
    }
];

var item;

var dt, currTime, lastTime = Date.now();

function loop() {
    currTime = Date.now();
    dt = currTime - lastTime;
    lastTime = currTime;

    requestAnimationFrame(loop);
    item.render();
    item.fallTest(dt);
}

function main() {
    item = new MTOItem('canvas', necklaceSpec, componentSpecs);
    item.load().then(function() {
        loop();
    });
}

module.exports = { main };

document.addEventListener('mousedown', function(evt) {
    var mousePos = canv.getTransformedCoords(evt.clientX, evt.clientY);
    console.log(mousePos);
});
