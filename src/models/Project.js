const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  tags: [String],
  image: String,
  postedBy: {
    userId: String,
    username: String,
    profilePic: String,
  },
  upvotes: {
    type: [String], // array of userIds who upvoted
    default: [],
  },
  comments: [
    {
      userId: String,
      username: String,
      profilePic: String,
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
githubLink: String,
liveLink: String,
techStack: [String],

});

module.exports = mongoose.model("Project", projectSchema);
