const express = require("express");
const { signup, signin } = require("../controllers/userController");
const { upload } = require("../middlewares/uploadMiddleware");

console.log("Upload Middleware Imported:", upload);
const userRouter = express.Router();

userRouter.post("/signup", upload.single("profilePic"), signup);

userRouter.post("/signin",signin );

module.exports = userRouter;