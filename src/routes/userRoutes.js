const express = require("express");
// const { signup, signin } = require("../controllers/userController");
// const { upload } = require("../middlewares/uploadMiddleware");

const { signup, signin, updateProfile, getUserProfile } = require("../controllers/userController");
const { upload, uploadProfileFields } = require("../middlewares/uploadMiddleware");
const auth = require("../middlewares/auth");

console.log("Upload Middleware Imported:", upload);
const userRouter = express.Router();

userRouter.post("/signup", upload.single("profilePic"), signup);

userRouter.post("/signin",signin );

userRouter.put("/update-profile", auth, uploadProfileFields, updateProfile);

userRouter.get("/:id", getUserProfile);
// 
module.exports = userRouter;