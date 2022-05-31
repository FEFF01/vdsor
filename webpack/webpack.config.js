'use strict'
const path = require('path');

const glob = require("glob");
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    //mode: 'development',
    entry: glob.sync(
        "./js/*.@(js|ts)",
        { nodir: true, realpath: true }
    ).reduce(function (map, path_name) {
        map[`../js/${path.parse(path_name).name}`] = path_name;
        return map;
    }, {}),
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'js/[name].js',
        chunkFilename: 'js/[id].js',
        libraryTarget: "commonjs"
    },
    module: {
        unknownContextCritical: false,
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            /*{
                test: /\.html$/,
                use: [{
                    loader: "html-loader",
                    options: {
                        //attrs: "false"
                    }
                }]
            },*/
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                },
            }],
    },

    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    plugins: [
        //new webpack.optimize.ModuleConcatenationPlugin(),
        new CopyWebpackPlugin(
            {
                patterns: [
                    {
                        from: './*.html',
                        to: "./" + '[name].html'
                    }
                ],
            })
    ]
};