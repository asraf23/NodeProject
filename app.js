const express= require('express');
const mysql= require('mysql');
const dotenv = require('dotenv');
const path = require('path');
const hbs = require('hbs'); 
const cookieParser = require('cookie-parser');
const app = express();
dotenv.config({
    path:'./.env',
})
const db = mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE,
})
db.connect((err)=>{
    if(err){
        console.log(err)
    }else{
        console.log("DB Connected Successfully");
    }
})
app.use(cookieParser())
app.use(express.urlencoded({extended:false}));
app.use('/', require("./routes/pages"))
app.use('/auth', require("./routes/auth"))

const fileLocation = path.join(__dirname,"./public");
app.use(express.static(fileLocation));
app.set("view engine", "hbs")
const partials= path.join(__dirname,"./views/partials")
hbs.registerPartials(partials);

app.listen(5000,()=>{
    console.log("Server Started")
})
