import { ref } from "vue";

/**
 * Unified authentication composable
 * Consolidates common authentication patterns from accessStore and githubAuthStore
 */
export function useUnifiedAuth() {
  const isInitializing = ref(true);
  const authError = ref("");

  /**
   * Generic token validation with configurable expiry
   * @param {string} tokenKey - localStorage key for token
   * @param {string} timestampKey - localStorage key for timestamp
   * @param {number} expiryHours - Token expiry in hours (default 24)
   * @returns {boolean} - Whether token is valid
   */
  const validateStoredToken = (tokenKey, timestampKey, expiryHours = 24) => {
    const storedToken = localStorage.getItem(tokenKey);
    const tokenTimestamp = localStorage.getItem(timestampKey);

    if (!storedToken || !tokenTimestamp) {
      return false;
    }

    const tokenAge = Date.now() - parseInt(tokenTimestamp);
    const isTokenValid = tokenAge < expiryHours * 60 * 60 * 1000;

    return isTokenValid;
  };

  /**
   * Generic session cleanup
   * @param {string[]} keys - Array of localStorage keys to remove
   */
  const clearStoredSession = (keys) => {
    keys.forEach((key) => localStorage.removeItem(key));
  };

  /**
   * Generic session storage
   * @param {Object} sessionData - Key-value pairs to store
   */
  const storeSessionData = (sessionData) => {
    Object.entries(sessionData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  };

  /**
   * Generate a unique session token
   * @param {string} prefix - Token prefix (default 'session')
   * @returns {string} - Generated token
   */
  const generateSessionToken = (prefix = "session") => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Generic authentication state initialization
   * @param {Function} validateCallback - Function to validate and set auth state
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  const initializeAuthState = async (validateCallback) => {
    isInitializing.value = true;
    authError.value = "";

    try {
      const isValid = await validateCallback();
      return isValid;
    } catch (error) {
      authError.value = error.message || "Authentication initialization failed";
      return false;
    } finally {
      isInitializing.value = false;
    }
  };

  /**
   * Wait for authentication initialization to complete
   * @param {Function} checkInitialized - Function that returns boolean if initialized
   * @param {number} timeout - Timeout in ms (default 5000)
   * @returns {Promise<boolean>} - Whether auth was successfully initialized
   */
  const waitForAuthInitialization = (checkInitialized, timeout = 5000) => {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const checkInterval = setInterval(() => {
        if (checkInitialized() || Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          resolve(checkInitialized());
        }
      }, 100);
    });
  };

  /**
   * Handle authentication errors consistently
   * @param {Error} error - The error object
   * @param {string} context - Context where error occurred
   */
  const handleAuthError = (error, context = "Authentication") => {
    const errorMessage = error.message || "An unknown error occurred";
    authError.value = `${context}: ${errorMessage}`;
    console.error(`[${context}]`, error);
  };

  return {
    isInitializing,
    authError,
    validateStoredToken,
    clearStoredSession,
    storeSessionData,
    generateSessionToken,
    initializeAuthState,
    waitForAuthInitialization,
    handleAuthError,
  };
}
