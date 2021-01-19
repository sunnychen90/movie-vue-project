var express = require('express');
var router = express.Router();

var user = require('../models/user');
var crypto = require('crypto');
var movie = require('../models/movie');
var mail = require('../models/mail');
var comment = require('../models/comment');

const init_token = 'TKL02O';

/* GET users listing. */

// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

//用户登录接口
router.post('/login',function (req,res,next) {
  //验证完整性，是用简单的if ,后续可以用正则来优化，对输入的格式进行验证
  if(!req.body.username){
    return res.json({status:1,message:"用户名为空"})
  }
  if(!req.body.password){
    return res.json({status:1,message:"密码为空"})
  }
  user.findUserLogin(req.body.username,req.body.password,function (err,userSave) {
    if(userSave.length != 0){
      //通过MD5查看密码
      var token_after = getMD5Password(userSave[0]._id)
      return res.json({status:0,data:{token:token_after,user:userSave},
      message:"用户登录成功"})
    }else{
      return  res.json({status:1,message:"用户名或者密码输入错误"})
    }
  })
});

//用户注册接口
router.post('/register',function (req,res,next) {
  if (!req.body.username){
    return  res.json({status:1,message :'用户名为空'})
  }
  if(!req.body.password){
    return res.json({status:1,message:'密码为空'})
  }
  if(!req.body.userMail){
    return res.json({status:1,message:'用户邮箱为空'})
  }
  if(!req.body.userPhone){
    return res.json({status:1,message:'用户手机为空'})
  }
  user.findByUsername(req.body.username,function (err,userSave) {
    if(userSave.length != 0){
      //返回错误信息
      return res.json({status:1,message:'用户已注册'})
    }else {
      var registerUser = new user({
        username : req.body.username,
        password : req.body.password,
        userMail : req.body.userMail,
        userPhone :req.body.userPhone,
        userAdmin :0,
        userPower :0,
        userStop :0
      })
      registerUser.save(function () {
        return res.json({status:0,message:'注册成功'})
      })
    }
  })

});
//用户提交评论
router.post('/postCommment',function (req,res,next) {

});
//用户点赞
router.post('/support',function (req,res,next) {

});
//用户找回密码
router.post('/findPassword',function (req,res,next) {
  //通过 用户名，邮箱，电话，这3个关键找回密码
  //通过3个关键字，更新数据库的密码
  //还需要判断，repassword是否存在
  if (req.body.repassword) {
    //当repassword存在时，需要验证其他登录情况或者验证其code
    if (req.body.token) {
      //当存在code登录状态时，验证其状态
      if (!req.body.user_id) {
        return res.json({status: 1, message: "用户登录错误"})
      }
      if (!req.body.password) {
        return res.json({status: 1, message: "用户老密码错误"})
      }
      if (req.body.token == getMD5Password(req.body.user_id)) {
        user.findOne({_id: req.body.user_id, password: req.body.password}, function (err, checkerUser) {
          if (checkerUser) {
            user.update({_id: req.body.user_id}, {password: req.body.repassword}, function (err, userUpdate) {
              if (err) {
                return res.json({status: 1, message: "更改错误", data: err})
              }
              return res.json({status: 0, message: "更改成功", data: userUpdate})
            })
          } else {
            return res.json({status: 1, message: "用户老密码错误"})
          }
        })
      } else {
        return res.json({status: 1, message: "用户登录错误"})
      }
    }else {
      //当不存在code时，直接验证mail和phone
      user.findUserPassword(req.body.username, req.body.userMail, req.body.userPhone, function (err, userFound) {
        if (userFound.length != 0) {
          user.update({_id: userFound[0]._id}, {password: req.body.repassword}, function (err, userUpdate) {
            if (err) {
              return res.json({status: 1, message: "更改错误", data: err})
            }
            return res.json({status: 0, message: "更改成功", data: userUpdate})
          })
        } else {
          return res.json({status: 1, message: "信息错误"})
        }
      })
    }

  } else{
    //这里只是验证mail 和phone,返回验证成功提示和提交的字段，用于之后改密码的操作
    if(!req.body.username){
      return res.json({status:1,message:"用户名为空"})
    }
    if(!req.body.userMail){
      return res.json({status:1,message:"用户邮箱为空"})
    }
    if(!req.body.userPhone){
      return res.json({status:1,message:"用户手机为空"})
    }
    user.findUserPassword(req.body.username,req.body.userMail,req.body.userPhone,function(err,userFound){
         if(userFound.length != 0){
            return res.json({status:0,message:"验证成功，请修改密码",data:{username:req.body.username,userMail:req.body.userMail,userPhone:req.body.userPhone}})
         }else{
           return res.json({status:1,message:"信息错误"})
         }
    })
  }
});
//用户发送站内信
router.post('/sendEmail',function (req,res,next) {

});
//用户显示站内信，其中receive 参数为1时是发送的内容，值为2时是收到的内容

//获取MD5值  为了生成TOKEN值，需要引入Crypto加密中间件 npm install crypto -save 这个中间件
function getMD5Password(id){
  var md5 = crypto.createHash('md5');
  var token_before = id + init_token;
  return md5.update(token_before).digest('hex')
}




module.exports = router;
