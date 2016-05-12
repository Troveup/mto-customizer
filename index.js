
var Charm = require("./charm.js");
var WrappedCanvas = require("./wrapped-canvas.js");
var MTOItem = require("./mto-item.js");
var Box2DHelper = require("./box2d-helper.js");
var Anchor = require("./anchor.js");

var necklaceSpec = {
    imgURL: "/resources/img/demo-chain.png",
    position: new THREE.Vector2(300, 50), // in untransformed grid, need to figure out less hacky way for this
    width: 600,
    height: 800,
    lowerAnchor: null //new THREE.Vector2(0, 100)
};

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

function main() {
    var item = new MTOItem();

    console.log(Charm);
    console.log(WrappedCanvas);
    console.log(MTOItem );
    console.log(Box2DHelper );
    console.log(Anchor );
}

module.exports = { main };

