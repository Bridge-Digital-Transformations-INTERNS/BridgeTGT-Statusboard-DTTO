import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/utils/api";

export const useGitHubAuthStore = defineStore("githubAuth", () => {
  const user = ref(null);
  const loading = ref(false);
  const error = ref("");
  const isAuthenticated = computed(() => !!user.value);
  const userProfile = computed(() => user.value);

  function signInWithGitHub() {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
  }
  function signOut() {
    user.value = null;
    localStorage.removeItem("jwt_token");
  }

  // JWT DECODER
  function decodeJWT(token) {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return e;
    }
  }

  // Rehydrate user from JWT in localStorage on store creation
  function initializeGitHubAuth() {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      const payload = decodeJWT(token);
      // Check if payload has GitHub info
      if (payload && payload.github_login) {
        user.value = {
          github_id: payload.github_id,
          github_login: payload.github_login,
          name: payload.name,
          avatar_url: payload.avatar_url,
          role: payload.role,
        };
      }
    }
  }

  initializeGitHubAuth();

  // DLI NA MAG CHECK IF MEMEBER BA SYA SA ORG KAY HUMANA MAN
  async function handleGitHubCallback(code) {
    loading.value = true;
    error.value = "";
    try {
      const response = await api.get(`/auth/github/exchange?code=${code}`);
      const token = response.data.token;
      const sessionToken = response.data.session_token;
      localStorage.setItem("jwt_token", token);
      if (sessionToken) {
        localStorage.setItem("sessionToken", sessionToken);
      }

      // Decode payload → set user
      const payload = decodeJWT(token);
      if (payload && payload.github_login) {
        user.value = {
          github_id: payload.github_id,
          github_login: payload.github_login,
          name: payload.name,
          avatar_url: payload.avatar_url,
          role: payload.role,
        };
      } else {
        user.value = {
          github_id: response.data.github_id,
          github_login: response.data.github_login,
          name: response.data.name,
          avatar_url: response.data.avatar_url,
          role: response.data.role,
        };
      }

      // Start heartbeat after successful login
      const { useSessionStore } = await import("@/stores/sessionStore");
      const sessionStore = useSessionStore();
      sessionStore.startHeartbeat();

      return true;
    } catch (err) {
      // Handle duplicate login (409 Conflict)
      if (err.response?.status === 409) {
        error.value = err.response?.data?.error || "This GitHub account is already logged in on another device.";
      } else {
        error.value = err.response?.data?.error || "GitHub authentication failed.";
      }
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userProfile,
    decodeJWT,
    signInWithGitHub,
    initializeGitHubAuth,
    signOut,
    handleGitHubCallback,
  };
});
