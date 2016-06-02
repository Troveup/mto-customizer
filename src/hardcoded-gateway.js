
var linkWidth = 112 / 60;
var linkHeight = 350 / 60;
var anchorOffsetDist = 2.3;

module.exports = {
    chain: {
        'single': {
            type: 'chain',
            key: 'single',
            imgURL: "/demo-chain.png",
            width: 60,
            height: 80,
            anchors: [ 0.75, -15.5 ]
        },
        'double': {
            type: 'chain',
            key: 'double',
            imgURL: "/demo-chain.png",
            width: 60,
            height: 80,
            anchors: [ -2, -15.5, 2, -15.5 ]
        }
    },
    charm: {
        'debug-link': {
            type: 'charm',
            key: 'debug-link',
            imgURL: "/directed-charm-link.png",
            width: linkWidth,
            height: linkHeight,
            anchors: [ 0, anchorOffsetDist, 0, -anchorOffsetDist ]
        },
        'link': {
            type: 'charm',
            key: 'link',
            imgURL: "/charm-link.png",
            width: linkWidth,
            height: linkHeight,
            anchors: [ 0, anchorOffsetDist, 0, -anchorOffsetDist ]
        },
        'splitter': {
            type: 'charm',
            key: 'splitter',
            imgURL: "/charm-link.png",
            width: linkWidth,
            height: linkHeight,
            anchors: [ -0.75, 0, 0.75, 2, 0.75, 0, 0.75, -2 ]
        }
    }
};

