const express = require('express');
const route = express.Router();
const controller= require("../controllers/users")
route.get(["/","/login"], (req,res)=>{
    res.render('login');
})
route.get("/register",(req,res)=>{
    res.render('register');
})
route.get("/home",controller.isLogedIn,  (req,res)=>{
    const msg = req.query.msg;
    const msg_type = req.query.msg_type;
    if(req.user,req.result){
        res.render('home',{user:req.user, result:req.result,msg, msg_type } );
    }else{
        res.redirect('/login');
    }   
})
route.post("/home",controller.adduser,  (req,res)=>{
    const msg = req.query.msg;
    const msg_type = req.query.msg_type;
    if(req.user,req.result){
        res.render('home',{user:req.user, result:req.result, msg, msg_type} );
    }else{
        res.redirect('/login');
    }   
})
route.get("/edituser/:id",controller.edituser,  (req,res)=>{
  
    if(req.data){
        // console.log(req.data)
        res.render('edituser',{user:req.data} );
    }else{
        res.redirect('/login');
    }   
})
route.post("/edituser/:id",controller.edit);

route.get("/profile",controller.isLogedIn, (req,res)=>{
    if(req.user){
        res.render('profile',{user:req.user} );
    }else{
        res.redirect('/login');
    }   
})
route.get("/delete/:id", controller.delete)

module.exports=route;