const mongoose = require("mongoose");
const nodemon = require("nodemon");

// create connection for mongodb
mongoose.connect("mongodb+srv://sonunew:sonu10121988@mongodbtutorial.ouy1fom.mongodb.net/users?retryWrites=true&w=majority", {
    useNewUrlParser:true,
    useUnifiedTopology: true,
     //useCreateIndex: true
}).then(()=>{
    console.log(`connection successful.`);
}).catch((e)=>{
      console.log(`No connection`);
})

module.exports= mongoose;