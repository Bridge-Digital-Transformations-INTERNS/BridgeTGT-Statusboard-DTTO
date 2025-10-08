<template>
  <div
    ref="target"
    tabindex="0"
    @keyup.ctrl.enter="toggleFullscreen"
    :class="[
      'relative bg-white w-full h-full overflow-hidden flex flex-col',
      isFullscreen 
        ? 'fullscreen-mode bg-gradient-to-br from-slate-50 to-slate-100' 
        : 'rounded-xl shadow-md border border-slate-100 p-6 md:p-8',
    ]"
  >
    <Transition name="fade-scale" mode="out-in">
      <div 
        :key="isFullscreen ? 'fullscreen' : 'normal'" 
        class="flex flex-col flex-1 min-h-0"
        :class="isFullscreen ? 'p-6 md:p-8' : ''"
      >
        <ProgressHeader :isFullscreen="isFullscreen" :project="project" />

        <div class="mt-4 flex flex-col flex-1 min-h-0">
          <ProgressBar :isFullscreen="isFullscreen" :titleLabel="titleLabel" />
          
          <Transition name="slide-up">
            <div v-if="isFullscreen" class="flex-1 flex flex-col min-h-0">
              <TaskCards
                v-if="!taskStore.loading"
                :filteredTasks="filteredTasks"
                v-model:filterStatus="filterStatus"
                :statusOptions="statusOptions"
                class="flex-1"
              />
              <div v-else class="flex-1 flex items-center justify-center">
                <div class="text-center">
                  <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-emerald-500 mb-4"></div>
                  <p class="text-slate-600 font-medium">Loading tasks...</p>
                </div>
              </div>
            </div>
          </Transition>
        </div>
        
        <!-- Fullscreen Toggle Button -->
        <button
          @keyup.enter="toggleFullscreen"
          @click="toggleFullscreen"
          :class="[
            'absolute z-10 px-3 py-3 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 cursor-pointer',
            isFullscreen 
              ? 'bottom-8 right-8 bg-slate-500 hover:bg-slate-600' 
              : 'bottom-4 right-4 bg-slate-500 hover:bg-slate-600'
          ]"
          :title="isFullscreen ? 'Exit Fullscreen (Ctrl+Enter)' : 'Enter Fullscreen (Ctrl+Enter)'"
        >
          <Icon
            :icon="
              isFullscreen
                ? 'material-symbols:fullscreen-exit-rounded'
                : 'material-symbols:fullscreen-rounded'
            "
            :width="isFullscreen ? 28 : 24"
            :height="isFullscreen ? 28 : 24"
          />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useProjectStore } from "@/stores/projectStore";
import { useTaskStore } from "@/stores/taskStore";
import { Icon } from "@iconify/vue";
import ProgressHeader from "@/components/progress/ProgressHeader.vue";
import ProgressBar from "@/components/progress/ProgressBar.vue";
import TaskCards from "@/components/progress/TaskCards.vue";
import { STATUS_OPTIONS } from "@/constants/common";

const target = ref(null);
const isFullscreen = ref(false);
const searchQuery = ref("");
const filterStatus = ref("");
const projectStore = useProjectStore();
const taskStore = useTaskStore();

const statusOptions = [
  { value: "", label: "All Status" },
  ...STATUS_OPTIONS
];

const project = computed(() => projectStore.selectedProject || { name: "No Project", tasks: [] });

const titleLabel = computed(() =>
  taskStore.selectedPhase && taskStore.selectedPhase !== "Overall"
    ? `${taskStore.selectedPhase} Progress`
    : "Overall Progress",
);

const filteredTasks = computed(() => {
  // Use filteredTasks from store (all filtered tasks, not paginated)
  let tasks = taskStore.filteredTasks || [];
  if (searchQuery.value) {
    tasks = tasks.filter(
      (task) =>
        task.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.value.toLowerCase()),
    );
  }
  if (filterStatus.value) tasks = tasks.filter((task) => task.status === filterStatus.value);
  return tasks;
});

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    target.value.requestFullscreen().then(() => (isFullscreen.value = true));
  } else {
    document.exitFullscreen().then(() => (isFullscreen.value = false));
  }
}
function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

watch(
  () => projectStore.selectedProjectId,
  (newId) => {
    if (newId) taskStore.fetchTasks();
  },
  { immediate: true },
);

onMounted(() => document.addEventListener("fullscreenchange", handleFullscreenChange));
onUnmounted(() => document.removeEventListener("fullscreenchange", handleFullscreenChange));
</script>

<style scoped>
.fullscreen-mode {
  display: flex;
  flex-direction: column;
}

/* Fade scale transition */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* Slide up transition */
.slide-up-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
