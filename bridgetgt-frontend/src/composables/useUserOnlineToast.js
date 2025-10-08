import { useSessionStore } from '@/stores/sessionStore';

/**
 * Composable to show user online notifications
 */
export function useUserOnlineToast() {
  const sessionStore = useSessionStore();

  /**
   * Show a toast notification when a user comes online
   * @param {Object} user - User object with username and avatar_url
   */
  function showUserOnline(user) {
    if (user && user.username) {
      sessionStore.newOnlineUser = user;
    }
  }

  return {
    showUserOnline
  };
}
