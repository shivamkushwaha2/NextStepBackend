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

// const signup = async (req, res) => {
//     const { email, password, name } = req.body;

//     try {
//         const existingUser = await userModel.findOne({ email: email });

//         if (existingUser) {
//             return res.status(400).json({
//                 message: "User already exists"
//             });
//         }

//         const hashedPswrd = await bcrypt.hash(password, 10);

//         const result = await userModel.create({
//             email: email,
//             password: hashedPswrd,
//             name: name
//         });

//         const token = jwt.sign({ email: result.email, id: result._id }, process.env.SECRET_KEY);

//         res.status(201).json({
//             user: result,
//             token: token
//         });

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Something went wrong" });
//     }
// };

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

module.exports = {signin,signup};