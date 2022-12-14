const express = require('express');
const ejs = require('ejs');
const path = require('path');
const app = express();
const conn = require("./db/connect");
const bcrypt = require("bcryptjs");
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static('public'));
app.set('view engine','ejs');
app.set('views', path.join(__dirname, '../templates/views'));

const port = process.env.PORT || 5000;

const Register = require('./models/register');
const adminRegister = require('./models/adminRegister');

const { MongoClient } = require('mongodb');

async function FindData() {
    const uri= "mongodb+srv://sonunew:sonu10121988@mongodbtutorial.ouy1fom.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);

    await client.connect();
    var result = await client.db("sample_airbnb").collection("listingsAndReviews").find({"property_type": "House"}).toArray();
    
    //console.log("found Data" + result[0].name);
    return result
}

async function FindData1(id) {
    const uri= "mongodb+srv://sonunew:sonu10121988@mongodbtutorial.ouy1fom.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);
    await client.connect();

    var result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({_id:id});
    
    //console.log("found Data" + result[0].name);
    return result
}

app.get('/', async (req, res) => {
    let data = await FindData()
    //console.log("hello" + data[0].name);
     res.render('index',{
        data: data
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
    //res.sendFile(path.join(__dirname + '/object/login.html'));
    res.render('login');
});
//login check
app.post("/login", async (req, res) =>{
    try{
       const email = req.body.email;
       const password = req.body.password;
 
     let useremail = await Register.findOne({email:email});
 
     const isMatch = await bcrypt.compare(password, useremail.password);
 
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
    //res.sendFile(path.join(__dirname + '/object/login.html'));
    res.render('signup');
    //res.redirect("/");
});

app.get('/details/:id', async (req, res) => {
    //res.render(req.params.id);
   //console.log(req.params.id);
   let data = await FindData1(req.params.id);
   //console.log(data.name);
   //res.render('details');
    res.render('details', {
    data: data
   });
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
      //console.log(req.body.firstname);
      //res.send(req.body.firstname);
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
     res.redirect("/");
    }else{
     res.send(" Invalid password details.");
    }
       
    } catch (error){
     res.status(400).send("invalid login details.");
    }
 })

// help form
app.get('/help', (req, res) => {
    res.render('help');
});

app.listen(port, function () {
    console.log(`server is listen on port ${port}`);
});

