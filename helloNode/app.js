/*Node中的核心模块分两类：
 一类是自带的核心模块，如http、tcp等，
 第二类是第三方核心模块，
 express就是与http对应的第三方核心模块，用于处理http请求。
 express在3.0版本中自带有很多中间件，
 但是在express 4.0以后，就将除static（静态文件处理）以外的其他中间件分离出来了；
 在4.0以后需要使用中间件时，就需要单独安装好相应的中间件以后调用*/
var express = require('express');//一个应用框架，用来提供强大的功能书写完整的web项目
var path = require('path');//nodejs 中的path模块，用来获取路径
var favicon = require('serve-favicon');//可以设置网页标题图标的中间件，由express维护
var logger = require('morgan');//日志模块，由express维护
var cookieParser = require('cookie-parser');//存取cookie中间件
/*express第三方插件，bodyParser中间件用来解析http请求体
 bodyParser.json是用来解析json数据格式的。
 bodyParser.urlencoded则是用来解析我们通常的form表单提交的数据，
 */
var bodyParser = require('body-parser');
var flash=require('connect-flash');//存session字段，但是用完就会清除掉
/*运行问题1：TypeError: Cannot read property 'Store' of undefined
 将 var mongoStore = require(“connect-mongo”);
 改为var mongoStore = require(“connect-mongo”)(express);
 * */
var session=require('express-session');
var setting=require('./settings');
var MogoStorage=require('connect-mongo')(session);//mongo数据配置缓存,这里可以缓存connect-redis对数据进行缓存，写法一样
//sessionid存在cookie里面，session运行由于服务端

/*引用js*/
var index = require('./routes/index');
var users = require('./routes/users');

var app = express();//执行

// 设置view路径及模板
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));用来设置网页标题图标
app.use(logger('dev'));//打印开发日志，req
app.use(bodyParser.json());//bodyParser.json是用来解析json数据格式的。
app.use(bodyParser.urlencoded({ extended: false }));//bodyParser.urlencoded则是用来解析我们通常的form表单提交的数据
app.use(cookieParser());//存取cookie
app.use(express.static(path.join(__dirname, 'public')));//设置静态文件目录,放置css,js,images文件
app.use(flash());
/*
 * secret:一个String类型的字符串，作为服务器端生成session的签名。
 name:返回客户端的key的名称，默认为connect.sid,也可以自己设置。
 resave:(是否允许)当客户端并行发送多个请求时，其中一个请求在另一个请求结束时对session进行修改覆盖并保存。

 默认为true。但是(后续版本)有可能默认失效，所以最好手动添加。

 saveUninitialized:初始化session时是否保存到存储。默认为true， 但是(后续版本)有可能默认失效，所以最好手动添加。

 // 经过中间件处理后，可以通过req.session访问session object。
 比如如果你在session中保存了session.userId就可以根据userId查找用户的信息了。
 * */
app.use(session({
        secret:setting.secret,
        store:new MogoStorage({
            db:setting.db
        }),
        resave:true,
        saveUninitialized:true
    })
);
app.use(function(req,res,next){

    console.log("----"+req.session.user);
    res.locals.user=req.session.user;
    var error= req.flash('error');
    res.locals.error=error.length?error:null;
    var success=req.flash('success');
    res.locals.success=success.length?success:null;
    next();
});
app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    console.log("err.message--"+err.message);
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
