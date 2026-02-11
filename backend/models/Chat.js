const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  // Participants in the chat
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],

  // Chat type: 'client-owner' for client-owner communication
  chatType: {
    type: String,
    enum: ["client-owner", "general"],
    default: "client-owner",
  },

  // Messages array
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      content: {
        type: String,
        required: true,
        trim: true,
      },
      messageType: {
        type: String,
        enum: ["text", "image", "file"],
        default: "text",
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      isRead: {
        type: Boolean,
        default: false,
      },
      readBy: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          readAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  ],

  // Last message for quick access
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },

  // Chat status
  isActive: {
    type: Boolean,
    default: true,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
ChatSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find or create a chat between two users
ChatSchema.statics.findOrCreateChat = async function (user1Id, user2Id) {
  try {
    // Look for existing chat between these two users
    let chat = await this.findOne({
      participants: { $all: [user1Id, user2Id] },
      chatType: "client-owner",
      isActive: true,
    }).populate("participants", "fullName email role");

    if (!chat) {
      // Create new chat if none exists
      chat = new this({
        participants: [user1Id, user2Id],
        chatType: "client-owner",
      });
      await chat.save();
      chat = await this.findById(chat._id).populate(
        "participants",
        "fullName email role"
      );
    }

    return chat;
  } catch (error) {
    throw error;
  }
};

// Method to add a message to the chat
ChatSchema.methods.addMessage = async function (
  senderId,
  content,
  messageType = "text"
) {
  try {
    const message = {
      sender: senderId,
      content,
      messageType,
      timestamp: new Date(),
    };

    this.messages.push(message);
    this.lastMessage = {
      content,
      sender: senderId,
      timestamp: new Date(),
    };

    await this.save();

    // Return the message with its _id (it gets assigned after save)
    const savedMessage = this.messages[this.messages.length - 1];
    return savedMessage;
  } catch (error) {
    throw error;
  }
};

// Method to mark messages as read
ChatSchema.methods.markAsRead = async function (userId) {
  try {
    const unreadMessages = this.messages.filter(
      (msg) =>
        !msg.readBy.some((read) => read.user.toString() === userId.toString())
    );

    unreadMessages.forEach((msg) => {
      msg.readBy.push({
        user: userId,
        readAt: new Date(),
      });
      msg.isRead = true;
    });

    await this.save();
    return unreadMessages.length;
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("Chat", ChatSchema);
