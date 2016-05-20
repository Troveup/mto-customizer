
//var Box2D = require("box2d");
var WrappedCanvas = require("./wrapped-canvas.js");
var MTOItem = require("./mto-item.js");

var roofX = 0;
var roofY = 29.5;
var oblongWidth = 60;
var oblongHeight = 1;

var necklaceSpec = {
    imgURL: "/demo-chain.png",
    position: new THREE.Vector2(roofX, roofY), // in untransformed grid, need to figure out less hacky way for this
    width: oblongWidth,
    height: oblongHeight,
    anchors: [
        { offset: new THREE.Vector2(-5, -1) },
        { offset: new THREE.Vector2(5, -1) }
    ]
};

var linkWidth = 112 / 30;
var linkHeight = 350 / 30;

var anchorOffsetDist = 4.6;

var DEG_TO_RAD = Math.PI / 180;
var componentSpecs = [
    {
        imgURL: "/directed-charm-link.png",
        position: new THREE.Vector2(-5, 0),
        width: linkWidth,
        height: linkHeight,
        anchors: [
            { offset: new THREE.Vector2(0, anchorOffsetDist) },
            { offset: new THREE.Vector2(0, -anchorOffsetDist) }
        ]
    },
    {
        imgURL: "/directed-charm-link.png",
        position: new THREE.Vector2(0, 0),
        rotation: 45 * DEG_TO_RAD,
        width: linkWidth,
        height: linkHeight,
        anchors: [
            { offset: new THREE.Vector2(0, anchorOffsetDist) },
            { offset: new THREE.Vector2(0, -anchorOffsetDist) }
        ]
    },
    {
        imgURL: "/directed-charm-link.png",
        position: new THREE.Vector2(5, 0),
        width: linkWidth,
        height: linkHeight,
        anchors: [
            { offset: new THREE.Vector2(0, anchorOffsetDist) },
            { offset: new THREE.Vector2(0, -anchorOffsetDist) }
        ]
    },
    {
        imgURL: "/directed-charm-link.png",
        position: new THREE.Vector2(7, 0),
        width: linkWidth,
        height: linkHeight,
        anchors: [
            { offset: new THREE.Vector2(0, anchorOffsetDist) },
            { offset: new THREE.Vector2(0, -anchorOffsetDist) }
        ]
    }
];

var item;
var dt, currTime, lastTime = Date.now();
function loop() {
    requestAnimationFrame(loop);

    currTime = Date.now();
    dt = currTime - lastTime;
    lastTime = currTime;

    item.stepPhysics(dt);
    item.render();
}

var testCanvas;
function main() {
    item = new MTOItem('canvas', necklaceSpec, componentSpecs);
    item.loadAssets().then(function() {
        canvas.addEventListener('mousedown', item.handleMousedown.bind(item));
        canvas.addEventListener('mouseup', item.handleMouseup.bind(item));
        canvas.addEventListener('mousemove', item.handleMousemove.bind(item), false);
        item.addCharmsToSim();
        loop();
    });
}

function writeDebugInfo(root, secondsDelay) {
    var debugNode = document.createElement('div');
    debugNode.className = 'debugNode';

    setTimeout(function() {
        var data = item.debugCachedAnchors();
        debugNode.innerHTML = data;

        root.appendChild(debugNode);
    }, secondsDelay*1000);
}

module.exports = { main, writeDebugInfo };

