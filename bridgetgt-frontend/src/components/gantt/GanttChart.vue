<template>
  <div class="flex flex-col h-screen bg-white overflow-hidden">
    <div class="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-3 top-0 z-50 flex items-center gap-2 sm:gap-4 flex-shrink-0 relative flex-wrap">
      <!-- Left: Project Selector -->
      <div class="flex-shrink-0">
        <GanttHeader
          :projects="projectStore.projects"
          :selectedProject="selectedProject"
          :selectedProjectId="selectedProjectId"
          @back="goBackToDashboard"
          @select-project="selectProject"
        />
      </div>
      
      <div class="flex-shrink-0">
        <GanttSaveControls
          :hasPendingChanges="ganttStore.hasPendingChanges"
          :isSaving="ganttStore.isSaving"
          :loading="loading"
          :pendingChangesCount="ganttStore.pendingChanges.size"
          @save="handleSave"
          @discard="handleDiscard"
        />
      </div>
      
      <div class="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          @click="handleAddTask"
          class="flex items-center cursor-pointer gap-1.5 px-4 py-2 bg-gradient-to-r from-[#349083] to-[#e3ea4e] text-white rounded-lg hover:shadow-md transition-all text-sm font-medium"
        >
          <Icon icon="lucide:plus" width="20" height="20" class="text-white" />
          <span class="text-sm font-medium">Add Task</span>
        </button>
        
        <div class="h-6 w-px bg-gray-300 hidden sm:block"></div>
        
        <UserMenu
          :user="currentUser"
          :show="showUserMenu"
          @toggle="showUserMenu = !showUserMenu"
          @logout="handleLogout"
          @activityLog="handleActivityLog"
          @close="showUserMenu = false"
        />
      </div>
    </div>
    
    <!-- Sub Header with Zoom and Expand/Collapse Controls -->
    <GanttSubHeader
      :currentZoomLevel="ganttStore.zoomLevel"
      :onlineUsers="onlineUsers"
      @zoom-in="handleZoomIn"
      @zoom-out="handleZoomOut"
      @zoom-level-change="handleZoomLevelChange"
      @expand-all="ganttStore.expandAllPhases"
      @collapse-all="ganttStore.collapseAllPhases"
    />
    
    <div class="flex flex-1 overflow-hidden" ref="ganttBodyRef">
      <GanttLeftPanel 
        :width="ganttStore.leftPanelWidth"
        :hoveredRowId="hoveredRowId"
        @resize="ganttStore.setLeftPanelWidth"
        @edit-task="handleEditTask"
        @delete-task="handleDeleteTask"
        @update-status="handleUpdateStatus"
        @update-title="handleUpdateTitle"
        @update-color="handleUpdateColor"
        @hover-row="handleRowHover"
        @scroll="(scrollTop) => handleLeftScroll(scrollTop, leftPanelRef)"
        @scroll-to-task="handleScrollToTask"
        ref="leftPanelRef"
      />   
      <GanttRightPanel 
        :hoveredRowId="hoveredRowId"
        @edit-task="handleEditTask"
        @delete-task="handleDeleteTask"
        @update-color="handleUpdateColor"
        @hover-row="handleRowHover"
        @scroll="(scrollTop) => handleRightScroll(scrollTop, leftPanelRef)"
        ref="rightPanelRef"
      />
    </div>
    
    <TaskModal
      :open="taskModal.isOpen"
      :isEdit="taskModal.isEdit"
      :initial="taskModal.data"
      @close="taskModal.close"
      @save="(data, callback) => handleSaveTask(data, selectedProjectId, callback)"
    />
    
    <ConfirmModal
      :open="deleteDialog.isOpen"
      title="Delete Task"
      message="Are you sure you want to delete this task? This action cannot be undone."
      confirmText="Delete"
      confirmClass="bg-red-600 hover:bg-red-700"
      @confirm="handleConfirmDelete"
      @cancel="deleteDialog.close"
    />
    
    <ConfirmModal
      :open="discardDialog.isOpen"
      title="Discard Changes"
      message="Are you sure you want to discard all unsaved changes? This action cannot be undone."
      confirmText="Discard"
      confirmClass="bg-amber-600 hover:bg-amber-700"
      @confirm="handleConfirmDiscard"
      @cancel="discardDialog.close"
    />
    
    <ConfirmModal
      :open="navigationDialog.isOpen"
      title="Unsaved Changes"
      message="You have unsaved changes. If you leave this page, your changes will be lost. Do you want to continue?"
      confirmText="Leave Without Saving"
      confirmClass="bg-red-600 hover:bg-red-700"
      cancelText="Stay on Page"
      @confirm="handleConfirmNavigation"
      @cancel="handleCancelNavigation"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import GanttLeftPanel from './GanttLeftPanel.vue';
