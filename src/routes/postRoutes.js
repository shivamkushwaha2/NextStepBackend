const express = require("express");
const { createPost, getPosts, upload } = require("../controllers/postController");
const authMiddleware = require("../middlewares/auth"); 

const router = express.Router();


router.post("/create",authMiddleware, upload.single("image"), createPost);
router.get("/all",authMiddleware, getPosts);


module.exports = router;
