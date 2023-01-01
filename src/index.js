require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const path = require("path");
const app = express();
const session = require("express-session");
const conn = require("./db/connect");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/authenticate");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../templates/views"));

const port = process.env.PORT || 3000;

// use session storage for display message
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    saveUninitialized: false,
    resave: false,
    cookie: {
      //secure: true,
      httpOnly: true,
    },
  })
);
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// Add require models file
const Register = require("./models/register");
const adminRegister = require("./models/adminRegister");
const adminDetail = require("./models/adminBooking");
const { MongoClient } = require("mongodb");

//find data for mongodb atlas
async function FindData() {
  const uri =
    "mongodb+srv://sonunew:sonu10121988@mongodbtutorial.ouy1fom.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  // connection from database
  await client.connect();
  var result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .find({ property_type: "House" })
    .limit(8)
    .toArray();

  return result;
}

// fetch data from mongodb in sample airbnb
async function FindData1(id) {
  const uri =
    "mongodb+srv://sonunew:sonu10121988@mongodbtutorial.ouy1fom.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri);
  await client.connect();

  var result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .findOne({ _id: id });

  return result;
}

//find data from mongodb atlas for admin booking detail page
async function FindData2() {
  const uri =
    "mongodb+srv://sonunew:sonu10121988@mongodbtutorial.ouy1fom.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  await client.connect();
  var adminResult = await client
    .db("users")
    .collection("adminbookings")
    .find()
    .toArray();

  //console.log("found Data" + adminResult[0].name);
  return adminResult;
}

// fetch data from mongodb atlas for admin booking detail page
async function FindData3(homename) {
  const uri =
    "mongodb+srv://sonunew:sonu10121988@mongodbtutorial.ouy1fom.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  await client.connect();
  var adminResults = await client
    .db("users")
    .collection("adminbookings")
    .findOne({
      homename,
    });

  //console.log("found Data" + adminResults[0].name);
  return adminResults;
}

app.get("/", async (req, res) => {
  let data = await FindData();
  let data2 = await FindData2();
  console.log(data2);
  res.render("index", {
    data: data,
    data2: data2,
  });
});

app.get("/register", (req, res) => {
  res.render("register");
});

//create a new user in  database
app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;
    if (password === cpassword) {
      const registerEmployee = new Register({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        phone: req.body.phone,
        password: password,
        confirmpassword: cpassword,
      });

      //   Here Use jwt middleware
      const token = await registerEmployee.generateAuthToken();

      //   we create cookie
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 50000),
        httpOnly: true,
      });

      const registered = await registerEmployee.save();
      // use session storage for display message
      req.session.message = {
        type: "success",
        message: "Congrates Your Signup Successfully!",
      };
      res.redirect("/");
    } else {
      res.json({ message: err.message, type: "success" });
      res.send("password are not match");
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

// It's route for login page
app.get("/login", (req, res) => {
  res.render("login");
});
// We check login Detail
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    let useremail = await Register.findOne({ email: email });

    const isMatch = await bcrypt.compare(password, useremail.password);

    //   here use json web token
    const token = await useremail.generateAuthToken();
    console.log("the token part" + token);
    //  end jwt

    //  create cookie
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 600000),
      httpOnly: true,
    });
    // get cookie
    console.log(`this is the cookie awesome ${req.cookies.jwt}`);

    //   if login detail match display session storage message
    if (isMatch) {
      req.session.message = {
        type: "info",
        message: "User Login Successfully!",
      };
      res.redirect("/");
    } else {
      res.json({ message: err.message, type: "info" });
      res.send(" Invalid password details.");
    }
  } catch (error) {
    res.status(400).send("invalid login details.");
  }
});

// It's route for signup page
app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/details/:id", auth, async (req, res) => {
  let data = await FindData1(req.params.id);
  //console.log(data.name);
  res.render("details", {
    data: data,
  });
});

//admin booking detail page rander
app.get("/adminBookingdetail/:homename", auth, async (req, res) => {
  //     res.render(req.params.homename);
  //    console.log(req.params.homename);
  let data2 = await FindData3(req.params.homename);

  res.render("adminBookingdetail", {
    data2: data2,
  });
});

