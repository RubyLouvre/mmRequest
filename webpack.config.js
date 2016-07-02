
var now = new Date
var snow = now.getFullYear() + '-' + (now.getMonth() + 1) +
        '-' + now.getDate() + ':' + now.getHours()
var fs = require('fs')
var webpack = require('webpack')

var json = require('./package.json')
var path = require('path')
var version = json.version.split('.')
var v = (version.shift() + '.' + version.join('')).replace(/0+$/, "0")

function heredoc(fn) {
    return fn.toString().replace(/^[^\/]+\/\*!?\s?/, '').
            replace(/\*\/[^\/]+$/, '').trim().replace(/>\s*</g, '><')
}
var feather = heredoc(function () {
    /*
     2011.8.31
     将会传送器的abort方法上传到avalon.XHR.abort去处理
     修复serializeArray的bug
     对XMLHttpRequest.abort进行try...catch
     2012.3.31 v2 大重构,支持XMLHttpRequest Level2
     2013.4.8 v3 大重构 支持二进制上传与下载
     http://www.cnblogs.com/heyuquan/archive/2013/05/13/3076465.html
     2014.12.25  v4 大重构 
     2015.3.2   去掉mmPromise
     2015.3.13  使用加强版mmPromise
     2015.3.17  增加 xhr 的 onprogress 回调
     2016.7.2 fix跨域检测
     */
})

module.exports = {
    entry: {
        mmRequest: './src/compact', //我们开发时的入口文件
        'mmRequest.modern': './src/modern', //我们开发时的入口文件

    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'avalon'
    }, //页面引用的文件
    plugins: [
        new webpack.BannerPlugin('built in ' + snow + ' version ' + v + ' by 司徒正美\n' + feather)
    ],
    module: {
    },
    resolve: {
        extensions: ['.js', '', '.css']

    }
}
