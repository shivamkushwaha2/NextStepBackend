const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String,
        unique:true
    },
    profession:{
        type:String
    },
    bio:{
        type:String
    },
    educationalBackground:{
        type:String
    },
    skills:{
        type:String
    },
    experience:{
        type:String
    }
},
{
    timestamps:true
}
);

module.exports = mongoose.model("ProfileModel",profileSchema);