// For User Log Out
app.get("/logout", async (req, res) => {
  try {
    //logout user current token(delete) in filter method :-
    // req.user.tokens = req.user.tokens.filter((currElement)=>{
    //     return currElement.token !== req.token
    // })

    //logout user from all token :-
    //req.user.tokens = [];

    res.clearCookie("jwt");
    // use session storage for display message
    req.session.message = {
      type: "danger",
      message: "User Logout Successfully!!",
    };
    res.redirect("/");
  } catch (error) {
    res.json({ message: err.message });
    res.status(500).send(error);
  }
});

//airbnb admin router page :-
app.get("/admin", (req, res) => {
  res.render("admin");
});

// admin signup form page route :-
app.get("/adminSignUp", (req, res) => {
  res.render("adminSignUp");
});

// admin signup post form :-
app.post("/adminRegister", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;
    if (password === cpassword) {
      const adminRegisterEmployee = new adminRegister({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        phone: req.body.phone,
        password: password,
        confirmpassword: cpassword,
      });

      const registered = await adminRegisterEmployee.save();
      // use display session storage message :-
      req.session.message = {
        type: "success",
        message: "Congratulation Your Register Successfully!",
      };
      res.redirect("/adminCrud");
    } else {
      res.json({ message: err.message, type: "success" });
      res.send("password are not match");
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

// admin login form page router :-
app.get("/adminLogin", (req, res) => {
  res.render("adminLogin");
});

// admin login post form :-
app.post("/adminlogin", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    let useremail = await adminRegister.findOne({ email: email });

    const isMatch = await bcrypt.compare(password, useremail.password);

    if (isMatch) {
      req.session.message = {
        type: "info",
        message: "User Login Successfully!",
      };
      res.redirect("/adminCrud");
    } else {
      res.json({ message: err.message, type: "info" });
      res.send(" Invalid password details.");
    }
  } catch (error) {
    res.status(400).send("invalid login details.");
  }
});

//  Admin Booking Deatil Page Router:-
app.get("/adminBooking", (req, res) => {
  res.render("adminBooking");
});

//admin Detail Post Page :-
app.post("/adminBooking", async (req, res, err) => {
  const adminDetails = new adminDetail({
    homename: req.body.homename,
    Location: req.body.location,
    homeurl: req.body.imgUrl,
    minimum_nights: req.body.night,
    Overview: req.body.overView,
    cancellation_policy: req.body.cancellPolicy,
    Price: req.body.price,
  });
  const registered = await adminDetails.save();

  // It's for Add New User Crud Operation Use (session storage display message) :-
  if (registered != "") {
    req.session.message = {
      type: "info",
      message: "User Added Successfully!",
    };
    res.redirect("/adminCrud");
  } else {
    res.json({ message: err.message, type: "info" });
  }
});

// admin crud operation Use (get all data from database) :-
app.get("/adminCrud", async (req, res) => {
  let data2 = await FindData2();
  console.log(data2);
  res.render("adminCrud", {
    data2: data2,
  });
});

// admin crud operation Use (For read/find data) :-
app.get("/update/:id", async (req, res) => {
  let id = req.params.id;
  adminDetail.findById(id, (err, data2) => {
    if (err) {
      res.redirect("/adminCrud");
    } else {
      if (data2 == null) {
        res.redirect("/adminCrud");
      } else {
        res.render("adminAdit", { data2: data2 });
      }
    }
  });
});

// adit admin update information crud operation :-
app.post("/adminBooking/:id", async (req, res) => {
  let id = req.params.id;
  await adminDetail.findOneAndUpdate(
    { _id: id },
    {
      homename: req.body.homename,
      Location: req.body.location,
      homeurl: req.body.imgUrl,
      minimum_nights: req.body.night,
      Overview: req.body.overView,
      cancellation_policy: req.body.cancellPolicy,
      Price: req.body.price,
    }
  );
  if (id != id) {
    res.json({ message: err.message, type: "danger" });
  } else {
    req.session.message = {
      type: "success",
      message: "User Update Successfully!",
    };
    res.redirect("/adminCrud");
  }
});

// admin Delete Data crud operation :-
app.get("/delete/:id", (req, res) => {
  let id = req.params.id;
  adminDetail.findByIdAndRemove(id, function (err) {
    // Use display session storage message :-
    if (err) {
      res.json({ message: err.message });
    } else {
      req.session.message = {
        type: "info",
        message: "User deleted Successfully!",
      };
      res.redirect("/adminCrud");
    }
  });
});

// help form Page Route :-
app.get("/help", (req, res) => {
  res.render("help");
});

// Server Started :-
app.listen(port, function () {
  console.log(`server is listen on port ${port}`);
});
