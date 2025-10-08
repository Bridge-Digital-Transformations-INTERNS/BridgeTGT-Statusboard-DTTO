<template>
  <header class="flex items-center justify-between px-14 py-4 shadow-xs">
    <LogoSection />
    <div class="flex items-center gap-3 relative whitespace-nowrap">
      <OnlineUsers :onlineUsers="sortedOnlineUsers" />
      
      <!-- Gantt Chart Button -->
      <button
        @click="navigateToGantt"
        class="group cursor-pointer relative overflow-hidden bg-white hover:text-[var(--color-palm)] hover:bg-blue-50 border border-gray-200 hover:border-[var(--color-palm)] rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300 ease-out"
        :class="{ 'bg-blue-50 border-[var(--color-palm)]': $route.name === 'GanttView' }"
      >
        <Icon  icon="mingcute:align-left-fill" width="20" height="20" />
        <span class="text-sm font-medium text-gray-700 group-hover:text-[var(--color-palm)]">
          Gantt Chart
        </span>
      </button>
    
      <AddTaskButton @open="openTaskModal(false)" />
      <ActionsDropdown
        ref="actionsDropdownRef"
        :projects="orderedProjects"
        :selectedProject="projectStore.selectedProject"
        @selectProject="selectProject"
        @openProject="openProjectModal"
        @deleteProject="askDelete"
        @navigateDeveloper="navigateToDeveloper"
      />
      <UserMenu
        :user="currentUser"
        :show="showUserMenu"
        @toggle="showUserMenu = !showUserMenu"
        @logout="logout"
        @activityLog="navigateToActivityLog"
        ref="userMenuRef"
      />
    </div>
    <ProjectModal
      :open="projectModal.isOpen.value"
      :isEdit="projectModal.isEdit.value"
      :initial="projectModal.data.value"
      @close="projectModal.close"
      @save="saveProject"
    />
    <TaskModal
      :open="taskModal.isOpen.value"
      :isEdit="taskModal.isEdit.value"
      :initial="taskModal.data.value"
      @close="taskModal.close"
      @save="saveTask"
    />

    <ConfirmModal
      :open="deleteConfirm.isOpen.value"
      title="Delete Project"
      message="Are you sure you want to delete this project?"
      @cancel="deleteConfirm.close"
      @confirm="confirmDeleteProject"
    />
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useProjectStore } from "@/stores/projectStore";
import { useTaskStore } from "@/stores/taskStore";
import { useAccessStore } from "@/stores/accessStore";
import { useGitHubAuthStore } from "@/stores/githubAuthStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useDeveloperStore } from "@/stores/developerStore";
import { useClickOutside } from "@/composables/useClickOutside";
import { useModalManager } from "@/composables/useModalManager";
import { Icon } from "@iconify/vue";
import { ROUTES } from "@/constants/common";
import LogoSection from "./LogoSection.vue";
import OnlineUsers from "./OnlineUsers.vue";
import AddTaskButton from "./AddTaskButton.vue";
import ActionsDropdown from "./ActionsDropdown.vue";
import UserMenu from "./UserMenu.vue";
import ProjectModal from "@/components/modals/ProjectModal.vue";
import TaskModal from "@/components/modals/TaskModal.vue";
import ConfirmModal from "@/components/modals/ConfirmModal.vue";
import { useToastNotification } from "@/composables/useToastNotification";
const { showSuccess,showError } = useToastNotification();


const router = useRouter();
const projectStore = useProjectStore();
const developerStore = useDeveloperStore();
const accessStore = useAccessStore();
const githubAuthStore = useGitHubAuthStore();
const taskStore = useTaskStore();
const sessionStore = useSessionStore();
const showUserMenu = ref(false);
const userMenuRef = ref(null);
const actionsDropdownRef = ref(null);
let onlineInterval = null;
const onlineUsers = computed(() => sessionStore.onlineUsers);
const fetchOnlineUsers = sessionStore.fetchOnlineUsers;
const logout = sessionStore.logout;

onMounted(() => {
  fetchOnlineUsers();
  onlineInterval = setInterval(fetchOnlineUsers, 10000);
  projectStore.fetchProjects();
  projectStore.restoreSelectedProject();
  developerStore.fetchDevelopers();
});
onUnmounted(() => {
  if (onlineInterval) clearInterval(onlineInterval);
});

