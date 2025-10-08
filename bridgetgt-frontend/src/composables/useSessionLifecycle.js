import { onMounted, onUnmounted } from "vue";
import { useSessionStore } from "@/stores/sessionStore";

export function useSessionLifecycle() {
  const sessionStore = useSessionStore();
  // Handle browser close event
  const handleBeforeUnload = (event) => {
    const sessionToken = localStorage.getItem("sessionToken");
    if (sessionToken) {
      sessionStorage.setItem("isClosing", "true");
    }
  };
  // Check if page was refreshed (not closed)
  const handlePageLoad = () => {
    const wasClosing = sessionStorage.getItem("isClosing");
    if (wasClosing) {
      sessionStorage.removeItem("isClosing");
    }
  };
  // Handle visibility change (for tab switching)
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      const sessionToken = localStorage.getItem("sessionToken");
      const isClosing = sessionStorage.getItem("isClosing");

      if (sessionToken && !isClosing) {
        // pagehide event will handle actual close
      }
    }
  };

  // Logout only on actual tab/window close, not on refresh
  const handlePageHide = (event) => {
    // persisted = true means page is going into back/forward cache (navigation)
    // persisted = false means page is actually closing
    if (!event.persisted) {
      const sessionToken = localStorage.getItem("sessionToken");
      if (sessionToken) {
        const blob = new Blob(
          [JSON.stringify({ session_token: sessionToken })],
          { type: "application/json" }
        );
        navigator.sendBeacon(
          `${import.meta.env.VITE_API_URL}/auth/logout`,
          blob
        );
      }
    }
  };

  // Initialize session on mount
  const initializeSession = () => {
    handlePageLoad();

    const sessionToken = localStorage.getItem("sessionToken");
    if (sessionToken) {
      // Check if session is expired
      if (sessionStore.isSessionExpired()) {
        sessionStore.autoLogout();
      } else {
        // Start periodic session check
        sessionStore.startSessionCheck();
      }
    }
  };

  // Register event listeners
  const registerListeners = () => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);
  };

  // Cleanup event listeners
  const unregisterListeners = () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    window.removeEventListener("pagehide", handlePageHide);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };

  // Setup lifecycle hooks
  const setupLifecycle = () => {
    onMounted(() => {
      initializeSession();
      registerListeners();
    });

    onUnmounted(() => {
      sessionStore.stopSessionCheck();
      unregisterListeners();
    });
  };

  return {
    setupLifecycle,
    initializeSession,
    registerListeners,
    unregisterListeners,
  };
}
