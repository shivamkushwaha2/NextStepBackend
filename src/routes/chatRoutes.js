const express = require("express");
const auth = require("../middlewares/auth");
const {
    createOrGetChat,
    getMyChats,
    sendMessage,
    getMessages
} = require("../controllers/chatController");

const router = express.Router();

router.get("/chats", auth, getMyChats);
router.post("/send", auth, sendMessage);
router.post("/:userId", auth, createOrGetChat);
router.get("/:chatId/messages", auth, getMessages);

module.exports = router;
