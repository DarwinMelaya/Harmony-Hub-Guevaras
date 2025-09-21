const Chat = require("../models/Chat");
const User = require("../models/User");

// Socket.IO instance (will be set from server.js)
let io = null;

// Function to set Socket.IO instance
const setSocketIO = (socketIO) => {
  io = socketIO;
};

// Get all chats for a user
const getUserChats = async (req, res) => {
  try {
    const userId = req.userId;

    const chats = await Chat.find({
      participants: userId,
      isActive: true,
    })
      .populate("participants", "fullName email role profilePhoto")
      .populate("lastMessage.sender", "fullName")
      .sort({ updatedAt: -1 });

    // Format chats to include other participant info
    const formattedChats = chats
      .map((chat) => {
        const otherParticipant = chat.participants.find(
          (participant) => participant._id.toString() !== userId.toString()
        );

        // Skip chats where otherParticipant is not found
        if (!otherParticipant) {
          return null;
        }

        return {
          _id: chat._id,
          otherParticipant: {
            _id: otherParticipant._id,
            fullName: otherParticipant.fullName,
            email: otherParticipant.email,
            role: otherParticipant.role,
            profilePhoto: otherParticipant.profilePhoto,
          },
          lastMessage: chat.lastMessage,
          unreadCount: chat.messages.filter(
            (msg) =>
              !msg.readBy.some(
                (read) => read.user.toString() === userId.toString()
              )
          ).length,
          updatedAt: chat.updatedAt,
        };
      })
      .filter((chat) => chat !== null); // Remove null entries

    res.json({
      success: true,
      chats: formattedChats,
    });
  } catch (error) {
    console.error("Error getting user chats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
    });
  }
};

// Get specific chat with messages
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
      isActive: true,
    })
      .populate("participants", "fullName email role profilePhoto")
      .populate("messages.sender", "fullName email role profilePhoto")
      .populate("messages.readBy.user", "fullName");

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Mark messages as read for current user
    await chat.markAsRead(userId);

    res.json({
      success: true,
      chat: {
        _id: chat._id,
        participants: chat.participants,
        messages: chat.messages,
        lastMessage: chat.lastMessage,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error getting chat messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat messages",
    });
  }
};

// Create or get existing chat between client and owner
const createOrGetChat = async (req, res) => {
  try {
    const userId = req.userId;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "Other user ID is required",
      });
    }

    // Verify the other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if current user is client and other user is owner, or vice versa
    const currentUser = await User.findById(userId);
    const isValidChat =
      (currentUser.role === "client" && otherUser.role === "owner") ||
      (currentUser.role === "owner" && otherUser.role === "client");

    if (!isValidChat) {
      return res.status(403).json({
        success: false,
        message: "Chat is only allowed between clients and owners",
      });
    }

    // Find or create chat
    const chat = await Chat.findOrCreateChat(userId, otherUserId);

    res.json({
      success: true,
      chat: {
        _id: chat._id,
        participants: chat.participants,
        lastMessage: chat.lastMessage,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating/getting chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create or get chat",
    });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { chatId, content, messageType = "text" } = req.body;
    const userId = req.userId;

    console.log("Send message request:", {
      chatId,
      content,
      messageType,
      userId,
    });

    if (!chatId || !content) {
      return res.status(400).json({
        success: false,
        message: "Chat ID and message content are required",
      });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
      isActive: true,
    });

    console.log("Found chat:", chat ? "Yes" : "No");

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const message = await chat.addMessage(userId, content, messageType);

    // Get the latest message from the chat (the one we just added)
    const updatedChat = await Chat.findById(chatId).populate(
      "messages.sender",
      "fullName email role profilePhoto"
    );

    // Get the last message (which should be the one we just added)
    const latestMessage = updatedChat.messages[updatedChat.messages.length - 1];

    if (!latestMessage || !latestMessage.sender) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve sent message",
      });
    }

    // Emit real-time message to chat participants
    if (io) {
      io.to(`chat_${chatId}`).emit("message_received", {
        chatId: chatId,
        message: latestMessage,
        sender: latestMessage.sender,
      });
    }

    res.json({
      success: true,
      message: latestMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    console.error("Request body:", req.body);
    console.error("User ID:", req.userId);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all owners (for clients to start chats)
const getOwners = async (req, res) => {
  try {
    const owners = await User.find({
      role: "owner",
      isActive: true,
    }).select("fullName email profilePhoto");

    res.json({
      success: true,
      owners,
    });
  } catch (error) {
    console.error("Error getting owners:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch owners",
    });
  }
};

// Get all clients (for owners to start chats)
const getClients = async (req, res) => {
  try {
    const clients = await User.find({
      role: "client",
      isActive: true,
    }).select("fullName email profilePhoto");

    res.json({
      success: true,
      clients,
    });
  } catch (error) {
    console.error("Error getting clients:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
    });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
      isActive: true,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const unreadCount = await chat.markAsRead(userId);

    res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
    });
  }
};

module.exports = {
  getUserChats,
  getChatMessages,
  createOrGetChat,
  sendMessage,
  getOwners,
  getClients,
  markMessagesAsRead,
  setSocketIO,
};
