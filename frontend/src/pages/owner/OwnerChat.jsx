import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../hooks/useAuth";
import { io } from "socket.io-client";

const OwnerChat = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [clients, setClients] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState({}); // Store messages for each chat
  const [newMessageNotification, setNewMessageNotification] = useState(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user?.role === "owner") {
      fetchChats();
      fetchClients();
      testChatAPI(); // Test API connection
      initializeSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user]);

  const initializeSocket = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io("http://localhost:5000", {
      auth: {
        token: token,
      },
    });

    newSocket.on("connect", () => {
      console.log("Connected to chat server");
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from chat server");
    });

    newSocket.on("message_received", (data) => {
      // Store message in chatMessages for the specific chat
      setChatMessages((prev) => ({
        ...prev,
        [data.chatId]: [...(prev[data.chatId] || []), data.message],
      }));

      // Update current messages if this is the selected chat
      if (selectedChat && data.chatId === selectedChat._id) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }

      // Update chat list in real-time
      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat._id === data.chatId) {
            // Show notification for new messages from other chats
            if (chat._id !== selectedChat?._id) {
              setNewMessageNotification({
                chatId: data.chatId,
                sender: data.message.sender?.fullName || "Someone",
                message: data.message.content,
              });
              // Clear notification after 3 seconds
              setTimeout(() => setNewMessageNotification(null), 3000);
            }

            return {
              ...chat,
              lastMessage: {
                content: data.message.content,
                timestamp: data.message.timestamp,
              },
              updatedAt: data.message.timestamp,
              unreadCount:
                chat._id === selectedChat?._id ? 0 : chat.unreadCount + 1,
            };
          }
          return chat;
        });
      });
    });

    newSocket.on("user_typing", (data) => {
      if (selectedChat && data.chatId === selectedChat._id) {
        if (data.isTyping) {
          setTypingUsers((prev) => {
            if (!prev.includes(data.userName)) {
              return [...prev, data.userName];
            }
            return prev;
          });
        } else {
          setTypingUsers((prev) =>
            prev.filter((name) => name !== data.userName)
          );
        }
      }
    });

    setSocket(newSocket);
  };

  const testChatAPI = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/chat/test", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Chat API test:", data);
    } catch (error) {
      console.error("Chat API test failed:", error);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      // Clear typing users when switching chats
      setTypingUsers([]);

      // Join chat room for real-time updates
      if (socket) {
        socket.emit("join_chat", selectedChat._id);
      }

      // Use stored messages if available, otherwise fetch from API
      if (chatMessages[selectedChat._id]) {
        setMessages(chatMessages[selectedChat._id]);
      } else {
        fetchMessages(selectedChat._id);
      }
    }

    return () => {
      // Leave chat room when component unmounts or chat changes
      if (socket && selectedChat) {
        socket.emit("leave_chat", selectedChat._id);
      }
    };
  }, [selectedChat, socket]);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/chat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setChats(data.chats);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/chat/users/clients",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setClients(data.clients);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/chat/${chatId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success && data.chat && data.chat.messages) {
        // Filter out messages with null senders
        const validMessages = data.chat.messages.filter(
          (message) => message.sender
        );

        // Store messages for this chat
        setChatMessages((prev) => ({
          ...prev,
          [chatId]: validMessages,
        }));

        setMessages(validMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  const createNewChat = async () => {
    if (!selectedClient) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/chat/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otherUserId: selectedClient }),
      });
      const data = await response.json();
      if (data.success) {
        // Format the chat data to match the expected structure
        const formattedChat = {
          _id: data.chat._id,
          otherParticipant: data.chat.participants.find(
            (participant) => participant._id.toString() !== user._id.toString()
          ),
          lastMessage: data.chat.lastMessage,
          unreadCount: 0,
          updatedAt: data.chat.updatedAt,
        };

        setSelectedChat(formattedChat);
        setShowNewChatModal(false);
        setSelectedClient("");
        fetchChats(); // Refresh chats list
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem("token");
      const requestBody = {
        chatId: selectedChat._id,
        content: newMessage,
      };

      console.log("Sending message with:", requestBody);

      const response = await fetch("http://localhost:5000/api/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.success && data.message && data.message.sender) {
        const newMessages = [...messages, data.message];
        setMessages(newMessages);

        // Update stored messages for this chat
        setChatMessages((prev) => ({
          ...prev,
          [selectedChat._id]: newMessages,
        }));

        // Update chat list in real-time
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat._id === selectedChat._id) {
              return {
                ...chat,
                lastMessage: {
                  content: data.message.content,
                  timestamp: data.message.timestamp,
                },
                updatedAt: data.message.timestamp,
                unreadCount: 0, // Reset unread count for current chat
              };
            }
            return chat;
          });
        });

        setNewMessage("");
      } else {
        console.error("Message send failed:", data);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (socket && selectedChat) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit("typing", {
          chatId: selectedChat._id,
          isTyping: true,
        });
      }

      // Clear typing indicator after 3 seconds of no typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit("typing", {
          chatId: selectedChat._id,
          isTyping: false,
        });
      }, 3000);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return messageTime.toLocaleDateString();
  };

  if (user?.role !== "owner") {
    return (
      <Layout>
        <div className="bg-[#30343c] min-h-screen w-full text-white p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Access Denied</h1>
            <p>This page is only accessible to owners.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white">
        <div className="max-w-7xl mx-auto h-screen flex">
          {/* Sidebar - Chat List */}
          <div className="w-1/3 bg-[#2a2d35] border-r border-gray-600 flex flex-col">
            <div className="p-4 border-b border-gray-600">
              <h1 className="text-xl font-bold mb-4">Messages</h1>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                New Chat with Client
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chats
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 border-b border-gray-600 cursor-pointer hover:bg-[#3a3d45] transition-all duration-200 ${
                      selectedChat?._id === chat._id ? "bg-[#3a3d45]" : ""
                    } ${
                      chat.unreadCount > 0
                        ? "bg-[#2d3142] border-l-4 border-l-green-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {chat.otherParticipant?.fullName
                            ?.charAt(0)
                            ?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium truncate">
                            {chat.otherParticipant?.fullName || "Unknown User"}
                          </h3>
                          <span className="text-xs text-gray-400 ml-2">
                            {formatLastMessageTime(
                              chat.lastMessage?.timestamp || chat.updatedAt
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 truncate">
                          {chat.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                      {chat.unreadCount > 0 && (
                        <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-600 bg-[#2a2d35]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {selectedChat.otherParticipant?.fullName
                          ?.charAt(0)
                          ?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-medium">
                        {selectedChat.otherParticipant?.fullName ||
                          "Unknown User"}
                      </h2>
                      <p className="text-sm text-gray-400">Client</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    if (!message.sender) {
                      return null; // Skip messages with null sender
                    }

                    const isOwnMessage = message.sender._id === user._id;

                    return (
                      <div
                        key={message._id}
                        className={`flex ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? "bg-green-600 text-white"
                              : "bg-gray-600 text-white"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />

                  {/* Typing indicators */}
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-gray-600 text-white px-4 py-2 rounded-lg">
                        <p className="text-sm italic">
                          {typingUsers.join(", ")}{" "}
                          {typingUsers.length === 1 ? "is" : "are"} typing...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-600 bg-[#2a2d35]">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-green-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-xl font-medium mb-2">
                    Select a chat to start messaging
                  </h2>
                  <p className="text-gray-400">
                    Choose an existing chat or start a new one with a client
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Message Notification */}
        {newMessageNotification && (
          <div className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm animate-pulse">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="font-medium">
                {newMessageNotification.sender}
              </span>
            </div>
            <p className="text-sm mt-1 truncate">
              {newMessageNotification.message}
            </p>
          </div>
        )}

        {/* New Chat Modal */}
        {showNewChatModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#2a2d35] p-6 rounded-lg w-96">
              <h3 className="text-lg font-bold mb-4">Start New Chat</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Select Client:
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-green-500"
                >
                  <option value="">Choose a client...</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowNewChatModal(false);
                    setSelectedClient("");
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createNewChat}
                  disabled={!selectedClient || loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? "Creating..." : "Start Chat"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OwnerChat;
