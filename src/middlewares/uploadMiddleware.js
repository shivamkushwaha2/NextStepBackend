const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();
const multer = require("multer");

// ✅ Initialize S3 Client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// ✅ Multer storage setup for handling file upload in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadProfileFields = multer({ storage }).fields([
    { name: "profilePic", maxCount: 1 },
    { name: "resume", maxCount: 1 }
]);


// ✅ Function to upload file to S3 and return the URL
const uploadToS3 = async (file) => {
    if (!file) return null;

    const fileKey = `profile_pics/${Date.now()}_${file.originalname}`;
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype
    });

    await s3.send(command);
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
};

// module.exports = { upload, uploadToS3 };
module.exports = { upload, uploadToS3, uploadProfileFields };



// // ✅ Initialize AWS S3 Client
// const s3 = new S3Client({
//     region: process.env.AWS_REGION,
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//     }
// });

// // ✅ Multer Storage (Memory)
// const storage = multer.memoryStorage();

// // ✅ Configure Multer
// const upload = multer({ storage });

// // ✅ Function to Upload Image to AWS S3
// const uploadToS3 = async (file) => {
//     const fileName = `profile_pics/${Date.now()}_${file.originalname}`;
//     const params = {
//         Bucket: process.env.AWS_S3_BUCKET,
//         Key: fileName,
//         Body: file.buffer,
//         ContentType: file.mimetype,
//         ACL: "public-read"
//     };

//     const command = new PutObjectCommand(params);
//     await s3.send(command);

//     return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
// };

// module.exports = { upload, uploadToS3 };
