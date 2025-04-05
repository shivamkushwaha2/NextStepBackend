// routes/projects.js
const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const authMiddleware = require("../middlewares/auth"); 
const { createProject, upload } = require("../controllers/projectController");

// Get all projects
router.get("/", async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
});

// // Post a new project
// router.post("/get", async (req, res) => {
//   const project = new Project(req.body);
//   await project.save();
//   res.status(201).json(project);
// });

router.post("/create",authMiddleware, upload.single("image"), createProject);


module.exports = router;
