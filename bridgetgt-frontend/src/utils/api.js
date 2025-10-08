import axios from "axios";
import router from "@/router";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  const sessionToken = localStorage.getItem("sessionToken");
  
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (sessionToken) config.headers["x-session-token"] = sessionToken;
  
  return config;
});

// Response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401 error (Unauthorized), auto-logout immediately
    if (error.response?.status === 401) {
      // Import stores dynamically to avoid circular dependencies
      const { useSessionStore } = await import("@/stores/sessionStore");
      const sessionStore = useSessionStore();
      
      // Session is invalid, logout user
      sessionStore.autoLogout();
    }
    
    return Promise.reject(error);
  }
);

export default api;
