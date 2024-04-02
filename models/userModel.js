// import mongoose
const mongoose = require('mongoose');

// create schema
const userSchema = new mongoose.Schema({
    userid : {type : String, unique : true, required: true},
    fristName : {type : String, required: true},
    lastName : {type : String, required: true},
    email : {type : String, unique : true ,required:true }, 
    password: { type: String, required: true },
    activationToken : {type : String},
    accountActive : {type : Boolean , default : false },
    createdAt : {type : Date,default : Date.now()},
    updatedAt : {type : Date,default : null}
});

// create Model
const UserModel = mongoose.model("User",userSchema, "users");

// export model
module.exports=UserModel;