/**
 * Created by yong on 2017/3/1.
 */
var mongodb=require("./db");
/*创建一个用户构造函数对象*/
function User(user){
    this.username=user.username;
    this.pwd=user.pwd;
}
module.exports=User;
/*-----------------------------书写User对象原型方法-----------start--------------*/
/*
 *prototype，这个类的实例可以使用，new之后，这个对象的实例就也拥有这个方法了
 * 功能，存用户信息
 * param:用户名和密码
 * */
User.prototype.save=function save(callback){
    var user={
        username:this.username,
        pwd:this.pwd
    };
    console.log("用户信息--"+JSON.stringify(user));
    /*打开mongodb进行数据处理
     callback:回调处理
     *  mongodb.open(callback)  打开
     *   ensureIndex设置唯一值 ：字段名console.log()，是否唯一，回调
     *   insert存数据： object，状态，回调
     *   mongodb.close() 关闭
     *
     * */
    mongodb.open(function(err,db){
        /*如果有错误，就返回错误代码*/
        if(err){
            callback(err);
        }
        /*db.collection(collectionName, options, callback)*/
        db.collection("users",function(err,collection){
            if(err){
                db.close();
                return callback(err);
            }
            collection.ensureIndex("username",{unique:true},function(err){
                collection.update(user,{safe:true},function(err,user){
                    mongodb.close();
                    return callback(err,user);
                })
            })
        });
    })
}
/*
 只有这个类能是用，实例对象是没有这个方法的
 功能，取出用户信息
 * param:用户姓名和密码
 * 判断是否能连接数据库，open
 * 判断连接数据库之后找到数据集，collection
 * 数据库链接了的，报错要用close关掉数据库，返回err
 * 之后再做相应处理，
 * 数据处理完之后，一定要关闭数据库
 * */
User.get=function get(username,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection("users",function(err,collection){
            if(err){
                db.close();
                return callback(err);
            }
            collection.findOne({username:username},function(err,doc){
                db.close();
                if(doc){
                    var user=new User(doc);
                    return callback(err,user);
                }else{
                    return callback(err,null);
                }

            })
        })
    })
}