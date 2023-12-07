const express= require('express');
const controller= require("../controllers/users")
const route= express.Router()
route.post("/register", controller.register);
route.post("/login", controller.login);
// route.post("/adduser", controller.adduser);
route.get("/logout", controller.logout);

module.exports=route;