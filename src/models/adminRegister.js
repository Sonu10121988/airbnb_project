const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// create schema 
const adminUserSchema = new mongoose.Schema({
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
})

//middleware use
adminUserSchema.pre("save", async function(next){
    if(this.isModified("password")){
        //const passwordHash = await bcrypt.hash(password, 10);
        console.log(`the current password is ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
        console.log(`the current password is ${this.password}`);

        this.confirmpassword = undefined;
    }
   
    next();
})


//create collection in Database :-
const adminRegister = new mongoose.model("AdminRegister", adminUserSchema);

module.exports= adminRegister;