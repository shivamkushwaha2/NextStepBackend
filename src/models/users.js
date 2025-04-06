// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     profilePic: { type: String, default: "" }  
// },{timestamps:true});

// module.exports = users = mongoose.model('User', userSchema)

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    bio: { type: String, default: "" },
    tags: { type: [String], default: [] },
    githubUsername: { type: String, default: "" },
    resume: { type: String, default: "" }
}, { timestamps: true });

module.exports = users = mongoose.model('User', userSchema);
