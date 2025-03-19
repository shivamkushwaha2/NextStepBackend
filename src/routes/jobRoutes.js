const express = require("express");
const { createJob, getJobs } = require("../controllers/jobController");

const router = express.Router();

router.post("/jobs", createJob);  // Create job
router.get("/jobs", getJobs);      // Get all jobs

module.exports = router;
