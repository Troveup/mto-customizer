
var linkWidth = 112 / 60;
var linkHeight = 350 / 60;
var anchorOffsetDist = 2.3;

module.exports = {
    chain: {
        'single': {
            type: 'chain',
            key: 'single',
            imgURL: "/demo-chain.png",
            position: new THREE.Vector2(0, 25),
            width: 60,
            height: 80,
            anchors: [
                { offset: new THREE.Vector2(0.75, -15.5) }
            ]
        },
        'double': {
            type: 'chain',
            key: 'double',
            imgURL: "/demo-chain.png",
            position: new THREE.Vector2(0, 25),
            width: 60,
            height: 80,
            anchors: [
                { offset: new THREE.Vector2(-2, -15.5) },
                { offset: new THREE.Vector2(2, -15.5) }
            ]
        }
    },
    charm: {
        'debug-link': {
            type: 'charm',
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
        'link': {
            type: 'charm',
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
        'splitter': {
            type: 'charm',
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
    }
};