import GanttRightPanel from './GanttRightPanel.vue';
import GanttHeader from './components/GanttHeader.vue';
import GanttSaveControls from './components/GanttSaveControls.vue';
import GanttSubHeader from './components/GanttSubHeader.vue';
import UserMenu from '@/components/header/UserMenu.vue';
import TaskModal from '@/components/modals/TaskModal.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import { useGanttStore } from '@/stores/ganttStore';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useGitHubAuthStore } from '@/stores/githubAuthStore';
import { useAccessStore } from '@/stores/accessStore';
import { useGanttProject } from '@/composables/useGanttProject';
import { useGanttModals } from '@/composables/useGanttModals';
import { useGanttZoom } from '@/composables/useGanttZoom';
import { useGanttScroll } from '@/composables/useGanttScroll';
import { useGanttActions } from '@/composables/useGanttActions';
import { useGanttNavigation } from '@/composables/useGanttNavigation';
import { useRouteGuard } from '@/composables/useRouteGuard';

const router = useRouter();
const route = useRoute();
const ganttStore = useGanttStore();
const taskStore = useTaskStore();
const projectStore = useProjectStore();
const sessionStore = useSessionStore();
const githubAuthStore = useGitHubAuthStore();
const accessStore = useAccessStore();

const leftPanelRef = ref(null);
const rightPanelRef = ref(null);
const ganttBodyRef = ref(null);
const showUserMenu = ref(false);
const onlineUsers = computed(() => sessionStore.onlineUsers);
let onlineInterval = null;

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

// Composables
const {
  selectedProjectId,
  loading: projectLoading,
  selectedProject,
  initializeProject,
  selectProject,
  closeDropdownOnClickOutside
} = useGanttProject(projectStore, ganttStore, route);

const {
  taskModal,
  deleteDialog,
  discardDialog,
  navigationDialog
} = useGanttModals();

const { handleZoomIn, handleZoomOut, handleZoomLevelChange } = useGanttZoom(ganttStore, rightPanelRef);

const {
  hoveredRowId,
  handleLeftScroll,
  handleRightScroll,
  handleRowHover,
  scrollToToday,
  handleScrollToTask
} = useGanttScroll(ganttStore, rightPanelRef);

const {
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
} = useGanttActions(ganttStore, taskStore, projectStore, {
  taskModal,
  deleteDialog,
  discardDialog
});

const {
  goBackToDashboard,
  handleConfirmNavigation,
  handleCancelNavigation
} = useGanttNavigation(router, ganttStore, navigationDialog);

// Route guard for navigation with unsaved changes
const { handleRouteNavigation } = useRouteGuard(ganttStore, navigationDialog);

function handleLogout() {
  showUserMenu.value = false;
  sessionStore.logout();
}

function handleActivityLog() {
  console.log('GanttChart: handleActivityLog called');
  showUserMenu.value = false;
  const currentRouteName = route.name;
  console.log('GanttChart: Navigating from Gantt to Activity Log. Current route:', currentRouteName);
  localStorage.setItem('previousRoute', currentRouteName);
  // Check for unsaved changes before navigating
  if (!handleRouteNavigation('/activity-log')) {
    return; 
  }
}

// Keyboard shortcuts handler
function handleKeyboardShortcuts(event) {
  // Ctrl+S or Cmd+S to save
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    if (ganttStore.hasPendingChanges) {
      handleSave();
    }
  }
  // ESC to close modals
  if (event.key === 'Escape') {
    if (taskModal.isOpen) {
      taskModal.close();
    } else if (deleteDialog.isOpen) {
      deleteDialog.close();
    } else if (discardDialog.isOpen) {
      discardDialog.close();
    } else if (navigationDialog.isOpen) {
      handleCancelNavigation();
    }
  }
}

onMounted(async () => {
  await initializeProject();
  setTimeout(() => scrollToToday(), 500);
  // Fetch online users
  sessionStore.fetchOnlineUsers();
  onlineInterval = setInterval(() => {
    sessionStore.fetchOnlineUsers();
  }, 10000);
  
  document.addEventListener('click', closeDropdownOnClickOutside);
  // Add keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
});

onBeforeUnmount(() => {
  if (onlineInterval) {
    clearInterval(onlineInterval);
  }
  // Clear auto-save timer
  ganttStore.clearAutoSaveTimer();
  document.removeEventListener('click', closeDropdownOnClickOutside);
  // Remove keyboard shortcuts
  document.removeEventListener('keydown', handleKeyboardShortcuts);
});
</script>

