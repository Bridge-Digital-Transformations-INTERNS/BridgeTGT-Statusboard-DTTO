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
    localStorage.removeItem("sessionToken");
    error.value = "";
    loading.value = false;
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

  // Rehydrate user from localStorage and validate session
  async function initializeGitHubAuth() {
    const token = localStorage.getItem("jwt_token");
    const sessionToken = localStorage.getItem("sessionToken");
    
    if (token && sessionToken) {
      try {
        // Validate session with backend
        const response = await api.post("/auth/validate-session", {
          session_token: sessionToken
        });
        
        if (response.data.valid && response.data.session) {
          user.value = {
            github_id: response.data.session.github_id,
            github_login: response.data.session.username,
            username: response.data.session.username,
            name: response.data.session.name,
            avatar_url: response.data.session.avatar_url,
            role: response.data.session.account_type === 'admin' ? 'admin' : 'user',
          };
        } else {
          // Session invalid, clear storage
          localStorage.removeItem("jwt_token");
          localStorage.removeItem("sessionToken");
          user.value = null;
        }
      } catch (error) {
        // Session validation failed, clear storage
        console.log('Session validation failed:', error);
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("sessionToken");
        user.value = null;
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
      
      // Store tokens
      const token = response.data.token;
      const sessionToken = response.data.session_token;
      localStorage.setItem("jwt_token", token);
      if (sessionToken) {
        localStorage.setItem("sessionToken", sessionToken);
      }

      // Use response data directly (Laravel returns user info)
      user.value = {
        github_id: response.data.github_id,
        github_login: response.data.github_login,
        username: response.data.username || response.data.github_login,
        name: response.data.name,
        avatar_url: response.data.avatar_url,
        role: response.data.role || 'user',
      };

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