useClickOutside(userMenuRef, () => {
  if (showUserMenu.value) {
    showUserMenu.value = false;
  }
});
useClickOutside(actionsDropdownRef, () => {
  actionsDropdownRef.value?.close();
});

const currentUser = computed(() => {
  if (githubAuthStore.isAuthenticated && githubAuthStore.userProfile) {
    return {
      name: githubAuthStore.userProfile.name,
      username: githubAuthStore.userProfile.github_login,
      avatar: githubAuthStore.userProfile.avatar_url,
      isGitHubUser: true,
    };
  }
  if (accessStore.isAuthenticated) {
    return { name: "Admin", username: null, avatar: null, isGitHubUser: false };
  }
  return { name: "User", username: null, avatar: null, isGitHubUser: false };
});

const sortedOnlineUsers = computed(() => {
  if (!onlineUsers.value?.length) return onlineUsers.value;

  const usersCopy = [...onlineUsers.value];
  
  // Try to find current user in online users list
  let currentUserIndex = -1;
  
  if (githubAuthStore.isAuthenticated && githubAuthStore.userProfile) {
    // Match by github_login
    currentUserIndex = usersCopy.findIndex(
      (u) => u.username === githubAuthStore.userProfile.github_login
    );
  }
  
  // If found, move to front
  if (currentUserIndex !== -1) {
    const [found] = usersCopy.splice(currentUserIndex, 1);
    return [found, ...usersCopy];
  }
  
  // If not found in online users, return as is
  return usersCopy;
});

const { projectModal, taskModal, deleteConfirm } = useModalManager([
  "project",
  "task",
  "delete",
]);

function openProjectModal(isEdit, project = null) {
  if (isEdit) {
    projectModal.openEdit(project);
  } else {
    projectModal.openCreate();
  }
}

async function saveProject(data) {
  try {
    if (projectModal.isEdit.value && projectModal.data.value) {
      await projectStore.updateProject(projectModal.data.value.id, data);
      showSuccess("Project Updated", "Project has been updated successfully!");
    } else {
      const newProject = await projectStore.addProject(data.name);
      if (newProject?.id) {
        projectStore.setSelectedProject(newProject.id);
      }
      showSuccess("Project Created", "Project has been created successfully!");
    }
    projectModal.close();
  } catch (error) {
    showError("Operation Failed", "Failed to save project. Please try again.");
    console.error("Error saving project:", error);
  }
}

function openTaskModal(isEdit, task = null) {
  if (isEdit) taskModal.openEdit(task);
  else taskModal.openCreate();
}

async function saveTask(data, onComplete) {
  try {
    if (taskModal.isEdit.value && taskModal.data.value) {
      await taskStore.updateTask(taskModal.data.value.id, data);
    } else {
      await taskStore.addTask(data);
    }
    taskModal.close();
    if (onComplete) onComplete();
  } catch (error) {
    console.error('Error saving task:', error);
    if (onComplete) onComplete();
  }
}

function askDelete(project) {
  deleteConfirm.open(project);
}

async function confirmDeleteProject() {
  if (deleteConfirm.item.value) {
    const deletedId = deleteConfirm.item.value.id;
    try {
      await projectStore.deleteProject(deletedId);
      
      if (projectStore.projects.length > 0) {
        const nextProject = projectStore.projects[0];
        if (nextProject) {
          projectStore.setSelectedProject(nextProject.id);
        }
      }
      
      showSuccess("Project Deleted", "Project has been deleted successfully!");
    } catch (error) {
      showError("Deletion Failed", "Failed to delete project. Please try again.");
      console.error("Error deleting project:", error);
    }
  }
  deleteConfirm.close();
}

function selectProject(project) {
  projectStore.setSelectedProject(project.id);
}

function navigateToDeveloper() {
  router.push(ROUTES.DEVELOPER);
}

function navigateToActivityLog() {
  // Store the current route name before navigating
  const currentRoute = router.currentRoute.value.name;
  console.log('HeaderBar: Navigating to Activity Log from:', currentRoute);
  localStorage.setItem('previousRoute', currentRoute);
  console.log('HeaderBar: Stored previousRoute:', currentRoute);
  router.push(ROUTES.ACTIVITY_LOG);
}

function navigateToGantt() {
  router.push('/gantt');
}

const orderedProjects = computed(() => {
  if (!projectStore.selectedProject) return projectStore.projects;
  return [
    projectStore.selectedProject,
    ...projectStore.projects.filter(
      (p) => p.id !== projectStore.selectedProject.id,
    ),
  ];
});


</script>
