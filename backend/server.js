const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const compression = require("compression");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
require("dotenv").config();

// Import passport configuration
require("./config/passport")(passport);

// Initialize Supabase Storage
require("./config/supabase");

const app = express();
const server = http.createServer(app);

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Middleware
// Enable gzip compression for all responses
app.use(compression());

app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  session({
    secret: "yourSecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/inventory", require("./routes/inventory"));
app.use("/api/packages", require("./routes/packages"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/units", require("./routes/units"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/payment-info", require("./routes/paymentInfo"));
app.use("/api/feedback", require("./routes/feedback"));

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Set Socket.IO instance in chat controller
const { setSocketIO } = require("./controllers/chatController");
setSocketIO(io);

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return next(
        new Error("Authentication error: User not found or inactive")
      );
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.fullName} (${socket.user.role})`);

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);

  // Handle joining chat room
  socket.on("join_chat", (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`User ${socket.user.fullName} joined chat ${chatId}`);
  });

  // Handle leaving chat room
  socket.on("leave_chat", (chatId) => {
    socket.leave(`chat_${chatId}`);
    console.log(`User ${socket.user.fullName} left chat ${chatId}`);
  });

  // Handle new message
  socket.on("new_message", (data) => {
    // Broadcast to all users in the chat room except sender
    socket.to(`chat_${data.chatId}`).emit("message_received", {
      chatId: data.chatId,
      message: data.message,
      sender: socket.user,
    });
  });

  // Handle typing indicators
  socket.on("typing", (data) => {
    socket.to(`chat_${data.chatId}`).emit("user_typing", {
      chatId: data.chatId,
      userId: socket.userId,
      userName: socket.user.fullName,
      isTyping: data.isTyping,
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.fullName}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
