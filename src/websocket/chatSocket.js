const Chat = require("../models/chat");
const Message = require("../models/message");

const chatSocketHandler = (io, socket) => {
  // Join a chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat: ${chatId}`);
  });

  // Leave a chat room
  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);
    console.log(`Socket ${socket.id} left chat: ${chatId}`);
  });

socket.on("send_message", (data) => {
  let parsedData;
  try {
    parsedData = typeof data === 'string' ? JSON.parse(data) : data;
  } catch (e) {
    console.error("Invalid JSON:", data);
    return;
  }

  const { chat, sender, text } = parsedData;

  // Check if any required field is missing
  if (!chat || !sender || !text) {
    console.error("Missing required fields:", { chat, sender, text });
    return;
  }

  const message = new Message({ chat, sender, text });

message.save()
  .then((savedMessage) =>
    savedMessage.populate("sender", "name profilePic")  // populate fields
  )
  .then((populatedMessage) => {
    io.to(chat).emit("new_message", populatedMessage); // now it sends a full JSON object
  })
  .catch((err) => {
    console.error("Error saving message:", err);
  });
});


  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
};

module.exports = chatSocketHandler;
