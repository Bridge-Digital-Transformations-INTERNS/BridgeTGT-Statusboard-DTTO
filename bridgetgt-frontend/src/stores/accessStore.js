import { defineStore } from "pinia";
import api from "@/utils/api";
import { ref } from "vue";

export const useAccessStore = defineStore("access", () => {
  const isAuthenticated = ref(false);
  const accessToken = ref(null);
  const isLoading = ref(false);
  const errorMessage = ref("");

  //LOGIN AS ADMIN
  async function login(accessKey) {
    isLoading.value = true;
    errorMessage.value = "";
    try {
      const response = await api.post("/auth/company-key", { key: accessKey });
      const token = response.data.token;
      const sessionToken = response.data.session_token;
      localStorage.setItem("jwt_token", token);
      if (sessionToken) {
        localStorage.setItem("sessionToken", sessionToken);
      }
      isAuthenticated.value = true;
      accessToken.value = token;
      
      // Start session check after successful login
      const { useSessionStore } = await import("@/stores/sessionStore");
      const sessionStore = useSessionStore();
      sessionStore.startSessionCheck();
      
      return true;
    } catch (error) {
      //HANDLE DUPLICATE LOGIN
      if (error.response?.status === 409) {
        errorMessage.value = error.response?.data?.error || "This account is already logged in on another device.";
      } else {
        errorMessage.value = error.response?.data?.error || error.response?.data?.message || "Wrong access key, Please try again.";
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  //LOGOUT UNYA I SET AND IS_AUTH = FALSE PARA DLI MA COUNT AS ONLINE
  function logout() {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("loginTime");
    isAuthenticated.value = false;
    accessToken.value = null;
    errorMessage.value = "";
  }

  //FOR FETCHING ONLINE PURPOSES - Check if session exists and not expired
  function initializeAuth() {
    const token = localStorage.getItem("jwt_token");
    const sessionToken = localStorage.getItem("sessionToken");
    const loginTime = localStorage.getItem("loginTime");
    
    if (token && sessionToken && loginTime) {
      // Check if session expired (1 hour)
      const now = Date.now();
      const elapsed = now - parseInt(loginTime, 10);
      const oneHour = 60 * 60 * 1000;
      
      if (elapsed < oneHour) {
        // Session still valid
        isAuthenticated.value = true;
        accessToken.value = token;
        return true;
      } else {
        // Session expired, clear storage
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("loginTime");
        isAuthenticated.value = false;
        accessToken.value = null;
        return false;
      }
    } else if (token) {
      // Legacy token without session
      isAuthenticated.value = true;
      accessToken.value = token;
      return true;
    }
    return false;
  }
  
  initializeAuth();

  return {
    isAuthenticated,
    accessToken,
    isLoading,
    errorMessage,
    login,
    logout,
    initializeAuth,
  };
});
