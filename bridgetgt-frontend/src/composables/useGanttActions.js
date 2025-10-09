import { ref } from 'vue';
import { useToastNotification } from "@/composables/useToastNotification";


export function useGanttActions(ganttStore, taskStore, projectStore, modals) {
  const loading = ref(false);
  const { showSuccess, showError } = useToastNotification();
  async function handleSave(isAutoSave = false) {
    loading.value = true;
    try {
      await ganttStore.saveAllChanges();
      showSuccess(
        isAutoSave ? 'Auto-saved' : 'Changes Saved',
        isAutoSave 
          ? 'Your changes have been automatically saved.' 
          : 'All timeline changes have been saved.'
      );
    } catch (error) {
      showError('Save Failed', 'Failed to save changes. Please try again.');
    } finally {
      loading.value = false;
    }
  }

  function handleDiscard() {
    modals.discardDialog.open();
  }

  function handleConfirmDiscard() {
    ganttStore.discardChanges();
    showSuccess('Changes Discarded', 'All unsaved changes have been discarded.');
    modals.discardDialog.close();
  }

  function handleUpdateStatus(taskId, newStatus) {
    ganttStore.updateTaskLocally(taskId, { status: newStatus });
  }

  async function handleUpdateTitle(taskId, newTitle) {
    try {
      const task = ganttStore.tasks.find(t => t.id === taskId);
      if (!task) return;
      
      await taskStore.updateTask(taskId, {
        title: newTitle,
        startDate: task.startDate,
        targetDate: task.targetDate,
        phase: task.phase,
        weight: task.weight,
        status: task.status
      });
      
      ganttStore.updateTaskLocally(taskId, { title: newTitle });
    } catch (error) {
      console.error('Error updating title:', error);
      showError('Update Failed', 'Failed to update task title. Please try again.');
    }
  }

  function handleAddTask() {
    if (ganttStore.hasPendingChanges) {
      showError('Unsaved Changes', 'Please save or discard your changes before adding a new task.');
      return;
    }
    
    modals.taskModal.open(false);
  }

  function handleEditTask(task) {
    modals.taskModal.open(true, task);
  }

  async function handleSaveTask(taskData, selectedProjectIdOrCallback, onComplete) {
    // Support both old signature (taskData, selectedProjectId) and new (taskData, onComplete)
    let selectedProjectId = null;
    let callback = null;
    
    if (typeof selectedProjectIdOrCallback === 'function') {
      callback = selectedProjectIdOrCallback;
    } else {
      selectedProjectId = selectedProjectIdOrCallback;
      callback = onComplete;
    }
    
    loading.value = true;
    try {
      const taskWithProject = {
        ...taskData,
        project_id: selectedProjectId || projectStore.selectedProjectId
      };
      
      if (modals.taskModal.isEdit && modals.taskModal.data) {
        await taskStore.updateTaskWithAssignees(modals.taskModal.data.id, taskWithProject);
        showSuccess('Task Updated', 'Task has been updated successfully.');
      } else {
        await taskStore.addTask(taskWithProject);
        showSuccess('Task Created', 'Task has been created successfully.');
      }
      
      // Don't refetch - Reverb will update the store automatically
      
      if (callback) callback();
    } catch (error) {
      console.error('Save task error:', error);
      showError(
        modals.taskModal.isEdit ? 'Update Failed' : 'Creation Failed',
        error.response?.data?.message || `Failed to ${modals.taskModal.isEdit ? 'update' : 'create'} task.`
      );
      if (callback) callback();
    } finally {
      loading.value = false;
    }
  }

  function handleUpdateColor(taskId, color) {
    ganttStore.updateTaskLocally(taskId, { color });
    showError('Color Updated', 'Task color has been updated.');
  }

  function handleDeleteTask(taskId) {
    modals.deleteDialog.open(taskId);
  }

  async function handleConfirmDelete() {
    try {
      await ganttStore.deleteTask(modals.deleteDialog.taskId);
      showSuccess('Task Deleted', 'The task has been successfully deleted.');
      modals.deleteDialog.close();
    } catch (error) {
     showError('Delete Failed', 'Failed to delete the task. Please try again.');
    }
  }

  return {
    loading,
    handleSave,
    handleDiscard,
    handleConfirmDiscard,
    handleUpdateStatus,
    handleUpdateTitle,
    handleAddTask,
    handleEditTask,
    handleSaveTask,
    handleUpdateColor,
    handleDeleteTask,
    handleConfirmDelete
  };
}



