const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/users");

// Create or fetch existing chat between two users
const createOrGetChat = async (req, res) => {
    const userId = req.userId;
    const targetUserId = req.params.userId;

    try {
        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId], $size: 2 }
        }).populate("participants", "name profilePic");

        if (!chat) {
            chat = await Chat.create({ participants: [userId, targetUserId] });
        }

        res.status(200).json(chat);
    } catch (err) {
        console.error("Create/Get Chat Error:", err);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// Fetch all chats for a user
const getMyChats = async (req, res) => {
    const userId = req.userId;

    try {
        const chats = await Chat.find({ participants: userId })
            .populate("participants", "name profilePic")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        res.status(200).json(chats);
    } catch (err) {
        console.error("Get Chats Error:", err);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// Send a message
const sendMessage = async (req, res) => {
    const { chatId, text } = req.body;

    try {
        const message = await Message.create({
            chat: chatId,         // Must be ObjectId
            sender: req.userId,   // Also ObjectId
            text: text
          });

        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

        res.status(201).json(message);
    } catch (err) {
        console.error("Send Message Error:", err);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// Get messages of a chat
const getMessages = async (req, res) => {
    const chatId = req.params.chatId;

    try {
        const messages = await Message.find({ chat: chatId })
            .populate("sender", "name profilePic")
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (err) {
        console.error("Get Messages Error:", err);
        res.status(500).json({ message: "Something went wrong" });
    }
};

module.exports = { createOrGetChat, getMyChats, sendMessage, getMessages };
