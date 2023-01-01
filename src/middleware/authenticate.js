const jwt = require("jsonwebtoken");
const Register = require("../models/register");

// Here Use Authentication User :-
const auth = async (req, res, next) =>{
  try{
   
    const token = req.cookies.jwt;
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    console.log(verifyUser);

    //get user data :-
    const user = await Register.findOne({_id:verifyUser._id});
    console.log(user);

    req.token = token;
    req.user = user;

    next();

  } catch(error){
    req.session.message = {
      type: "danger",
      message: "Please Login First User!!!",
  };
  res.redirect('/');
  }
}

module.exports = auth;