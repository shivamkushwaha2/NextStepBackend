const userModel = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;
const { uploadToS3 } = require("../middlewares/uploadMiddleware");


const signup = async (req, res) => {
    const { email, password, name } = req.body;
    let profilePicUrl = null;

    try {
        // ✅ Upload image to S3 if file is provided
        if (req.file) {
            profilePicUrl = await uploadToS3(req.file);
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userModel.create({
            email,
            password: hashedPassword,
            name,
            profilePic: profilePicUrl
        });

        const token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.SECRET_KEY);

        res.status(201).json({ user: newUser, token });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

module.exports = { signup };

const signin = async (req, res)=>{

    const {email, password} = req.body;

    try {

    const existingUser = await userModel.findOne({email:email});
    if (!existingUser)
    {
        return res.status(401).json({
            message: "User not found"
        });
    }

    const matchedPassword = await bcrypt.compare(password, existingUser.password);
    if(!matchedPassword)
    {
        res.status(404).json({
            message:"Invalid crediantials"
        });
    }  
    const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.SECRET_KEY);
    res.status(201).json({
        user: existingUser,
        token: token
    });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
  

};




const updateProfile = async (req, res) => {
    const { firstName, lastName, bio, tags, githubUsername } = req.body;
    const userId = req.userId;

    try {
        const user = await users.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        let profilePicUrl = null;
        let resumeUrl = null;

        if (req.files?.profilePic) {
            profilePicUrl = await uploadToS3(req.files.profilePic[0]);
        }

        if (req.files?.resume) {
            resumeUrl = await uploadToS3(req.files.resume[0]);
        }

        user.name = `${firstName} ${lastName}`;
        user.bio = bio || "";
        user.tags = tags?.split(",").map(tag => tag.trim()) || [];
        user.githubUsername = githubUsername || "";
        if (profilePicUrl) user.profilePic = profilePicUrl;
        if (resumeUrl) user.resume = resumeUrl;

        await user.save();

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
const getUserProfile = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await userModel.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


module.exports = { signup, signin, updateProfile, getUserProfile };
