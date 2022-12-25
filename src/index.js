require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const app = express();
const session = require('express-session');
const flash = require ('connect-flash');
const conn = require("./db/connect");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/authenticate");


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended : true}));
app.use(express.static('public'));
app.set('view engine','ejs');
app.set('views', path.join(__dirname, '../templates/views'));

const port = process.env.PORT || 3000;

// use flash session 
app.use(session({
secret: process.env.SESSION_SECRET_KEY,
saveUninitialized: false,
resave: false,
cookie :{
    //secure: true,
    httpOnly: true,
}
}));
app.use(flash());
app.use(function(req, res, next){
    res.locals.message = req.flash();
    next();
});
// app.get('/', (req, res)=>{
//     req.flash('success', 'Welcome!!');
//     res.redirect('/flashMessage');
// });
app.get('/flash-message', (req, res) =>{
    res.render("flash");
});

const Register = require('./models/register');
const adminRegister = require('./models/adminRegister');
const adminDetail = require('./models/adminBooking');

const { MongoClient } = require('mongodb');

//code access for mongodb atlas
async function FindData() {
    const uri= "mongodb+srv://sonunew:sonu10121988@mongodbtutorial.ouy1fom.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);

    await client.connect();
    var result = await client.db("sample_airbnb").collection("listingsAndReviews").find({"property_type": "House"}).limit(8).toArray();
    
    //console.log("found Data" + result[0].name);
    return result
}
// fetach data from mongodb in sample airbnb
async function FindData1(id) {
    const uri= "mongodb+srv://sonunew:sonu10121988@mongodbtutorial.ouy1fom.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);
    await client.connect();

    var result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({_id:id});
    
    //console.log("found Data" + result[0].name);
    return result
}

//fetch data from mongodb atlas for admin booking detail page
async function FindData2() {
    const uri= "mongodb+srv://sonunew:sonu10121988@mongodbtutorial.ouy1fom.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);

    await client.connect();
    var adminResult = await client.db("users").collection("adminbookings").find().toArray();
    
    //console.log("found Data" + adminResult[0].name);
    return adminResult
}

async function FindData3(
    homename) {
    const uri= "mongodb+srv://sonunew:sonu10121988@mongodbtutorial.ouy1fom.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);

    await client.connect();
    var adminResults = await client.db("users").collection("adminbookings").findOne({
        homename});
    
    //console.log("found Data" + adminResults[0].name);
    return adminResults
}

app.get('/', async (req, res) => {
    let data = await FindData()
    let data2= await FindData2()
    console.log(data2);
    //console.log("hello" + data2);
    //console.log("hello" + data[0].name);
     res.render('index',{
        data: data,
        data2: data2
     });
     
});

app.get("/register", (req, res) =>{
    res.render("register");
})

//create a new user in our database
app.post("/register", async (req, res) =>{
    try{
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if(password===cpassword){
              const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone,
                password: password,
                confirmpassword: cpassword
              })
            
              //    jwt middleware
             const token = await registerEmployee.generateAuthToken();

            //  create cookie
            res.cookie("jwt", token, {
                expires:new Date(Date.now() + 50000),
                httpOnly:true
            });
              
               
            const registered = await registerEmployee.save();
             res.redirect('/');
        }else{
            res.send("password are not match");
        }
      //console.log(req.body.firstname);
      //res.send(req.body.firstname);
    }catch(e){
        res.status(400).send(e);
        
    }
})

app.get('/login', (req, res) => {
    res.render('login');
});
//login check
app.post("/login", async (req, res) =>{
    try{
       const email = req.body.email;
       const password = req.body.password;
 
     let useremail = await Register.findOne({email:email});
 
     const isMatch = await bcrypt.compare(password, useremail.password);
    
     //   here use json web token
     const token = await useremail.generateAuthToken();
     console.log("the token part" + token);
    //  end jwt

    //  create cookie
    res.cookie("jwt", token, {
        expires:new Date(Date.now() + 600000),
        httpOnly:true
    });
      // get cookie
      console.log(`this is the cookie awesome ${req.cookies.jwt}`);

    if(isMatch){
     res.redirect("/");
    }else{
     res.send(" Invalid password details.");
    }
       
    } catch (error){
     res.status(400).send("invalid login details.");
    }
 })
 
app.get('/signup', (req, res) => {
    res.render('signup');
    //res.redirect("/");
});

app.get('/details/:id', async (req, res) => {
   let data = await FindData1(req.params.id);
   //console.log(data.name);
    res.render('details', {
    data: data
   });
});

//admin booking detail page rander
app.get('/adminBookingdetail/:homename', async (req, res) => {
//     res.render(req.params.homename);
//    console.log(req.params.homename);
   let data2 = await FindData3(req.params.homename);

    res.render('adminBookingdetail', {
    data2: data2
   });
});

// For User LogOut
app.get('/logout',  async(req, res) => {
    try{
        console.log(req.user);
       //logout user current token(delete) in filter method
        // req.user.tokens = req.user.tokens.filter((currElement)=>{
        //     return currElement.token !== req.token
        // })

        //logout user from all token
        //req.user.tokens = [];
       res.clearCookie("jwt");

        req.flash("success", "User Log Out!!");
        res.redirect('/flash-message');
        console.log("Logout Successfully!");
     //await  req.user.save();
     //res.render("login");
    } catch(error){
      res.status(500).send(error);
    }
});


//airbnb host router
app.get('/admin', (req, res) => {
    res.render('admin');
});


// admin signup form
app.get('/adminSignUp', (req, res) => {
    res.render('adminSignUp');
});
// admin signup post form
app.post("/adminRegister", async (req, res) =>{
    try{
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if(password===cpassword){
              const adminRegisterEmployee = new adminRegister({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone,
                password: password,
                confirmpassword: cpassword
              })
              
               
            const registered = await adminRegisterEmployee.save();
             res.redirect('/');
        }else{
            res.send("password are not match");
        }
    }catch(e){
        res.status(400).send(e);
        
    }
})

// admin login form
app.get('/adminLogin', (req, res) => {
    res.render('adminLogin');
});
// admin login post form
app.post("/adminlogin", async (req, res) =>{
    try{
       const email = req.body.email;
       const password = req.body.password;
 
     let useremail = await adminRegister.findOne({email:email});
 
     const isMatch = await bcrypt.compare(password, useremail.password);
 
    if(isMatch){
        //res.render('adminBooking');
       res.redirect("/adminBooking");
    }else{
     res.send(" Invalid password details.");
    }
       
    } catch (error){
     res.status(400).send("invalid login details.");
    }
 })

 app.get('/adminBooking', (req, res) => {
    res.render('adminBooking');
});
 //admin Detail/Information
 app.post("/adminBooking", async (req, res) =>{
         const adminDetails = new adminDetail({
            homename: req.body.homename,
                Location: req.body.location,
                homeurl: req.body.imgUrl,
                minimum_nights: req.body.night,
                Overview: req.body.overView,
                cancellation_policy: req.body.cancellPolicy,
                Price: req.body.price,
              });
              console.log(adminDetails);
              const registered = await  adminDetails.save();
              console.log("the page show" + registered);
              res.redirect('/');
})

// help form
app.get('/help', (req, res) => {
    res.render('help');
});

app.listen(port, function () {
    console.log(`server is listen on port ${port}`);
});

