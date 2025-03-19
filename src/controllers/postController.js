const Post = require("../models/postModel");
const upload = require('../middlewares/multerConfig'); // Import multer config


const cloudinary = require("../cloudinary");


const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'posts' }, // Optionally specify a folder in Cloudinary
            (error, result) => {
                if (error) {
                    reject(error); // If there is an error, reject the promise
                } else {
                    resolve(result.secure_url); // Resolve the promise with the secure URL
                }
            }
        );
        stream.end(fileBuffer); // Pass the file buffer directly to Cloudinary
    });
};

// Create a post
const createPost = async (req, res) => {
    const { content } = req.body; // Extract content from request body
    let imageUrl = '';

    try {
        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        // Check if an image file was uploaded
        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer); // Upload the file and get the URL
        }

        // Create the new post in the database
        const newPost = await Post.create({
            content,
            imageUrl, // Set the imageUrl or leave it empty if no image
            user: req.userId // Get the userId from the auth middleware
        });

        res.status(201).json(newPost);
    } catch (error) {
        console.log("CREATE POST ERROR " + error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


// Get all posts
const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate("user", "name email").sort({ createdAt: -1 }); // Fetch posts and sort by recent
        res.status(200).json(posts);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


// const likePost = async (req, res) => {
//     const { postId } = req.params;

//     try {
//         const post = await Post.findById(postId).populate("user", "name email"); // Populate the user field

//         if (!post) {
//             return res.status(404).json({ message: "Post not found" });
//         }

//         // Toggle like/unlike
//         const liked = post.likes.includes(req.userId);
//         if (liked) {
//             post.likes = post.likes.filter((id) => id.toString() !== req.userId); // Unlike
//         } else {
//             post.likes.push(req.userId); // Like the post
//         }

//         await post.save();
//         res.status(200).json(post); // Send back the updated post with populated user
//     } catch (error) {
//         res.status(500).json({ message: "Something went wrong" });
//         console.log(error);
//     }
// };

const likePost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user.id; // Extract user ID from middleware

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user already liked the post
        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        // ✅ Emit WebSocket Event (Now `req.io` is defined)
        req.io.emit("postLiked", { postId, userId, likesCount: post.likes.length });

        res.status(200).json({
            message: alreadyLiked ? "Post unliked" : "Post liked",
            likes: post.likes.length
        });

    } catch (error) {
        console.error("Error liking post:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



module.exports = { createPost, getPosts, likePost };
