const Job = require("../models/Job");

// Create Job Posting
const createJob = async (req, res) => {
  try {
    const { title, company, location, description, batch, salary, type, link } = req.body;

    // if (!title || !company || !location || !description || !salary || !type) {
    //   return res.status(400).json({ message: "All fields are required" });
    // }

    const newJob = new Job({ title, company, location, description, batch, salary, type,link });
    await newJob.save();

    res.status(201).json({ message: "Job posted successfully", job: newJob });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Fetch All Jobs
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs", error: error.message });
  }
};

module.exports = { createJob, getJobs };
