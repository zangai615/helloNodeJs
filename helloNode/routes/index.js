var express = require('express');
var crypto=require("crypto");//'kr?pt??，密码成员
var User=require('../models/user');
var router = express.Router();

/* 触发首页
 * render("跳转的页面"，json返回给页面的数据集)
 * */
router.get('/', function(req, res, next) {
    //User.get(null,function(err,user){
    //    console.log("...."+user);
    //    if(err){
    //        user=[];
    //    }
        res.render("index",{
            title:'首页'
            //user:user
        })
    //})

});
/*----------------------------------header.ejs请求按钮集--------start----跳转至相应的页面-----------------------------*/
/*href 登录按钮，用get请求
 * 需要先判断是否登录了，未登录才跳转到login页面
 * */
router.get("/login",checkNotLogin);
router.get("/login",function(req,res){
    res.render('login', { title: '登录' });
});
/*href 注册按钮，用get请求
 * 需要先判断是否登录了，未登录才跳转到reg页面
 * */
router.get("/reg",checkNotLogin);
router.get("/reg",function(req,res){
    console.log("进入注册页");
    res.render('reg', { title: '注册' });
});
/*href 退出按钮，用get请求
 * 需要先判断是否登录了，已登录才退出
 * */
router.get("/exit",checkLogin);
router.get("/exit",function(req,res){
    req.session.user=null;//清除user缓存
    req.flash("success","退出成功");//设置一个success缓存
    res.redirect("/");//刷新当前页面
});
/*---------------------------header.ejs请求按钮集--------end---------------------------------*/

/*
 注册页面，
 填充姓名，密码，重复密码，
 点击提交按钮，
 用post方法提交数据至mongodb添加

 */
router.post("/reg",checkNotLogin);
router.post("/reg",function(req,res){
    //req.body[name],获取html中name属性下的value值,
    // 1.判断密码是否一致
    //
    console.log("pwd"+req.body['pwd']);
    if( req.body['pwd']!=req.body['repwd']){
        console.log("密码不一致");
        req.flash("error","密码不一致");
        return res.redirect("/reg");
    }
    // 2.密码加密
    var md5 =crypto.createHash("md5");
    var pwd=md5.update(req.body['pwd']).digest("base64");
    var newUser=new User({
        username:req.body['name'],
        pwd:pwd
    })
    /*
     *   3.先判断这个用户是否已存在于数据库，get
     *  4. 没有就存数据库,save
     * */
    User.get(newUser.username,function(err,user){
        console.log("进入数据库"+JSON.stringify(err));
        if(err){
            console.log("error"+JSON.stringify(err));
            req.flash("error",err);
            return res.redirect("/reg");
        }
        if(user){
            console.log("已有用户"+JSON.stringify(err));
            req.flash("error","用户已经存在");
            return res.redirect("/reg");
        }
        newUser.save(function(err){
            if(err){
                console.log("error1"+JSON.stringify(err));
                req.flash("error",err);
                return res.redirect("/reg");
            }
            req.session.user=newUser;
            req.flash("success","注册成功");
            return res.redirect("/");
        })
    })

})


/*
 *登陆页面
 * 1.先校验是否已经登陆
 * 2.若是没有登陆，则 查询数据库，是否有用户
 * 3。校验密码是否正确
 * 4.取出数据，关闭数据库
 * */
router.use("/login",checkNotLogin);
router.use("/login",function(req,res){
    if(!req.body['name']){
        req.flash("error","请填写用户名")
        return res.redirect("/login");
    }
    if(!req.body['pwd']){
        req.flash("error","请填写密码");

        return res.redirect("/login");
    }
    var md5=crypto.createHash("md5");
    var password=  md5.update(req.body['pwd']).digest("base64");
    User.get(req.body['name'],function(err,user){
        if(err){
            req.flash("error",err);
            return res.redirect("/login");
        }
        if(!user){
            req.flash("error","用户不存在，请选择注册");
            return res.redirect("/");
        }
        if(user.pwd!=password){
            req.flash("error","密码不正确");
            return res.redirect("/");
        }
        req.session.user=user;
        req.flash("succse","登陆成功");

        return res.redirect("/");

    })
})

/*定义校验未登录的方法，之后才操作*/
function checkNotLogin(req,res,next){
    console.log("req.session.user"+JSON.stringify(req.session.user)+"------");
    if(req.session.user.lenght>0){
        console.log("已经登录");
        req.flash("error","已经登录");
        return res.redirect("/");
    }
    next();
}
/*定义校验已登录的方法，之后才操作*/
function checkLogin(req,res,next){
    if(req.session.user.length==0){
        req.flash("error","未登录");
        return res.redirect("/");
    }
    next();
}
/*header.ejs请求按钮集-------end--------*/
module.exports = router;
