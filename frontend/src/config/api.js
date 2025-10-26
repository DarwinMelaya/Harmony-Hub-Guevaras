// API Configuration
// You can change this URL based on your environment
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const API_URL = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
export const API_BASE_URL = `${API_URL}/api`;

// Socket.io URL
export const SOCKET_URL = API_URL;
