const Video = require("../models/Video");
const mongoose = require("mongoose");

// const setupWebSocket = (io) => {
//     io.on("connection", (socket) => {
//         console.log(`New WebSocket connection: ${socket.id}`);
    
//         socket.on("message", (message) => {
//             const data = JSON.parse(message);
            
//             if (data.videoId && data.userId) {
//                 if (data.isLike !== undefined) {
//                     updateLikes(io,data.videoId, data.userId, data.isLike);
//                 }
//                 if (data.comment) {
//                     addComment(io,data.videoId, data.userId, data.comment);
//                 }
//             }
//         });

    
//         //  Handle Disconnection
//         socket.on("disconnect", () => {
//             console.log(` User Disconnected: ${socket.id}`);
//         });
//     });
// }
//     async function updateLikes(io, videoId, userId, isLike) {
//         Video.findById(videoId).then(async (video) => {
//             if (!video) return;
            
//             if (isLike) {
//                 if (!video.likes.includes(userId)) {
//                     video.likes.push(userId);
//                 }
//             } else {
//                 video.likes.pull(userId);
//             }
            
//             io.emit("likeUpdate", { videoId, likes: video.likes.length });

//             await video.save();
//         });
//     }
    
//     function addComment(io,videoId, userId, text) {
//         Video.findById(videoId).then(async (video) => {
//             if (!video) return;
                    
//             video.comments.push({ user: userId, text });

//             io.emit("commentUpdate", { videoId, comments: video.comments.length });

//             await video.save();
    
//         });
//     }

//     module.exports = setupWebSocket;

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

module.exports = setupWebSocket;
