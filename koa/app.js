var Koa = require('koa')

var fs = require('fs')
var path = require('path')
//var convert = require('koa-convert');

var koaStaticPlus = require('koa-static-plus')
var Router = require('./router')
var bodyParser = require('koa-bodyparser');

var app = new Koa()
//处理静态资源
app.use(koaStaticPlus(path.join(__dirname, '../dist'), {
    pathPrefix: ''
}))
app.use(bodyParser());


Router.get('/', function (a) {
    var text = fs.readFileSync(__dirname+'/views/index.html','utf-8')
    a.body = text
})
Router.get('/aaa', function (a) {
    a.body = "aaaaaa"
})

Router.get('/getAjax', function (a) {
    var obj = a.request.query
    obj.nodejs = 'nodejs'
    a.body = obj
})

Router.post('/postAjax', function (a) {
    var obj = a.request.body
    obj.form = '后端'
    a.body = obj
})

console.log(Router.map)

app.use(async function (ctx, next) {
    console.log(ctx.method, ctx.url)
    Router.match(ctx, next)
})


app.listen(4000, function () {
    console.log('server started 4000')
})

module.exports = app

