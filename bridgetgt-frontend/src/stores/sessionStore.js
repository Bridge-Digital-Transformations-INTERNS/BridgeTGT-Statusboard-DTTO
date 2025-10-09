import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToastNotification } from "@/composables/useToastNotification";
import { useAccessStore } from "@/stores/accessStore";
import { useGitHubAuthStore } from "@/stores/githubAuthStore";

export const useSessionStore = defineStore("session", () => {
  const onlineUsers = ref([]);
  const newOnlineUser = ref(null);
  const router = useRouter();
  const { showError } = useToastNotification();
  let sessionCheckInterval = null;
  let loginTime = null;

  //CHECK IF SESSION IS EXPIRED (1 HOUR)
  function isSessionExpired() {
    const sessionToken = localStorage.getItem("sessionToken");
    const storedLoginTime = localStorage.getItem("loginTime");
    
    if (!sessionToken || !storedLoginTime) return true;
    
    const now = Date.now();
    const elapsed = now - parseInt(storedLoginTime, 10);
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    
    return elapsed >= oneHour;
  }

  //VALIDATE SESSION - Check if 1 hour has passed
  function validateSession() {
    if (isSessionExpired()) {
      autoLogout();
      return false;
    }
    return true;
  }
  //AUTO LOGOUT WHEN SESSION IS INVALID
  function autoLogout() {
    stopSessionCheck();
    
    // Show session expiry notification
    showError("Session Expired", "Your session has expired after 1 hour. Please login again.");
    
    // Clear local storage
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("loginTime");
    
    // Clear auth stores
    const accessStore = useAccessStore();
    const githubAuthStore = useGitHubAuthStore();
    accessStore.logout();
    githubAuthStore.signOut();
    
    // Redirect to login after showing toast
    setTimeout(() => {
      router.push("/login");
    }, 500);
  }

  //FETCH ALL ONLINE USERS
  function fetchOnlineUsers() {
    fetch(`${import.meta.env.VITE_API_URL}/auth/sessions`)
      .then((res) => res.json())
      .then((users) => {
        const newUsers = Array.isArray(users) ? users : [];
        
        if (onlineUsers.value.length > 0) {
          const previousUsernames = onlineUsers.value.map(u => u.username);
          const newlyOnline = newUsers.find(
            user => !previousUsernames.includes(user.username)
          );
          
          if (newlyOnline) {
            const currentUser = localStorage.getItem("sessionToken");
            if (currentUser) {
              newOnlineUser.value = newlyOnline;
            }
          }
        }
        
        onlineUsers.value = newUsers;
      })
      .catch(() => { onlineUsers.value = []; });
  }

  //START SESSION CHECK - Check every minute if session expired
  function startSessionCheck() {
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
    }
    
    // Store login time only if not already set (preserve across page refreshes)
    const existingLoginTime = localStorage.getItem("loginTime");
    if (!existingLoginTime) {
      loginTime = Date.now();
      localStorage.setItem("loginTime", loginTime.toString());
    } else {
      loginTime = parseInt(existingLoginTime, 10);
    }
    
    // Check session expiry every minute
    sessionCheckInterval = setInterval(() => {
      if (isSessionExpired()) {
        autoLogout();
      }
    }, 60 * 1000); // Check every 1 minute
  }

  //STOP SESSION CHECK
  function stopSessionCheck() {
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
      sessionCheckInterval = null;
    }
  }

  //LOGOUT
  async function logout() {
    stopSessionCheck();
    
    try {
      // Attempt to notify backend of logout
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        headers: { "x-session-token": localStorage.getItem("sessionToken") },
      });
    } catch (error) {
      console.log('Logout API call failed:', error);
    } finally {
      // Always clear local state regardless of API call success
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("loginTime");
      
      const accessStore = useAccessStore();
      const githubAuthStore = useGitHubAuthStore();
      accessStore.logout();
      githubAuthStore.signOut();
      
      // Clear online users
      onlineUsers.value = [];
      newOnlineUser.value = null;
      
      // Navigate to login page
      await router.push("/login");
      
      // Force page reload to clear all state
      window.location.reload();
    }
  }

  //CLEAR NEW ONLINE USER NOTIFICATION
  function clearNewOnlineUser() {
    newOnlineUser.value = null;
  }

  return { 
    onlineUsers,
    newOnlineUser,
    fetchOnlineUsers, 
    logout, 
    startSessionCheck, 
    stopSessionCheck,
    clearNewOnlineUser,
    validateSession,
    autoLogout,
    isSessionExpired
  };
});
