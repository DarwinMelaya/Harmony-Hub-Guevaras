import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../hooks/useAuth";

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
    }
  }, [user]);

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
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);

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
        const validMessages = data.chat.messages.filter(message => message.sender);
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
        setSelectedChat(data.chat);
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
        setMessages([...messages, data.message]);
        setNewMessage("");
        fetchChats(); // Update last message in chats list
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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
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
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 border-b border-gray-600 cursor-pointer hover:bg-[#3a3d45] transition-colors ${
                    selectedChat?._id === chat._id ? "bg-[#3a3d45]" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {chat.otherParticipant.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {chat.otherParticipant.fullName}
                      </h3>
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
                        {selectedChat.otherParticipant.fullName
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-medium">
                        {selectedChat.otherParticipant.fullName}
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
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-600 bg-[#2a2d35]">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
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
