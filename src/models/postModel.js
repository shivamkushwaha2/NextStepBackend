const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    content: { type: String, required: true },
    imageUrl: { type: String },  // Optional image URL (AWS S3 or Cloudinary)
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who liked the post
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", postSchema);
