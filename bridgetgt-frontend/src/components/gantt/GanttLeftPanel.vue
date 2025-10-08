<template>
  <div class="relative flex-shrink-0 h-full">
    <!-- Main Panel Container -->
    <div 
      class="border-r border-gray-200 bg-white overflow-hidden flex flex-col h-full transition-all duration-300"
      :style="{ 
        width: isCollapsed ? '0px' : responsiveWidth + 'px',
        minWidth: isCollapsed ? '0px' : minWidth + 'px',
        maxWidth: isCollapsed ? '0px' : maxWidth + 'px'
      }"
    >
      <!-- Task List Header -->
      <GanttTaskListHeader v-if="!isCollapsed" />
      
      <!-- Task List Body -->
      <div 
        v-if="!isCollapsed"
        class="flex-1 overflow-y-scroll scrollbar-hide bg-white" 
        ref="scrollContainer"
        @scroll="handleScroll"
      >
      <div v-if="ganttStore.loading" class="p-4">
        <div v-for="i in 5" :key="i" class="mb-2 h-12 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <div v-else-if="ganttStore.tasks.length === 0" class="flex flex-col items-center justify-center p-8 text-center">
        <Icon icon="mdi:calendar-blank" width="48" height="48" class="text-gray-300 mb-3" />
        <p class="text-sm text-gray-500">No tasks in this project</p>
        <p class="text-xs text-gray-400 mt-1">Add a task to get started</p>
      </div>
      
      <div v-else>
        <!-- Group by Phase -->
        <GanttPhaseGroup
          v-for="(phaseTasks, phaseName) in ganttStore.tasksByPhase" 
          :key="phaseName"
          :phaseName="phaseName"
          :taskCount="phaseTasks.length"
          :isExpanded="ganttStore.expandedPhases.has(phaseName)"
          @toggle="ganttStore.togglePhase(phaseName)"
        >
          <GanttTaskRow
            v-for="task in phaseTasks"
            :key="task.id"
            :task="task"
            :isHovered="hoveredRowId === task.id"
            @edit="$emit('edit-task', task)"
            @delete="$emit('delete-task', task.id)"
            @update-status="$emit('update-status', task.id, $event)"
            @update-title="(taskId, newTitle) => $emit('update-title', taskId, newTitle)"
            @update-color="(taskId, newColor) => $emit('update-color', taskId, newColor)"
            @mouseenter="$emit('hover-row', task.id)"
            @mouseleave="$emit('hover-row', null)"
            @scroll-to-task="$emit('scroll-to-task', $event)"
          />
        </GanttPhaseGroup>
      </div>
      </div>
      
      <!-- Resize Handle (only when not collapsed) -->
      <div
        v-if="!isCollapsed"
        class="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--color-palm)] transition-colors group"
        @mousedown="startResize"
      >
        <div class="absolute top-1/2 right-0 w-1 h-12 bg-gray-300 group-hover:bg-blue-500 rounded-l transition-colors"></div>
      </div>
    </div>
    
    <!-- Collapse/Expand Toggle Button - Outside overflow container -->
    <button
      @click="toggleCollapse"
      class="absolute top-1/2 transform -translate-y-1/2 z-50 bg-white border-2 border-gray-300 rounded-full p-1.5 hover:bg-gray-100 hover:border-[var(--color-palm)] transition-all duration-200 shadow-lg hover:shadow-xl"
      :style="{ left: isCollapsed ? '8px' : `${responsiveWidth - 16}px` }"
      :title="isCollapsed ? 'Expand task panel' : 'Collapse task panel'"
    >
      <Icon 
        :icon="isCollapsed ? 'mdi:chevron-right' : 'mdi:chevron-left'" 
        width="20" 
        height="20" 
        class="text-gray-600"
      />
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { Icon } from '@iconify/vue';
import { useGanttStore } from '@/stores/ganttStore';
import GanttTaskRow from './GanttTaskRow.vue';
import GanttTaskListHeader from './components/GanttTaskListHeader.vue';
import GanttPhaseGroup from './components/GanttPhaseGroup.vue';

const props = defineProps({
  width: {
    type: Number,
    required: true
  },
  hoveredRowId: {
    type: [String, Number, null],
    default: null
  }
});

const emit = defineEmits(['resize', 'edit-task', 'delete-task', 'update-status', 'update-title', 'update-color', 'hover-row', 'scroll', 'scroll-to-task', 'toggle-collapse']);
const ganttStore = useGanttStore();
const scrollContainer = ref(null);
const windowWidth = ref(window.innerWidth);
const isCollapsed = ref(false);

// Toggle collapse state
function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
  emit('toggle-collapse', isCollapsed.value);
}

// Responsive widths based on screen size
const minWidth = computed(() => {
  if (windowWidth.value < 640) return 250; 
  if (windowWidth.value < 768) return 300; 
  if (windowWidth.value < 1024) return 350; 
  return 400; 
});

const maxWidth = computed(() => {
  if (windowWidth.value < 640) return 320; 
  if (windowWidth.value < 768) return 450; 
  if (windowWidth.value < 1024) return 550; 
  return 700; 
});

const responsiveWidth = computed(() => {
  return Math.max(minWidth.value, Math.min(props.width, maxWidth.value));
});

// Handle window resize
function handleWindowResize() {
  windowWidth.value = window.innerWidth;
}

// Handle scroll event
function handleScroll() {
  if (scrollContainer.value) {
    emit('scroll', scrollContainer.value.scrollTop);
  }
}

// Expose method to set scroll position from parent
function setScrollTop(scrollTop) {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollTop;
  }
}

defineExpose({
  setScrollTop
});

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('resize', handleWindowResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize);
});

// Handle panel resize
function startResize(event) {
  event.preventDefault();
  const startX = event.clientX;
  const startWidth = props.width;
  
  function onMouseMove(e) {
    const delta = e.clientX - startX;
    const newWidth = startWidth + delta;
    emit('resize', newWidth);
  }
  
  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}
</script>

<style scoped>
/* Hide scrollbar while keeping scroll functionality */
.scrollbar-hide {
  -ms-overflow-style: none;  
  scrollbar-width: none;  
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  
}
</style>
