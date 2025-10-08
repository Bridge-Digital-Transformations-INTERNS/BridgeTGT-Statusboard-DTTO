<template>
  <div class="h-screen flex flex-col bg-gray-50 overflow-hidden">
    <GanttChart />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import GanttChart from '@/components/gantt/GanttChart.vue';
import { useGanttStore } from '@/stores/ganttStore';
import { useProjectStore } from '@/stores/projectStore';
import { useDeveloperStore } from '@/stores/developerStore';
import { useToastNotification } from "@/composables/useToastNotification";
const { showSuccess,showError } = useToastNotification();

const ganttStore = useGanttStore();
const projectStore = useProjectStore();
const developerStore = useDeveloperStore();


// Load initial data
onMounted(async () => {
  try {
    // Fetch projects and developers in parallel
    await Promise.all([
      projectStore.fetchProjects(),
      developerStore.fetchDevelopers()
    ]);
    
    // Load tasks for selected project or all tasks
    if (projectStore.selectedProjectId) {
      await ganttStore.fetchTasksByProject(projectStore.selectedProjectId);
    }
  } catch (error) {
    console.error('Error loading Gantt data:', error);
   showError('Data Load Error', 'Failed to load initial data for Gantt chart. Please try again later.');
  }
});

// Prevent navigation when there are unsaved changes
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
  window.removeEventListener('keydown', handleKeyDown);
});

// Warn user about unsaved changes when closing/refreshing browser
function handleBeforeUnload(e) {
  if (ganttStore.hasPendingChanges) {
    e.preventDefault();
    e.returnValue = ''; 
  }
}

// Keyboard shortcuts
function handleKeyDown(e) {
  // Ctrl+S or Cmd+S to save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    if (ganttStore.hasPendingChanges) {
      ganttStore.saveAllChanges()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  ganttStore.removeSocketListeners();
});
</script>

