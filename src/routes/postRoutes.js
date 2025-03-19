const express = require("express");
const { createPost, getPosts, likePost } = require("../controllers/postController");
const authMiddleware = require("../middlewares/auth"); // Ensure only authenticated users can create/like posts
// const upload = require('../middlewares/multer'); 
const upload = require("../middlewares/multerConfig"); // Path to your multer setup

const router = express.Router();

// Create a post
// router.post("/create", authMiddleware, createPost);
router.post("/create", authMiddleware, upload.single("image"), createPost);

// Get all posts
router.get("/all", authMiddleware, getPosts);

// Like a post
// router.post("/like/:postId", authMiddleware, likePost);

router.post("/:id/like", authMiddleware, likePost);

module.exports = router;
