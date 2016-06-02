
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
        'dev-simple-link': {
            type: 'charm',
            key: 'dev-simple-link',
            imgURL: "/charm-link.png",
            width: 1.866666666666667,
            height: 5.833333333333333,
            anchors: [ 0, 2.3, 0, -2.3 ]
        },
        'dev-directed-link': {
            type: 'charm',
            key: 'dev-directed-link',
            imgURL: "/directed-charm-link.png",
            width: 1.866666666666667,
            height: 5.833333333333333,
            anchors: [ 0, 2.3, 0, -2.3 ]
        },
        'splitter': {
            type: 'charm',
            key: 'splitter',
            imgURL: "/charm-link.png",
            width: 1.866666666666667,
            height: 5.833333333333333,
            anchors: [ -0.75, 0, 0.75, 2, 0.75, 0, 0.75, -2 ]
        }
    }
};

