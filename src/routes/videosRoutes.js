const express = require("express");
const router = express.Router();
const s3 = require("../config/awsConfig");

router.get("/generate-presigned-url", async (req, res) => {
    try {
        const { fileType } = req.query;

        if (!fileType) return res.status(400).json({ message: "File type is required" });

        const fileName = `videos/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileType.split("/")[1]}`;

        const presignedUrl = await s3.getSignedUrlPromise("putObject", {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileName,  // ✅ Corrected to use the unique filename
            ContentType: fileType,
            Expires: 300
        });

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
    const { videoUrl, userId } = req.body;

    if (!videoUrl || !userId) return res.status(400).json({ message: "Invalid data" });

    try {
        const video = await Video.create({ videoUrl, user: userId });
        res.status(201).json(video);
    } catch (error) {
        res.status(500).json({ message: "Could not save video" });
    }
});


module.exports = router;
