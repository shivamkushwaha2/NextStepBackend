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
const Video = require("../src/models/Video"); 
const setupWebSocket = require("../src/websocket/websocketManager");

const app = express();
const server = http.createServer(app);

//  WebSockets Setup with Polling Fallback
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"] // ✅ Added Polling Fallback
});

setupWebSocket(io);

//  Attach io to req in middleware (for future use)
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(cors());
app.use(express.json());

//  Connect to MongoDB
connectDB();

// Define API Routes
app.use("/api", jobRoutes);
app.use("/user", userRouter);
app.use("/posts", postRouter);
app.use("/profile", profileRouter);
app.use("/videos", videoRouter);

app.get("/", (req, res) => {
    res.send("Welcome to NextStep Backend");
});

//  Error Handler Middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 80;
server.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});