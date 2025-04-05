const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const Project = require("../models/Project");
require("dotenv").config();

// Initialize S3 Client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

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
    const fileKey = `projects/${Date.now()}-${fileName}`;
    
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

const createProject = async (req, res) => {
    let imageUrl = "";

    try {
        const {
            title,
            description,
            githubLink,
            liveLink,
            tags,
            techStack,
            postedBy
        } = req.body;

        if (!title || !description || !postedBy) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        // Parse stringified fields
        const parsedTags = tags ? JSON.parse(tags) : [];
        const parsedTechStack = techStack ? JSON.parse(techStack) : [];
        const parsedPostedBy = postedBy ? JSON.parse(postedBy) : null;

        if (!parsedPostedBy?.userId) {
            return res.status(400).json({ message: "postedBy is required" });
        }

        // Upload image if exists
        if (req.file) {
            imageUrl = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
        }

        const newProject = new Project({
            title,
            description,
            githubLink,
            liveLink,
            image: imageUrl,
            tags: parsedTags,
            techStack: parsedTechStack,
            postedBy: parsedPostedBy,
        });

        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        console.error("CREATE PROJECT ERROR:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


module.exports = { createProject, upload };
