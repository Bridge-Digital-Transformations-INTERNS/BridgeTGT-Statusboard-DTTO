import { watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

/**
 * Composable to handle route navigation with unsaved changes confirmation
 * Uses modal dialog instead of window.confirm
 */
export function useRouteGuard(ganttStore, navigationDialog) {
  const router = useRouter();

  // Watch for pending navigation from router guard
  function checkPendingNavigation() {
    if (window.__pendingNavigation && ganttStore.hasPendingChanges) {
      const { to } = window.__pendingNavigation;
      navigationDialog.open(to.path);
      delete window.__pendingNavigation;
    }
  }

  // Handle route clicks that should check for unsaved changes
  function handleRouteNavigation(path) {
    if (ganttStore.hasPendingChanges) {
      navigationDialog.open(path);
      return false; // Prevent navigation
    }
    router.push(path);
    return true;
  }

  onMounted(() => {
    // Check on mount in case we came from a prevented navigation
    setTimeout(checkPendingNavigation, 100);
    
    // Also watch for changes to the pending navigation
    const interval = setInterval(() => {
      if (window.__pendingNavigation) {
        checkPendingNavigation();
      }
    }, 100);

    onUnmounted(() => {
      clearInterval(interval);
    });
  });

  return {
    handleRouteNavigation
  };
}
