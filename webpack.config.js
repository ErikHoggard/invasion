const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/main.ts',
    devtool: false,
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: 'bundle.js.map',
            exclude: ['vendor.js']
        })
    ],
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }, ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        sourceMapFilename: "./bundle.js.map",
        devtoolLineToLine: true,
        pathinfo: true,
        path: `${__dirname}/dist`,
    },
};