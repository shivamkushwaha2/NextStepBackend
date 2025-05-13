const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/users");

const chatSocketHandler = (io, socket) => {
    // Join chat room
    socket.on("join_chat", (chatId) => {
        socket.join(chatId);
        console.log(`User joined chat room: ${chatId}`);
    });

    // Send message
    socket.on("send_message", async ({ chatId, senderId, text }) => {
        try {
            const message = await Message.create({
                chat: chatId,
                sender: senderId,
                text: text
            });

            await Chat.findByIdAndUpdate(chatId, {
                lastMessage: message._id,
                updatedAt: Date.now()
            });

            const populatedMessage = await message.populate("sender", "name profilePic");

            // Broadcast to users in the chat
            io.to(chatId).emit("receive_message", populatedMessage);
        } catch (err) {
            console.error("Error sending message:", err);
            socket.emit("error", { message: "Failed to send message." });
        }
    });

    // Leave chat (optional)
    socket.on("leave_chat", (chatId) => {
        socket.leave(chatId);
        console.log(`User left chat room: ${chatId}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected from chat WebSocket");
    });
};

module.exports = chatSocketHandler;
