<template>
  <div 
    class="absolute top-1/2 transform -translate-y-1/2 cursor-grab active:cursor-grabbing flex items-center z-[5] group/timeline-bar timeline-bar-wrapper"
    :class="{ 'is-dragging': isDragging, 'is-highlighted': isHighlighted }"
    :style="barStyle"
    @mousedown.left="startDrag"
    @contextmenu.prevent="showContextMenu"
  >
    <GanttBarAssignees
      :assignees="assignees"
      @show-tooltip="showDeveloperTooltip"
      @hide-tooltip="hideDeveloperTooltip"
      @show-extra-tooltip="showExtraAssigneesTooltip"
      @hide-extra-tooltip="hideExtraAssigneesTooltip"
    />
    
    <Teleport to="body">
      <div
        v-if="showDevTooltipFlag"
        class="fixed bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg pointer-events-none"
        :style="devTooltipPosition"
        style="z-index: 9999;"
      >
        {{ currentDevTooltip }}
      </div>
    </Teleport>
    
    <Teleport to="body">
      <div
        v-if="showExtraTooltipFlag"
        class="fixed bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg pointer-events-none"
        :style="extraTooltipPosition"
        style="z-index: 9999;"
      >
        <div v-for="dev in extraAssignees" :key="dev.id" class="whitespace-nowrap">
          {{ dev.name || dev.username }}
        </div>
      </div>
    </Teleport>
    
    <div 
      ref="barElement"
      class="h-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center px-2.5 relative overflow-visible w-full group/bar"
      :style="{ 
        backgroundColor: task.color || '#94A3B8',
        opacity: isPending ? 0.8 : 1
      }"
      :class="{ 'ring-2 ring-blue-500 ring-offset-2': isDragging }"
      @mouseenter="handleBarMouseEnter"
      @mouseleave="handleBarMouseLeave"
    >
      <div 
        class="absolute inset-0 bg-black/10 transition-all duration-300"
        :style="{ width: progressWidth + '%' }"
      ></div>
      
      <span class="relative z-10 text-xs font-medium text-white truncate flex-1">
        {{ task.title }}
      </span>
      
      <span class="relative z-10 ml-2 text-xs text-white/90 font-medium whitespace-nowrap">
        {{ duration }}d
      </span>
      
      <div 
        class="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover/bar:opacity-100 bg-white/20 hover:bg-white/40 transition-opacity"
        @mousedown.stop="(e) => startResize('left', e)"
        @mouseenter="showTooltip = false"
      ></div>
      <div 
        class="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover/bar:opacity-100 bg-white/20 hover:bg-white/40 transition-opacity"
        @mousedown.stop="(e) => startResize('right', e)"
        @mouseenter="showTooltip = false"
      ></div>
    </div>
      
    <GanttBarTooltip
      :visible="showTooltip"
      :position="tooltipPosition"
      :task="{
        projectName,
        title: task.title,
        startDate: task.startDate,
        targetDate: task.targetDate,
        endDate: task.endDate,
        duration
      }"
    />
    
    <div 
      v-if="isPending"
      class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse z-[25]"
      title="Unsaved changes"
    ></div>
    
    <GanttContextMenu
      :visible="contextMenuVisible"
      :position="contextMenuPosition"
      :selectedColor="task.color"
      @edit="handleEdit"
      @delete="handleDelete"
      @color-change="handleColorChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import { Icon } from '@iconify/vue';
import { useGanttStore } from '@/stores/ganttStore';
import { useDeveloperStore } from '@/stores/developerStore';
import { useProjectStore } from '@/stores/projectStore';
import { TIMELINE_BAR_COLORS } from '@/constants/common';
import { 
  calculateTaskPosition, 
  calculateTaskWidth, 
  calculateDaysBetween
} from '@/utils/ganttDates';
import { useGanttTooltip } from '@/composables/useGanttTooltip';
import { useGanttDragResize } from '@/composables/useGanttDragResize';
import { useContextMenu } from '@/composables/useContextMenu';
import GanttBarAssignees from './components/GanttBarAssignees.vue';
import GanttBarTooltip from './components/GanttBarTooltip.vue';
import GanttContextMenu from './components/GanttContextMenu.vue';

const props = defineProps({
  task: { type: Object, required: true },
  timelineStart: { type: Date, required: true },
  dayWidth: { type: Number, required: true },
  isHighlighted: { type: Boolean, default: false }
});

