/**
 * Created by ssehacker on 2016/10/8.
 */
var koa = require('koa');
var serve = require('koa-static');
var bodyParser = require('koa-bodyparser');
var path = require('path');
var app = koa();

app.use(bodyParser());
app.use(serve(path.resolve(__dirname, '../dist')));

var views = require('koa-views');
var router = require('koa-router')();

//中间件： 打印访问路径,耗时
app.use(function*(next) {
	var start = Date.now();

	yield next;
	var time = Date.now() - start;
	console.log(this.request.method + '\t' + this.request.url + '\t' + time + 'ms');
});

router.get('/', function*(next) {
	yield this.render('index');
});

app.listen(3000);

console.log('listening on port 3000');
