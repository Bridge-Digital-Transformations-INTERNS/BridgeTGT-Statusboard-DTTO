import { TASK_STATUSES } from "@/constants/common";
import { formatDateForAPI } from "@/utils/ganttDates";

export function useTaskOperations(taskStore) {
  const updateTaskStatus = (task, newStatus) => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const updatePayload = {
      status: newStatus,
      startDate: formatDateForAPI(task.startDate) || today,
      targetDate: formatDateForAPI(task.targetDate) || today,
    };

    const isBeingCompleted = newStatus === TASK_STATUSES.COMPLETED || newStatus === TASK_STATUSES.VALIDATED;
    if (isBeingCompleted && !task.endDate) {
      updatePayload.endDate = today;
    } else if (task.endDate) {
      updatePayload.endDate = formatDateForAPI(task.endDate);
    }

    taskStore.updateTask(task.id, updatePayload);
  };

  const addTask = (taskData) => {
    taskStore.addTask(taskData);
  };

  const updateTask = (taskId, taskData) => {
    taskStore.updateTask(taskId, taskData);
  };

  const deleteTask = (taskId) => {
    taskStore.deleteTask(taskId);
  };

  return {
    updateTaskStatus,
    addTask,
    updateTask,
    deleteTask,
  };
}
