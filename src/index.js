
//var Box2D = require("box2d");
var WrappedCanvas = require("./wrapped-canvas.js");
var MTOItem = require("./mto-item.js");
var CharmDrawer = require("./charm-drawer.js");
var Gateway = require('./gateway.js');
var hardCodedGateway = require('./hardcoded-gateway.js');

var DEG_TO_RAD = Math.PI / 180;

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

// need to figure out a good way to populate this, likely from the DB
var cloudReferences = [
    {
        bucket: 'troveup-dev-private',
        type: 'charm',
        key: 'dev-simple-link',
        version: 1,
        hash: "06610768D189CCCC4C1874B8576DA4A9"
    }
];

var testCanvas;
var gate = new Gateway();
function main() {
    item = new MTOItem('canvas');

    cloudReferences.map(function(cloudRef) {
        gate.load(cloudRef);
    });

    item.setBaseChain(hardCodedGateway['chain']['double']);
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

function deleteSelectedCharm() {
    item.deleteSelectedCharm();
}

function buildDrawer(root, gate) {
    var drawer = new CharmDrawer(root);
    drawer.defineCategory({
        title: 'Chains',
        type: 'chain'
    });

    var chainHash = hardCodedGateway['chain'];
    Object.keys(chainHash).map(function(chainKey) {
        drawer.addTypeEntry('chain', chainHash[chainKey]);
    });

    drawer.registerTypeHandler('chain', function(type, key) {
        item.setBaseChain(hardCodedGateway[type][key]);
    });

    drawer.defineCategory({
        title: 'Charms',
        type: 'charm'
    });

    var charmHash = hardCodedGateway['charm'];
    Object.keys(charmHash).map(function(charmKey) {
        drawer.addTypeEntry('charm', charmHash[charmKey]);
    });
    drawer.registerTypeHandler('charm', function(type, key) {
        item.addCharm(hardCodedGateway[type][key]);
    });
}

module.exports = {
    main,
    writeDebugInfo,
    deleteSelectedCharm,
    buildDrawer
};

