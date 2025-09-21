const express = require("express");
const router = express.Router();
const {
  getUserChats,
  getChatMessages,
  createOrGetChat,
  sendMessage,
  getOwners,
  getClients,
  markMessagesAsRead,
} = require("../controllers/chatController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// All routes require authentication
router.use(authenticateToken);

// Get all chats for the authenticated user
router.get("/", getUserChats);

// Get specific chat with messages
router.get("/:chatId/messages", getChatMessages);

// Create or get existing chat between client and owner
router.post("/create", createOrGetChat);

// Send a message
router.post("/send", sendMessage);

// Mark messages as read
router.put("/:chatId/read", markMessagesAsRead);

// Get all owners (for clients to start chats)
router.get("/users/owners", authorizeRoles("client"), getOwners);

// Get all clients (for owners to start chats)
router.get("/users/clients", authorizeRoles("owner"), getClients);

// Test endpoint to debug chat issues
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Chat API is working",
    user: req.user,
    userId: req.userId
  });
});

module.exports = router;
