const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;


const userSchema = new Schema({
    email : {
        type : String , 
        required : true ,
    },
});


userSchema.plugin(passportLocalMongoose); //adds username , hash and salt fields to store the username and the hashed password0

module.exports = mongoose.model("User" , userSchema);