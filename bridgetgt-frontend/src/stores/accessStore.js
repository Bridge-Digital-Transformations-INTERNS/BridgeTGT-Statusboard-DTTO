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
    isAuthenticated.value = false;
    accessToken.value = null;
    errorMessage.value = "";
  }

  //FOR FETCHING ONLINE PURPOSES
  function initializeAuth() {
    const token = localStorage.getItem("jwt_token");
    if (token) {
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
