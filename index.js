
//var Box2D = require("box2d");
var WrappedCanvas = require("./wrapped-canvas.js");
var MTOItem = require("./mto-item.js");

var necklaceSpec = {
    imgURL: "/resources/img/demo-chain.png",
    position: new THREE.Vector2(300, 50), // in untransformed grid, need to figure out less hacky way for this
    width: 600,
    height: 800,
    anchors: [
        { offset: new THREE.Vector2(-50, 0) },
        { offset: new THREE.Vector2(50, 0) }
    ]
};

var linkWidth = 112 / 3;
var linkHeight = 350 / 3;

var DEG_TO_RAD = Math.PI / 180;
var componentSpecs = [
    {
        imgURL: "/resources/img/charm-link.png",
        position: new THREE.Vector2(-50, 0),
        width: linkWidth,
        height: linkHeight,
        anchors: [
            { offset: new THREE.Vector2(0, 46) },
            { offset: new THREE.Vector2(0, -46) }
        ]
    },
    {
        imgURL: "/resources/img/charm-link.png",
        position: new THREE.Vector2(0, 0),
        rotation: 45 * DEG_TO_RAD,
        width: linkWidth,
        height: linkHeight,
        anchors: [
            { offset: new THREE.Vector2(0, 46) },
            { offset: new THREE.Vector2(0, -46) }
        ],
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
        item.addCharmsToSim();
        loop();
    });
}

canvas.addEventListener('mousedown', function(evt) {
    var mousePos = item.wrappedCanvas.getTransformedCoords(evt.clientX, evt.clientY);

    var closestDist = Infinity;
    item.charmList.map(function(charm) {
        var result = charm.hitCheck(mousePos);
        if (result.hit) {
            if (!item.selectedCharm || result.dist < closestDist) {
                item.selectedCharm = charm;
                closestDist = result.dist;
            }
        }
    });

    if (item.selectedCharm) {
        console.warn("TODO: implement sortAnchorsBySelectedCharm(), should be two lists");

        // `parentAnchor` should be cleared if not connecting to a parent charm anchor
        var pa = item.selectedCharm.parentAnchor;
        if (pa) {
            pa.attachedAnchor.attachedAnchor = null;
            pa.attachedAnchor = null;
            item.physics.world.DestroyJoint(pa.joint);
            //console.log("TODO: Destroy box2d joint: ", pa.joint);
        }

        item.selectedCharm.status = 'selected';
    }
    console.log("Mousedown, selectedCharm: ", item.selectedCharm);
});

canvas.addEventListener('mouseup', function(evt) {
    if (item.selectedCharm) {
        item.selectedCharm.status = 'normal';
        item.selectedCharm = null;

        console.log("TODO: scan anchors and make connection if detected");
        //var anchorResult = model.anchorScan(item.selectedCharm)
        //if (anchorResult.snap) {
            //item.selectedCharm.anchors.upper.attachedComponent = anchorResult.freshAttachment;
            //anchorResult.lowerAnchor.attachedComponent = item.selectedCharm;

            //item.selectedCharm.translateChain(anchorResult.params.x, anchorResult.params.y)
        //}
    }
    console.log("Mouseup, selectedCharm: ", item.selectedCharm);

});

var oldMousePos;
canvas.addEventListener('mousemove', function(evt) {
    var mousePos = item.wrappedCanvas.getTransformedCoords(evt.clientX, evt.clientY);

    if (item.selectedCharm) {
        var dx = mousePos.x - oldMousePos.x;
        var dy = mousePos.y - oldMousePos.y;

        //console.log("TODO: translate chain (and children until physics catches up?)");

        var oldPhysical = item.physics.summarize(item.selectedCharm.body);
        item.selectedCharm.translate(oldPhysical, dx, dy);

        console.log("TODO: set status of overlapped anchors accordingly (for highlighting)");
        //var anchorResult = model.anchorScan(item.selectedCharm)
        //if (anchorResult.snap) {
            //anchorResult.lowerAnchor.hovered = true;
            //anchorResult.upperAnchor.hovered = true;
        //}
    }
    oldMousePos = mousePos;
}, false);


module.exports = { main };

