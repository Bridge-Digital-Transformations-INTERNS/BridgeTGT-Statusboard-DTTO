import { ref, onMounted, onBeforeUnmount } from 'vue';

/**
 * Global context menu manager
 * Ensures only one context menu is open at a time
 */
const activeContextMenus = new Set();

function closeAllContextMenus() {
  activeContextMenus.forEach(closeCallback => closeCallback());
}

/**
 * Context Menu Composable
 * Handles context menu visibility and positioning
 */
export function useContextMenu() {
  const contextMenuVisible = ref(false);
  const contextMenuPosition = ref({ x: 0, y: 0 });

  function showContextMenu(event) {
    event.preventDefault();
    
    // Close all other context menus first
    closeAllContextMenus();
    
    // Then show this one
    contextMenuVisible.value = true;
    contextMenuPosition.value = { x: event.clientX, y: event.clientY };
  }

  function hideContextMenu() {
    contextMenuVisible.value = false;
  }

  function setupClickOutside() {
    onMounted(() => {
      // Register this context menu
      activeContextMenus.add(hideContextMenu);
      
      document.addEventListener('click', hideContextMenu);
    });

    onBeforeUnmount(() => {
      // Unregister this context menu
      activeContextMenus.delete(hideContextMenu);
      
      document.removeEventListener('click', hideContextMenu);
    });
  }

  return {
    contextMenuVisible,
    contextMenuPosition,
    showContextMenu,
    hideContextMenu,
    setupClickOutside
  };
}
