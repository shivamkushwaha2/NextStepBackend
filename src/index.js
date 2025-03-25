// require("dotenv").config();
// const express = require("express");
// const connectDB = require("../src/config/db");
// const cors = require("cors");

// const http = require("http");

// const socketIo = require("socket.io");

// const jobRoutes = require("../src/routes/jobRoutes");
// const errorHandler = require("../src/middlewares/errorHandler");

// const postRouter = require("../src/routes/postRoutes");
// const profileRouter = require("../src/routes/profileRoutes")
// const userRouter = require("../src/routes/userRoutes");

// const videoRouter = require("../src/routes/videosRoutes");

// const app = express();

// const server = http.createServer(app);
// const io = socketIo(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//     }
// });
// // Attach io to req in middleware
// app.use((req, res, next) => {
//   req.io = io; // Attach socket.io to each request
//   next();
// });

// app.use(cors());
// app.use(express.json());

// // Connect to MongoDB
// connectDB();

// // Routes
// app.use("/api", jobRoutes);
// app.get("/",(req,res)=>{
//   res.send("Welcome to NextStep");
// });

// // WebSocket Connection
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   socket.on("disconnect", () => {
//       console.log("A user disconnected:", socket.id);
//   });
// });

// app.use("/user",userRouter);
// app.use("/posts", postRouter);
// app.use("/profile",profileRouter);
// app.use("/videos", videoRouter);  

// // Error Handler Middleware
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

require("dotenv").config();
const express = require("express");
const connectDB = require("../src/config/db");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

// Import routes
const jobRoutes = require("../src/routes/jobRoutes");
const errorHandler = require("../src/middlewares/errorHandler");
const postRouter = require("../src/routes/postRoutes");
const profileRouter = require("../src/routes/profileRoutes");
const userRouter = require("../src/routes/userRoutes");
const videoRouter = require("../src/routes/videosRoutes");

const app = express();
const server = http.createServer(app);

// ✅ WebSockets Setup with Polling Fallback
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"] // ✅ Added Polling Fallback
});

// ✅ Log WebSocket Connection Status
io.on("connection", (socket) => {
    console.log(`🔌 New WebSocket connection: ${socket.id}`);

    // ✅ Log when a client sends a message
    socket.on("message", (data) => {
        console.log(`📩 Received message: ${JSON.stringify(data)}`);
    });

    // ✅ Handle Like Events
    socket.on("like", (data) => {
        console.log(`👍 Like Event: ${JSON.stringify(data)}`);
        io.emit("likeUpdate", data);
    });

    // ✅ Handle Comment Events
    socket.on("comment", (data) => {
        console.log(`💬 Comment Event: ${JSON.stringify(data)}`);
        io.emit("commentUpdate", data);
    });

    // ✅ Handle New Video Uploads
    socket.on("newVideo", (data) => {
        console.log(`🎥 New Video Uploaded: ${JSON.stringify(data)}`);
        io.emit("videoFeedUpdate", data);
    });

    // ✅ Keep Connection Alive (Prevents Disconnection on Render)
    setInterval(() => {
        socket.emit("ping", "keep-alive");
        console.log(`🔄 Sent Keep-Alive Ping to: ${socket.id}`);
    }, 25000);

    // ✅ Handle Disconnection
    socket.on("disconnect", () => {
        console.log(`❌ User Disconnected: ${socket.id}`);
    });
});

// ✅ Attach io to req in middleware (for future use)
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ Define API Routes
app.use("/api", jobRoutes);
app.use("/user", userRouter);
app.use("/posts", postRouter);
app.use("/profile", profileRouter);
app.use("/videos", videoRouter);

app.get("/", (req, res) => {
    res.send("🚀 Welcome to NextStep Backend");
});

// ✅ Error Handler Middleware
app.use(errorHandler);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
