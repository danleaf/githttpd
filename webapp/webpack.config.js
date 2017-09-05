var webpack = require('webpack');

module.exports = {

    entry: './app.ts',

    output: {
        filename: 'app.js',
        path: __dirname
    },

    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js']
    },

    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' },
            { test: /\.tsx$/, loader: 'ts-loader' }
        ]
    },

    externals: {
        jquery: 'window.$'
    },

    devtool: 'source-map',

    plugins: [
        //new webpack.optimize.UglifyJsPlugin({ compress: { warnings: true }, sourceMap: true })
    ]
}
