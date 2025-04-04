const Video = require("../models/Video");
const mongoose = require("mongoose");
const Post = require("../models/postModel");
const setupWebSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`✅ New WebSocket connection: ${socket.id}`);
    
        // Listen for like events
        socket.on("likeEvent", (data) => {
            updateLikes(io, data.videoId, data.userId, data.isLike);
        });

        // Listen for comment events
        socket.on("commentEvent", (data) => {
            addComment(io, data.videoId, data.userId, data.comment);
        });

        socket.on("shareEvent", (data) => {
            console.log("📤 Received Share Event:", data);
            addShare(io, data.videoId, data.userId);
        }); 

        // 📝 Post Events
        socket.on("postLikeEvent", (data) => {
            console.log("Received postLikeEvent (raw):", data);
        
            updatePostLikes(io, data.postId, data.userId, data.isLike);
        });
        
        socket.on("postCommentEvent", (data) => addPostComment(io, data.postId, data.userId, data.comment));
        socket.on("postShareEvent", (data) => addPostShare(io, data.postId, data.userId));


        // Handle Disconnection
        socket.on("disconnect", () => {
            console.log(`❌ User Disconnected: ${socket.id}`);
        });
    });
};

async function updateLikes(io, videoId, userId, isLike) {
    try {
        const video = await Video.findById(videoId);
        if (!video) {
            console.log("⚠️ Video not found");
            return;
        }

        if (isLike) {
            if (!video.likes.includes(userId)) {
                video.likes.push(userId);
            }
        } else {
            // Convert ObjectIds to strings before filtering
            video.likes = video.likes.filter(id => id.toString() !== userId);
        }

        // Emit the like update to all connected clients
        // io.emit("likeUpdate", { videoId, likes: video.likes.length });
        io.emit("likeUpdate", {
            videoId,
            likes: video.likes.length,
            userLiked: video.likes.includes(userId), // ✅ Add this line
        });
        await video.save();
        console.log(`👍 Like Updated: Video ID: ${videoId}, Likes: ${video.likes.length}`);
    } catch (error) {
        console.error("❌ Error updating likes:", error);
    }
}


// async function addComment(io, videoId, userId, text) {
//     try {
//         const video = await Video.findById(videoId);
//         if (!video) return;

//         video.comments.push({ user: userId, text });

//         // Emit the comment update to all connected clients
//         io.emit("commentUpdate", { videoId, comments: video.comments.length });
//         await video.save();
//         console.log(`💬 Comment Updated: Video ID: ${videoId}, Comments: ${video.comments.length}`);
//     } catch (error) {
//         console.error("Error adding comment:", error);
//     }
// }
// Add Post Comment with full user info
async function addPostComment(io, postId, userId, text) {
    try {
        const post = await Post.findById(postId);
        if (!post) return;

        // Push comment
        post.comments.push({ user: userId, text });
        await post.save();

        // Get the last comment (the one just added)
        const latestComment = post.comments[post.comments.length - 1];

        // Populate the user
        await latestComment.populate("user", "name profilePic");

        // Emit the new comment with user info
        io.emit("postCommentUpdate", {
            postId,
            comment: {
                _id: latestComment._id,
                text: latestComment.text,
                createdAt: latestComment.createdAt,
                user: {
                    _id: latestComment.user._id,
                    name: latestComment.user.name,
                    profilePic: latestComment.user.profilePic,
                },
            },
        });

        console.log(`💬 Post Comment Added: ${latestComment.text}`);
    } catch (error) {
        console.error("❌ Error adding post comment:", error);
    }
}

async function addShare(io, videoId, userId) {
    try {
        const video = await Video.findById(videoId);
        if (!video){
            console.log("Video not found "+videoId+" "+userId);
            return;
        }

        video.shares.push(userId); 

        // Emit the share update to all connected clients
        io.emit("shareUpdate", { videoId, shares: video.shares.length });
        await video.save();
        console.log(` Share Updated: Video ID: ${videoId}, Shares: ${video.shares.length}`);
    } catch (error) {
        console.error("Error adding share:", error);
    }
}
async function updatePostLikes(io, postId, userId, isLike) {
    console.log("🛠️ updatePostLikes called with:", { postId, userId, isLike });

    if (!postId) {
        console.log("❌ Error: postId is undefined or null");
        return;
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        console.log("❌ Invalid Post ID:", postId);
        return;
    }

    try {
        const post = await Post.findById(postId);  // ✅ Use findById() instead of findOne()
        console.log("🔍 Post found:", post);

        if (!post) {
            console.log("⚠️ Post not found in DB:", postId);
            return;
        }

        if (isLike) {
            if (!post.likes.includes(userId)) {
                post.likes.push(userId);
            }
        } else {
            post.likes = post.likes.filter((uid) => uid.toString() !== userId);
        }

        // io.emit("postLikeUpdate", { postId, likes: post.likes.length });
        io.emit("postLikeUpdate", {
            postId,
            likes: post.likes.length,
            userLiked: post.likes.includes(userId), // ✅ Add this line
        });
        
        await post.save();
        console.log(`👍 Post Like Updated: Post ID: ${postId}, Likes: ${post.likes.length}`);
    } catch (error) {
        console.error("❌ Error updating post likes:", error);
    }
}



// Add Post Comment
async function addPostComment(io, postId, userId, text) {
    try {
        const post = await Post.findById(postId);
        if (!post) return;

        post.comments.push({ user: userId, text });

        io.emit("postCommentUpdate", { postId, comments: post.comments.length });
        await post.save();
        console.log(`💬 Post Comment Updated: Post ID: ${postId}, Comments: ${post.comments.length}`);
    } catch (error) {
        console.error("Error adding post comment:", error);
    }
}

//  Add Post Share
async function addPostShare(io, postId, userId) {
    try {
        const post = await Post.findById(postId);
        if (!post) {
            console.log("⚠️ Post not found");
            return;
        }

        post.shares.push(userId);

        io.emit("postShareUpdate", { postId, shares: post.shares.length });
        await post.save();
        console.log(`📤 Post Share Updated: Post ID: ${postId}, Shares: ${post.shares.length}`);
    } catch (error) {
        console.error("Error adding post share:", error);
    }
}

module.exports = setupWebSocket;
