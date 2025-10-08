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
    const originalRequest = error.config;
    
    // If 401 error (Unauthorized) and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Import stores dynamically to avoid circular dependencies
      const { useSessionStore } = await import("@/stores/sessionStore");
      const sessionStore = useSessionStore();
      
      // Try to validate session first before auto-logout
      const isValid = await sessionStore.validateSession();
      
      if (!isValid) {
        // Session is truly invalid, logout
        await sessionStore.autoLogout();
      } else {
        // Session was valid, retry the original request
        const token = localStorage.getItem("jwt_token");
        const sessionToken = localStorage.getItem("sessionToken");
        
        if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
        if (sessionToken) originalRequest.headers["x-session-token"] = sessionToken;
        
        return api.request(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
