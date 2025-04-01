const Video = require("../models/Video");
const mongoose = require("mongoose");

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
            console.log("📤 Received Share Event:", data);  // ✅ Debugging
            addShare(io, data.videoId, data.userId);
        }); 

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
        io.emit("likeUpdate", { videoId, likes: video.likes.length });
        await video.save();
        console.log(`👍 Like Updated: Video ID: ${videoId}, Likes: ${video.likes.length}`);
    } catch (error) {
        console.error("❌ Error updating likes:", error);
    }
}


async function addComment(io, videoId, userId, text) {
    try {
        const video = await Video.findById(videoId);
        if (!video) return;

        video.comments.push({ user: userId, text });

        // Emit the comment update to all connected clients
        io.emit("commentUpdate", { videoId, comments: video.comments.length });
        await video.save();
        console.log(`💬 Comment Updated: Video ID: ${videoId}, Comments: ${video.comments.length}`);
    } catch (error) {
        console.error("Error adding comment:", error);
    }
}

async function addShare(io, videoId, userId) {
    try {
        const video = await Video.findById(videoId);
        if (!video){
            console.log("⚠️ Video not found "+videoId+" "+userId);
            return;
        }

        video.shares.push(userId); 

        // Emit the share update to all connected clients
        io.emit("shareUpdate", { videoId, shares: video.shares.length });
        await video.save();
        console.log(`🔗 Share Updated: Video ID: ${videoId}, Shares: ${video.shares.length}`);
    } catch (error) {
        console.error("Error adding share:", error);
    }
}

module.exports = setupWebSocket;
