const express = require("express");
const {updateProfile,getProfile} = require("../controllers/profileController")

const profileRouter = express.Router()

// profileRouter.get("getprofile");
profileRouter.post("/updateprofile",updateProfile);
profileRouter.get("/getprofile",getProfile);

module.exports = profileRouter;