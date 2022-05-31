'use strict'
const config = require('./webpack.config.js');

module.exports = Object.assign(config, {
    devServer: {
        open: false,
        host: "localhost",//"0.0.0.0",//
        hot: false
        //port: 8000,
    },

    /*module: {},*/ mode: 'development',
    devtool: 'source-map'
});