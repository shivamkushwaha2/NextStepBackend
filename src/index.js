require("dotenv").config();
const express = require("express");
const connectDB = require("../src/config/db");
const cors = require("cors");

const http = require("http");

const socketIo = require("socket.io");

const jobRoutes = require("../src/routes/jobRoutes");
const errorHandler = require("../src/middlewares/errorHandler");

const postRouter = require("../src/routes/postRoutes");
const profileRouter = require("../src/routes/profileRoutes")
const userRouter = require("../src/routes/userRoutes");

const videoRouter = require("../src/routes/videosRoutes");

const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
// Attach io to req in middleware
app.use((req, res, next) => {
  req.io = io; // Attach socket.io to each request
  next();
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api", jobRoutes);
app.get("/",(req,res)=>{
  res.send("Welcome to NextStep");
});

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
  });
});

app.use("/user",userRouter);
app.use("/posts", postRouter);
app.use("/profile",profileRouter);
app.use("/videos", videoRouter);  

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});