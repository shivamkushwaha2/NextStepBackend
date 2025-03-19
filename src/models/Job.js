const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: false },
  description: { type: String, required: false },
  batch: { type: String, required: false },
  salary: { type: String, required: false }, 
  type: { type: String, required: false },
  link: { type: String, required: false },
  postedAt: { type: Date, default: Date.now },
});

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