const emit = defineEmits(['edit', 'delete', 'update-color']);

const ganttStore = useGanttStore();
const developerStore = useDeveloperStore();
const projectStore = useProjectStore();
const barElement = ref(null);

// Composables
const {
  showTooltip,
  tooltipPosition,
  showDevTooltip: showDevTooltipFlag,
  devTooltipPosition,
  currentDevTooltip,
  showExtraTooltip: showExtraTooltipFlag,
  extraTooltipPosition,
  updateTooltipPosition,
  showDeveloperTooltip,
  hideDeveloperTooltip,
  showExtraAssigneesTooltip,
  hideExtraAssigneesTooltip
} = useGanttTooltip();

const {
  isDragging,
  resizeDirection,
  startDrag: startDragHandler,
  startResize: startResizeHandler
} = useGanttDragResize(props, ganttStore, computed(() => duration.value));

const {
  contextMenuVisible,
  contextMenuPosition,
  showContextMenu,
  hideContextMenu,
  setupClickOutside
} = useContextMenu();

setupClickOutside();

const projectName = computed(() => {
  if (!props.task.project_id) return null;
  const project = projectStore.projects.find(p => p.id === props.task.project_id);
  return project ? project.name : null;
});

const barStyle = computed(() => {
  const left = calculateTaskPosition(props.task.startDate, props.timelineStart, props.dayWidth);
  const width = calculateTaskWidth(props.task.startDate, props.task.targetDate, props.dayWidth);
  return { left: `${left}px`, width: `${width}px` };
});

const duration = computed(() => {
  return calculateDaysBetween(props.task.startDate, props.task.targetDate);
});

const progressWidth = computed(() => {
  const statusMap = { completed: 100, validated: 100, inprogress: 50 };
  return statusMap[props.task.status] || 0;
});

const isPending = computed(() => ganttStore.pendingChanges.has(props.task.id));

const assignees = computed(() => {
  if (!props.task.assignees || !Array.isArray(props.task.assignees)) return [];
  return props.task.assignees.map(assignee => {
    if (typeof assignee === 'object' && assignee.id) return assignee;
    return developerStore.getDeveloperById(assignee);
  }).filter(Boolean);
});

const extraAssignees = computed(() => assignees.value.slice(3));

function handleBarMouseEnter(event) {
  showTooltip.value = true;
  updateTooltipPosition(event);
  document.addEventListener('mousemove', handleMouseMove);
}

function handleBarMouseLeave() {
  showTooltip.value = false;
  document.removeEventListener('mousemove', handleMouseMove);
}

function handleMouseMove(event) {
  if (showTooltip.value) {
    updateTooltipPosition(event);
  }
}

function handleEdit() {
  emit('edit', props.task);
  hideContextMenu();
}

function handleDelete() {
  emit('delete', props.task.id);
  hideContextMenu();
}

function handleColorChange(color) {
  ganttStore.updateTaskLocally(props.task.id, { color });
  hideContextMenu();
}

function startDrag(event) {
  startDragHandler(event, props.timelineStart, props.dayWidth);
}

function startResize(direction, event) {
  startResizeHandler(direction, event, props.dayWidth);
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style scoped>
.timeline-bar-wrapper {
  will-change: left, width;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.timeline-bar-wrapper.is-dragging {
  transition: none !important;
}

.timeline-bar-wrapper.is-dragging * {
  transition: none !important;
  pointer-events: none;
}

.timeline-bar-wrapper:not(.is-dragging) .shadow-md {
  transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-bar-wrapper:not(.is-dragging) .ring-2 {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.cursor-grab {
  cursor: grab;
  user-select: none;
}

.cursor-grab:active,
.is-dragging {
  cursor: grabbing !important;
}

.is-dragging * {
  cursor: grabbing !important;
}

.cursor-ew-resize {
  transition: opacity 0.2s ease, background-color 0.15s ease;
  will-change: opacity;
}

.timeline-bar-wrapper:not(.is-dragging) [style*="opacity"] {
  transition: opacity 0.2s ease;
}

.timeline-bar-wrapper:not(.is-dragging) .rounded-xl {
  transition: background-color 0.15s ease;
}

.is-dragging {
  z-index: 50 !important;
}

@keyframes pulse-highlight {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
}

.timeline-bar-wrapper.is-highlighted .rounded-xl {
  animation: pulse-highlight 2s cubic-bezier(0.4, 0, 0.6, 1);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
}
</style>

