import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/utils/api';
import socket from '@/utils/socket';
import { generateRandomTaskColor } from '@/utils/ganttColors';
import { formatDateForAPI } from '@/utils/ganttDates';

export const useGanttStore = defineStore('gantt', () => {
  const tasks = ref([]);
  const selectedProjectId = ref(null);
  const loading = ref(false);
  const dayWidth = ref(50); 
  const zoomLevel = ref('day'); 
  const leftPanelWidth = ref(600); 
  const pendingChanges = ref(new Map()); 
  const expandedPhases = ref(new Set());
  const hasPendingChanges = computed(() => pendingChanges.value.size > 0);
  const lastChangeTime = ref(null);
  const autoSaveTimer = ref(null);
  const isSaving = ref(false);
  let onAutoSaveCallback = null;
  
  const tasksByPhase = computed(() => {
    const grouped = {};
    tasks.value.forEach(task => {
      const phase = task.phase || 'Unassigned';
      if (!grouped[phase]) {
        grouped[phase] = [];
      }
      grouped[phase].push(task);
    });
    return grouped;
  });
  
  //FETCH 
  async function fetchTasksByProject(projectId) {
    loading.value = true;
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const response = await api.get(`/tasks/project/${projectId}/with-assignees`, {
        headers: { 'x-session-token': sessionToken }
      });
      
      console.log('[Gantt] Fetched tasks:', response.data);
      
      tasks.value = response.data.map(task => ({
        ...task,
        color: task.color || generateRandomTaskColor(),
        assignees: Array.isArray(task.assignees) ? task.assignees : []
      }));
      
      selectedProjectId.value = projectId;
      pendingChanges.value.clear();
      
      // Initialize expanded phases with all phases
      const phases = [...new Set(tasks.value.map(t => t.phase || 'Unassigned'))];
      phases.forEach(phase => expandedPhases.value.add(phase));
    } catch (error) {
      console.error('Error fetching Gantt tasks:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }
  
  async function fetchAllTasks() {
    loading.value = true;
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const response = await api.get('/tasks/with-assignees', {
        headers: { 'x-session-token': sessionToken }
      });
      
      console.log('[Gantt] Fetched all tasks:', response.data);
      
      tasks.value = response.data.map(task => ({
        ...task,
        color: task.color || generateRandomTaskColor(),
        // Ensure assignees is always an array
        assignees: Array.isArray(task.assignees) ? task.assignees : []
      }));
      
      pendingChanges.value.clear();
      
      // Initialize expanded phases with all phases
      const phases = [...new Set(tasks.value.map(t => t.phase || 'Unassigned'))];
      phases.forEach(phase => expandedPhases.value.add(phase));
    } catch (error) {
      console.error('Error fetching all Gantt tasks:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }
  
  //UPDATE
  function updateTaskLocally(taskId, updates) {
    const taskIndex = tasks.value.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      // Ensure status is a string, not an object
      const cleanUpdates = { ...updates };
      if (cleanUpdates.status && typeof cleanUpdates.status === 'object') {
        cleanUpdates.status = cleanUpdates.status.status || 'pending';
      }
      
      tasks.value[taskIndex] = { ...tasks.value[taskIndex], ...cleanUpdates };
      
      // Track pending change
      const existing = pendingChanges.value.get(taskId) || { id: taskId };
      pendingChanges.value.set(taskId, { ...existing, ...cleanUpdates });
      
      // Update last change time
      lastChangeTime.value = Date.now();
      
      // Auto-save if 5 or more changes
      if (pendingChanges.value.size >= 5) {
        saveAllChanges(true); // true = auto-save
      } else {
        // Reset the 5-minute timer
        resetAutoSaveTimer();
      }
    }
  }
  
  // Reset auto-save timer (5 minutes)
  function resetAutoSaveTimer() {
    if (autoSaveTimer.value) {
      clearTimeout(autoSaveTimer.value);
    }
    
    autoSaveTimer.value = setTimeout(() => {
      if (hasPendingChanges.value) {
        saveAllChanges(true); 
      }
    }, 5 * 60 * 1000); 
  }
  
  // Clear auto-save timer
  function clearAutoSaveTimer() {
    if (autoSaveTimer.value) {
      clearTimeout(autoSaveTimer.value);
      autoSaveTimer.value = null;
    }
  }
  
  //BULK SAVE OLALA
  async function saveAllChanges(isAutoSave = false) {
    if (!hasPendingChanges.value || isSaving.value) return;
    
    isSaving.value = true;
    clearAutoSaveTimer();
    
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const updates = Array.from(pendingChanges.value.values()).map(change => ({
        id: change.id,
        ...(change.startDate && { startDate: formatDateForAPI(change.startDate) }),
        ...(change.targetDate && { targetDate: formatDateForAPI(change.targetDate) }),
        ...(change.endDate && { endDate: formatDateForAPI(change.endDate) }),
        ...(change.title && { title: change.title }),
        ...(change.phase && { phase: change.phase }),
        ...(change.status && { status: change.status }),
        ...(change.weight && { weight: change.weight }),
        ...(change.color && { color: change.color }),
      }));
      
      await api.put('/tasks/bulk', { updates }, {
        headers: { 'x-session-token': sessionToken }
      });
      
      pendingChanges.value.clear();
      lastChangeTime.value = null;
      
      // Notify callback if auto-save
      if (isAutoSave && onAutoSaveCallback) {
        onAutoSaveCallback();
      }
      
      return true;
    } catch (error) {
      console.error('Error saving Gantt changes:', error);
      throw error;
    } finally {
      isSaving.value = false;
    }
  }
  
  // Set callback for auto-save notifications
  function setAutoSaveCallback(callback) {
    onAutoSaveCallback = callback;
  }
  
  //DISCARD
  function discardChanges() {
    clearAutoSaveTimer();
    // Reload tasks to reset local changes
    if (selectedProjectId.value) {
      fetchTasksByProject(selectedProjectId.value);
    } else {
      fetchAllTasks();
    }
    pendingChanges.value.clear();
    lastChangeTime.value = null;
  }
  
  //ADD
  async function addTask(taskData) {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const newTask = {
        ...taskData,
        color: generateRandomTaskColor(),
        startDate: formatDateForAPI(taskData.startDate),
        targetDate: formatDateForAPI(taskData.targetDate),
        endDate: taskData.endDate ? formatDateForAPI(taskData.endDate) : null,
      };
      
      const response = await api.post('/tasks', newTask, {
        headers: { 'x-session-token': sessionToken }
      });
      
      tasks.value.push({ ...response.data, color: newTask.color });
      return response.data;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }
  
  //DELETE
  async function deleteTask(taskId) {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      await api.delete(`/tasks/${taskId}`, {
        headers: { 'x-session-token': sessionToken }
      });
      
      tasks.value = tasks.value.filter(t => t.id !== taskId);
      pendingChanges.value.delete(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
  
  // Zoom controls
  function zoomIn() {
    dayWidth.value = Math.min(dayWidth.value + 5, 80);
  }
  
  function zoomOut() {
    dayWidth.value = Math.max(dayWidth.value - 5, 10);
  }
  
  function resetZoom() {
    dayWidth.value = 50; 
    zoomLevel.value = 'day';
  }
  
  function setZoomLevel(level) {
    zoomLevel.value = level;
    
    // Responsive day widths based on screen size
    const screenWidth = window.innerWidth;
    let multiplier = 1;
    
    if (screenWidth < 640) {
      multiplier = 0.6; 
    } else if (screenWidth < 1024) {
      multiplier = 0.8; 
    }
    
    switch (level) {
      case 'day':
        dayWidth.value = Math.round(50 * multiplier); 
        break;
      case 'week':
        dayWidth.value = Math.round(25 * multiplier); 
        break;
      case 'month':
        dayWidth.value = Math.max(6, Math.round(10 * multiplier)); 
        break;
    }
  }
  
  // Panel resize
  function setLeftPanelWidth(width) {
    leftPanelWidth.value = Math.max(220, Math.min(width, 600));
  }
  
  // Phase expansion
  function togglePhase(phaseName) {
    if (expandedPhases.value.has(phaseName)) {
      expandedPhases.value.delete(phaseName);
    } else {
      expandedPhases.value.add(phaseName);
    }
  }
  
  function expandAllPhases() {
    Object.keys(tasksByPhase.value).forEach(phase => {
      expandedPhases.value.add(phase);
    });
  }
  
  function collapseAllPhases() {
    expandedPhases.value.clear();
  }
  
  // Socket listeners
  function initSocketListeners() {
    socket.off('task:created');
    socket.off('task:updated');
    socket.off('task:deleted');
    socket.off('taskAssignee:added');
    socket.off('taskAssignee:removed');
    
    socket.on('task:created', (task) => {
      console.log('[Gantt] Socket: task:created', task);
      if (selectedProjectId.value && task.project_id === selectedProjectId.value) {
        if (!tasks.value.some(t => t.id === task.id)) {
          tasks.value.push({ 
            ...task, 
            color: task.color || generateRandomTaskColor(),
            assignees: Array.isArray(task.assignees) ? task.assignees : []
          });
        }
      }
    });
    
    socket.on('task:updated', (updated) => {
      console.log('[Gantt] Socket: task:updated', updated);
      const index = tasks.value.findIndex(t => t.id === updated.id);
      if (index !== -1) {
        if (!pendingChanges.value.has(updated.id)) {
          tasks.value[index] = { ...tasks.value[index], ...updated };
          tasks.value = [...tasks.value];
        }
      }
    });
    
    socket.on('task:deleted', ({ id }) => {
      console.log('[Gantt] Socket: task:deleted', id);
      tasks.value = tasks.value.filter(t => t.id !== id);
      pendingChanges.value.delete(id);
    });
    
    socket.on('taskAssignee:added', ({ task_id, developer_id }) => {
      console.log('[Gantt] Socket: taskAssignee:added', { task_id, developer_id });
      const index = tasks.value.findIndex(t => t.id === task_id);
      if (index !== -1) {
        const task = tasks.value[index];
        if (!task.assignees) task.assignees = [];
        if (!task.assignees.includes(developer_id)) {
          task.assignees = [...task.assignees, developer_id];
        }
        tasks.value[index] = { ...task };
        tasks.value = [...tasks.value];
      }
    });
    
    socket.on('taskAssignee:removed', ({ task_id, developer_id }) => {
      console.log('[Gantt] Socket: taskAssignee:removed', { task_id, developer_id });
      const index = tasks.value.findIndex(t => t.id === task_id);
      if (index !== -1) {
        const task = tasks.value[index];
        if (Array.isArray(task.assignees)) {
          task.assignees = task.assignees.filter(id => id !== developer_id);
        }
        tasks.value[index] = { ...task };
        tasks.value = [...tasks.value];
      }
    });
  }
  
  function removeSocketListeners() {
    socket.off('task:created');
    socket.off('task:updated');
    socket.off('task:deleted');
    socket.off('taskAssignee:added');
    socket.off('taskAssignee:removed');
  }
  
  // INIT SOCKET
  initSocketListeners();
  
  return {
    tasks,
    selectedProjectId,
    loading,
    dayWidth,
    zoomLevel,
    leftPanelWidth,
    pendingChanges,
    expandedPhases,
    hasPendingChanges,
    isSaving,
    lastChangeTime,
    tasksByPhase,
    fetchTasksByProject,
    fetchAllTasks,
    updateTaskLocally,
    saveAllChanges,
    discardChanges,
    addTask,
    deleteTask,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoomLevel,
    setLeftPanelWidth,
    togglePhase,
    expandAllPhases,
    clearAutoSaveTimer,
    setAutoSaveCallback,
    collapseAllPhases,
    removeSocketListeners,
  };
});
