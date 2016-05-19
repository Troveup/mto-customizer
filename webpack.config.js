var path = require('path');

module.exports = {
    entry: './src/index.js',
    target: 'web',
    output: {
        path: path.resolve('build'),
        publicPath: '/assets/',
        library: 'MTO',
        filename: 'MTO.js'
    },
    module: {
        loaders: [
            {
                test: /.js%/,
                loader: 'babel-loader'
            }
        ]
    },
    externals: {
        box2d: 'Box2D'
    }
};
