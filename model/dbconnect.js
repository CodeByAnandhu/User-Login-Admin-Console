const mongoose =  require('mongoose')
const bcrypt = require('bcrypt')



const connect= mongoose.connect("mongodb://127.0.0.1:27017/Userdb")


connect.then(()=>{
    console.log("database connected Succesfully");
})
.catch(()=>{
    console.log("databas connection failed");
})


// creating Schema
const userSchema = mongoose.Schema({
    isBlocked: {
        type: Boolean,
        default: false
      },
    username:{
        type: String,
       
        required:true
    },
    email:{
        type:String,
       
        required:true
    },
    password:{
        type:String ,
        required:true
    }
})

// Creating Model
const collection = new mongoose.model("users",userSchema)

module.exports = collection