const express = require("express");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config();
const Video = require("../models/Video");
const router = express.Router();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

router.get("/generate-presigned-url", async (req, res) => {
    try {
        const { fileType } = req.query;

        if (!fileType) return res.status(400).json({ message: "File type is required" });

        const fileName = `videos/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileType.split("/")[1]}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileName,
            ContentType: fileType,
        });

        const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

        res.status(200).json({
            presignedUrl,
            fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
        });

    } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        res.status(500).json({ message: "Could not generate URL" });
    }
});


router.post("/save-video", async (req, res) => {
    const { videoUrl, thumbnailUrl, title, description, userId } = req.body;

    if (!videoUrl || !userId) return res.status(400).json({ message: "Invalid data" });

    try {
        const video = await Video.create({ videoUrl, thumbnailUrl, title, description, user: userId });
        res.status(201).json(video);
    } catch (error) {
        res.status(500).json({ message: "Could not save video error" +error });
    }
});

router.get("/videos", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const videos = await Video.find()
            .populate("user", "name profilePic")                  // 👍 for video uploader
            .populate("comments.user", "name profilePic")         // ✅ populate comment authors
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: "Error fetching videos" });
    }
});


router.post("/like/:videoId", async (req, res) => {
    const { userId } = req.body;
    const { videoId } = req.params;

    try {
        const video = await Video.findById(videoId);
        if (!video) return res.status(404).json({ message: "Video not found" });

        if (video.likes.includes(userId)) {
            video.likes.pull(userId);
        } else {
            video.likes.push(userId);
        }

        await video.save();
        res.status(200).json({ likes: video.likes.length });
    } catch (error) {
        res.status(500).json({ message: "Error liking video" });
    }
});

router.post("/comment/:videoId", async (req, res) => {
    const { userId, text } = req.body;
    const { videoId } = req.params;

    if (!text) return res.status(400).json({ message: "Comment cannot be empty" });

    try {
        const video = await Video.findById(videoId);
        if (!video) return res.status(404).json({ message: "Video not found" });

        video.comments.push({ user: userId, text });
        await video.save();

        res.status(200).json(video.comments);
    } catch (error) {
        res.status(500).json({ message: "Error commenting" });
    }
});

module.exports = router;
