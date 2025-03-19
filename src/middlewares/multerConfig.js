// const multer = require("multer");
// const path = require("path");

// // Set up storage configuration for multer
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads/"); // Ensure this folder exists in your project
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
//         cb(null, file.fieldname + '-' + uniqueSuffix); // Rename file to include unique suffix
//     }
// });

// // Initialize multer with the storage configuration
// const upload = multer({ storage: storage });

// // Export the upload instance
// module.exports = upload;


const multer = require('multer');

const storage = multer.memoryStorage(); // Store files in memory as a buffer

const upload = multer({ storage });

module.exports = upload;
