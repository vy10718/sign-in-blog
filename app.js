require('dotenv').config();
const express=require("express");
const bodyparser=require("body-parser");
const ejs=require("ejs");

const mongoose = require('mongoose');
const session=require("express-session");
const passport=require("passport");
const passportlocalmongoose=require("passport-local-mongoose");



const app=express();

app.use(session({
  secret: "our little secret",
  resave: false,
  saveUninitialized:false

}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect('mongodb://localhost:27017/reviewDB', {useNewUrlParser: true, useUnifiedTopology: true});
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended:true}));
const userSchema=new mongoose.Schema({

  email:String,
  password:String,
  review:String

});
userSchema.plugin(passportlocalmongoose);

 const User=new mongoose.model("User",userSchema) ;
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res)
{
  res.render("home");

});
app.get("/login",function(req,res){
  res.render("login");
});
app.get("/register",function(req,res){
  res.render("register");
});

app.get("/blog",function(req,res)
{
  User.find({"review":{$ne:null}}, function (err,foundUsers){
  if(err)
  {
    console.log(err);
  }else{
    if(foundUsers){
      res.render("blog", {userwithreviews: foundUsers});

    }
  }
});
});


app.get("/logout",function(req,res)
{
  req.logout();
  res.redirect("/");
});

app.get("/submit",function(req,res){
  if(req.isAuthenticated()){
    res.render("submit");
  }else{
    res.redirect("/login");
  }

});
app.post("/submit",function(req,res){
  const submittedreview=req.body.review;


   User.findById(req.user.id,function(err,foundUser)
 {
   if(err){
     console.log(err);
   }else{
     if(foundUser){

       foundUser.review=submittedreview;
       foundUser.save(function(){
         res.redirect("/blog");
       });
     }
   };
 });
});




app.post("/register",function(req,res){
  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
    console.log(err);
    res.redirect("/register");
  }else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/blog");
    });
  }
  });
});

app.post("/login",function(req,res)
{
  const user=new User({
    username:req.body.username,
    password:req.body.password
  });
   req.login(user,function(err){
     if(err){
       console.log(err);
     }else{
       passport.authenticate("local")(req,res,function(){
         res.redirect("/blog");
       });
     }
   });

  });


















app.listen(3000,function(){
  console.log("server is running at port 3000");
});
