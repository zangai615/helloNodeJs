/**
 * Created by yong on 2017/3/1.
 */
/*获取数据源*/
var settings=require("../settings");
var db=require("mongodb").Db;
var connect=require("mongodb").Connection;
var service=require("mongodb").Server;
/*new db(dbname,new service(host,ip),{safe:true})*/
module.exports=new db(settings.db,new service(settings.host,connect.DEFAULT_PORT),{safe:true})
