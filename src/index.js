
//var Box2D = require("box2d");
var WrappedCanvas = require("./wrapped-canvas.js");
var MTOItem = require("./mto-item.js");
var CharmDrawer = require("./charm-drawer.js");

var necklaceOptions = [
    {
        key: 'Single',
        imgURL: "/demo-chain.png",
        position: new THREE.Vector2(0, 25),
        width: 60,
        height: 80,
        anchors: [
            { offset: new THREE.Vector2(0.75, -15.5) }
        ]
    },
    {
        key: 'Double',
        imgURL: "/demo-chain.png",
        position: new THREE.Vector2(0, 25),
        width: 60,
        height: 80,
        anchors: [
            { offset: new THREE.Vector2(-2, -15.5) },
            { offset: new THREE.Vector2(2, -15.5) }
        ]
    }
];

var DEG_TO_RAD = Math.PI / 180;

var linkWidth = 112 / 60;
var linkHeight = 350 / 60;
var anchorOffsetDist = 2.3;
var charmTypeSpecs = [
    {
        key: 'debug-link',
        imgURL: "/directed-charm-link.png",
        position: new THREE.Vector2(0, 0),
        width: linkWidth,
        height: linkHeight,
        anchors: [
            { offset: new THREE.Vector2(0, anchorOffsetDist) },
            { offset: new THREE.Vector2(0, -anchorOffsetDist) }
        ]
    },
    {
        key: 'link',
        imgURL: "/charm-link.png",
        position: new THREE.Vector2(0, 0),
        width: linkWidth,
        height: linkHeight,
        anchors: [
            { offset: new THREE.Vector2(0, anchorOffsetDist) },
            { offset: new THREE.Vector2(0, -anchorOffsetDist) }
        ]
    },
    {
        key: 'splitter',
        imgURL: "/charm-link.png",
        position: new THREE.Vector2(0, 0),
        width: linkWidth,
        height: linkHeight,
        anchors: [
            { offset: new THREE.Vector2(-0.75, 0) },
            { offset: new THREE.Vector2(0.75, 2) },
            { offset: new THREE.Vector2(0.75, 0) },
            { offset: new THREE.Vector2(0.75, -2) }
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

    if (item.draggingCharm) {
        item.syncDragged();
    }

    item.stepPhysics(dt);
    item.render();
}

var activeChainIndex = 0;
function toggleBaseChain() {
    var currentChainSpec = necklaceOptions[activeChainIndex];
    item.setBaseChain(currentChainSpec);
    activeChainIndex = (activeChainIndex + 1) % necklaceOptions.length;
}

var testCanvas;
function main() {
    item = new MTOItem('canvas');

    toggleBaseChain();
    canvas.addEventListener('mousedown', item.handleMousedown.bind(item));
    canvas.addEventListener('mouseup', item.handleMouseup.bind(item));
    canvas.addEventListener('mousemove', item.handleMousemove.bind(item), false);
    loop();
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

// add new charm definitions here
function addNewCharm(index) {
    item.addCharm(charmTypeSpecs[index]);
}

function deleteSelectedCharm() {
    item.deleteSelectedCharm();
}

// charm def 

function testDrawer(root) {
    var drawer = new CharmDrawer(root);

    drawer.defineCategory({
        title: 'Chains',
        type: 'chain'
    });
    necklaceOptions.map(function(chainDef) {
        drawer.addTypeEntry('chain', chainDef);
    });

    drawer.defineCategory({
        title: 'Charms',
        type: 'charm'
    });
    charmTypeSpecs.map(function(charmDef) {
        drawer.addTypeEntry('charm', charmDef);
    });

    drawer.registerTypeHandler('chain', function(key) {
        console.log(`clicked chain ${key}`);
    });

    drawer.registerTypeHandler('charm', function(key) {
        console.log(`clicked charm ${key}`);
    });
}

module.exports = {
    main,
    writeDebugInfo,
    addNewCharm,
    deleteSelectedCharm,
    toggleBaseChain,
    testDrawer
};

