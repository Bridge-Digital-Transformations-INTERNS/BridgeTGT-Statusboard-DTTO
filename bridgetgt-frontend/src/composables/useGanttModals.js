import { reactive } from 'vue';

export function useGanttModals() {
  // Task modal state
  const taskModal = reactive({
    isOpen: false,
    isEdit: false,
    data: null,
    open: (isEdit, data = null) => {
      taskModal.isEdit = isEdit;
      taskModal.data = data;
      taskModal.isOpen = true;
    },
    close: () => {
      taskModal.isOpen = false;
      taskModal.data = null;
    }
  });

  // Delete dialog state
  const deleteDialog = reactive({
    isOpen: false,
    taskId: null,
    open: (taskId) => {
      deleteDialog.taskId = taskId;
      deleteDialog.isOpen = true;
    },
    close: () => {
      deleteDialog.isOpen = false;
      deleteDialog.taskId = null;
    }
  });

  // Discard dialog state
  const discardDialog = reactive({
    isOpen: false,
    open: () => {
      discardDialog.isOpen = true;
    },
    close: () => {
      discardDialog.isOpen = false;
    }
  });

  // Navigation confirmation state
  const navigationDialog = reactive({
    isOpen: false,
    targetRoute: null,
    open: (route) => {
      navigationDialog.targetRoute = route;
      navigationDialog.isOpen = true;
    },
    close: () => {
      navigationDialog.isOpen = false;
      navigationDialog.targetRoute = null;
    }
  });

  return {
    taskModal,
    deleteDialog,
    discardDialog,
    navigationDialog
  };
}
