// routes/projects.js
const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// Get all projects
router.get("/", async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
});

// Post a new project
router.post("/", async (req, res) => {
  const project = new Project(req.body);
  await project.save();
  res.status(201).json(project);
});

module.exports = router;
