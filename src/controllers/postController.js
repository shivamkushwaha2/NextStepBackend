const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const Post = require("../models/postModel");
require("dotenv").config();

// Initialize S3 Client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

//  Configure Multer (stores files in memory)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 }, // Max 8MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only images allowed"), false);
        }
        cb(null, true);
    }
});

//  Function to upload image to S3
const uploadToS3 = async (fileBuffer, fileName, fileType) => {
    const fileKey = `posts/${Date.now()}-${fileName}`;
    
    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: fileType
    };

    try {
        await s3.send(new PutObjectCommand(params));
        return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw new Error("Failed to upload image to S3");
    }
};

const createPost = async (req, res) => {
    const { content } = req.body;
    let imageUrl = "";

    try {
        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }


        //  If an image is uploaded, send it to S3
        if (req.file) {
            imageUrl = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
        }

        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized: User ID is missing" });
        }

        // Save post in MongoDB
        const newPost = await Post.create({
            content,
            imageUrl,
            user: req.userId // Ensure user ID is being stored
        });

        res.status(201).json(newPost);
    } catch (error) {
        console.error("CREATE POST ERROR:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "name email profilePic")
            .populate("comments.user", "name email profilePic") // ✅ populate user in comments
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


module.exports = { createPost, getPosts, upload };
