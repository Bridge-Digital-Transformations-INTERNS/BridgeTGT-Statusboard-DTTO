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
  let heartbeatInterval = null;
  let lastActivityTime = Date.now();
  let activityListenersAttached = false;

  //VALIDATE SESSION ON APP LOAD
  async function validateSession() {
    const sessionToken = localStorage.getItem("sessionToken");
    if (!sessionToken) return false;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/validate-session`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-session-token": sessionToken 
        },
      });
      
      if (!response.ok) {
        // Only auto logout if status is 401 (unauthorized)
        if (response.status === 401) {
          await autoLogout();
        }
        return false;
      }
      
      // Session is valid, update activity timestamp
      lastActivityTime = Date.now();
      
      return true;
    } catch (err) {
      console.error("Session validation failed:", err);
      // Don't auto logout on network errors, only on explicit 401
      return false;
    }
  }
  //AUTO LOGOUT WHEN SESSION IS INVALID
  async function autoLogout() {
    stopHeartbeat();
    
    // Show session expiry notification
    showError("Session Expired", "Session has expired due to inactivity.");
    
    // Clear local storage
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("jwt_token");
    
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

  //FETCH ALL OL USERS
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

  //TRACK USER ACTIVITY
  function trackActivity() {
    lastActivityTime = Date.now();
  }

  //ATTACH ACTIVITY LISTENERS
  function attachActivityListeners() {
    if (activityListenersAttached) return;
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });
    
    activityListenersAttached = true;
  }

  //REMOVE ACTIVITY LISTENERS
  function removeActivityListeners() {
    if (!activityListenersAttached) return;
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, trackActivity);
    });
    
    activityListenersAttached = false;
  }

  //SEND HEARTBEAT TO KEEP SESSION ALIVE 
  async function sendHeartbeat() {
    const sessionToken = localStorage.getItem("sessionToken");
    if (!sessionToken) return;
    // CHECK INACTIVITY PAG 30MINUTES
    const timeSinceActivity = Date.now() - lastActivityTime;
    const thirtyMinutes = 30 * 60 * 1000;
    
    if (timeSinceActivity < thirtyMinutes) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/heartbeat`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-session-token": sessionToken 
          },
        });
        // AUTO LOGOUT IF SESSION EXPIRED
        if (!response.ok && response.status === 401) {
          await autoLogout();
        }
      } catch (err) {
        console.error("Heartbeat failed:", err);
      }
    }
  }

  //START HEARTBEAT INTERVAL
  function startHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
    
    // Attach activity listeners
    attachActivityListeners();
    
    // Send initial heartbeat
    sendHeartbeat();
    
    // Check and send heartbeat every 5 minutes
    heartbeatInterval = setInterval(() => {
      sendHeartbeat();
    }, 5 * 60 * 1000); 
  }

  //STOP HEARTBEAT
  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    removeActivityListeners();
  }

  //LOGOUT
  function logout() {
    stopHeartbeat();
    
    fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "POST",
      headers: { "x-session-token": localStorage.getItem("sessionToken") },
    }).finally(() => {
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("jwt_token");
      const accessStore = useAccessStore();
      const githubAuthStore = useGitHubAuthStore();
      accessStore.logout();
      githubAuthStore.signOut();
      router.push("/login");
    });
  }

  //FALSE TOAST 
  function clearNewOnlineUser() {
    newOnlineUser.value = null;
  }

  return { 
    onlineUsers,
    newOnlineUser,
    fetchOnlineUsers, 
    logout, 
    startHeartbeat, 
    stopHeartbeat,
    sendHeartbeat,
    clearNewOnlineUser,
    validateSession,
    autoLogout
  };
});
