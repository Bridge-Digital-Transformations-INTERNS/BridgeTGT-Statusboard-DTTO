import { ref, computed } from 'vue';
import { useToastNotification } from "@/composables/useToastNotification";



export function useGanttProject(projectStore, ganttStore, route, toast) {
  const selectedProjectId = ref(null);
  const showProjectDropdown = ref(false);
  const loading = ref(false);
  const { showSuccess,showError } = useToastNotification();
  const projectOptions = computed(() =>
    projectStore.projects.map(p => ({ value: p.id, label: p.name }))
  );

  const selectedProject = computed(() =>
    projectStore.projects.find(p => p.id === selectedProjectId.value)
  );

  async function initializeProject() {
    if (projectStore.projects.length === 0) {
      await projectStore.fetchProjects();
    }

    const savedProjectId = route.query.project ||
      localStorage.getItem('gantt_selectedProjectId') ||
      projectStore.selectedProjectId;

    if (savedProjectId) {
      selectedProjectId.value = parseInt(savedProjectId);
      await handleProjectChange(selectedProjectId.value);
    }
  }

  async function handleProjectChange(projectId) {
    loading.value = true;
    try {
      if (projectId) {
        await ganttStore.fetchTasksByProject(projectId);
        projectStore.setSelectedProject(projectId);
        localStorage.setItem('gantt_selectedProjectId', projectId);
      } else {
        await ganttStore.fetchAllTasks();
        localStorage.removeItem('gantt_selectedProjectId');
      }
    } catch (error) {
      console.error('Error loading project tasks:', error);
      showError('Error', 'Failed to load tasks for the selected project.');
    } finally {
      loading.value = false;
    }
  }

  function selectProject(projectId) {
    if (ganttStore.hasPendingChanges) {
      showError('Unsaved Changes', 'Please save or discard your changes before switching projects.');
      return;
    }
    
    selectedProjectId.value = projectId;
    showProjectDropdown.value = false;
    handleProjectChange(projectId);
  }

  function closeDropdownOnClickOutside(event) {
    const dropdown = event.target.closest('.relative');
    if (!dropdown) {
      showProjectDropdown.value = false;
    }
  }

  return {
    selectedProjectId,
    showProjectDropdown,
    loading,
    projectOptions,
    selectedProject,
    initializeProject,
    handleProjectChange,
    selectProject,
    closeDropdownOnClickOutside
  };
}
