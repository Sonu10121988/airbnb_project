const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

// Create schema :-
const employeeSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    phone:{
        type: Number,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    confirmpassword:{
        type: String,
        required: true
    },
    tokens:[{
        token:{
         type: String,
         required: true 
        }
    }]
})
// generate token :-
employeeSchema.methods.generateAuthToken = async function(){
  try{
    const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({token:token})
    await this.save();
    return token;
  } catch (error){
    res.send("the error part" + error);
    console.log("the error part" + error);
  }
}

// converting password into hash :-
employeeSchema.pre("save", async function(next){
    if(this.isModified("password")){
        //const passwordHash = await bcrypt.hash(password, 10);
       this.password = await bcrypt.hash(this.password, 10);
       this.confirmpassword = await bcrypt.hash(this.password, 10);
    }
   
    next();
})


//create collection in Database :-
const Register = new mongoose.model("Register", employeeSchema);

module.exports= Register;