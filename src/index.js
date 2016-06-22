
//var Box2D = require("box2d");
var WrappedCanvas = require("./wrapped-canvas.js");
var MTOItem = require("./mto-item.js");
var CharmDrawer = require("./charm-drawer.js");
var Gateway = require('./gateway.js');
var Overlay = require('./overlay.js');
var styles = require('style!css!./styles.css');

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

var gate = new Gateway(); // TODO: figure out cors issue to resume testing
var overlay;

function main(opts) {
    item = new MTOItem('canvas');

    overlay = new Overlay(opts.overlayContainer);
    overlay.buildHTML();

    var chainPromise = null;
    var promiseList = opts.referenceList.map(function(cloudRef) {
        var loadPromise = gate.load(cloudRef);
        if (cloudRef.refType == 'chain' && !chainPromise) {
            chainPromise = loadPromise;
        }
        return loadPromise;
    });

    if (chainPromise) {
        chainPromise.then(function(chainSpec){
            item.setBaseChain(chainSpec);
        });
    }

    Promise.all(promiseList).then(function(items) {
        if (opts.drawerContainer) {
            buildDrawer(opts.drawerContainer, items);
        }
    });

    canvas.addEventListener('mousedown', function(evt) {
        var hit = item.charmClickQuery(evt);
        if (hit) {
            overlay.displayInstance(item.selectedCharm);
        }
    });
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

function buildDrawer(root, items) {
    console.log(root);
    var drawer = new CharmDrawer(root);

    drawer.defineCategory({
        title: 'Chains',
        type: 'chain'
    });
    drawer.defineCategory({
        title: 'Charms',
        type: 'charm'
    });

    items.map(function(item) {
        drawer.addTypeEntry(item.type, item);
    });

    drawer.registerTypeHandler('charm', function(type, key) {
        gate.get(type, key).then(function(charmDef){
            overlay.displayDefinition(charmDef);
        });
    });

    drawer.registerTypeHandler('chain', function(type, key) {
        gate.get(type, key).then(function(chainDef){
            item.setBaseChain(chainDef);
        });
    });

    overlay.handleCharmDefinition(function(overlayCharmDef) {
        item.addCharm(overlayCharmDef);
    });
    overlay.handleCharmInstanceAction(function(charm) {
        item.deleteSelectedCharm();
    });
}

module.exports = {
    main,
    writeDebugInfo,
    deleteSelectedCharm
};

