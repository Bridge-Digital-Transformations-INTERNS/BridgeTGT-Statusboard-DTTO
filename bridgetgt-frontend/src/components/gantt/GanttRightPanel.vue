<template>
  <div class="flex-1 bg-white relative h-full flex flex-col overflow-hidden">
    <div class="flex-shrink-0 sticky top-0 z-30 overflow-hidden">
      <div ref="headerScrollContainer" class="overflow-x-hidden">
        <GanttTimelineHeader 
          :months="timelineMonths"
          :days="timelineDays"
          :weeks="timelineWeeks"
          :dayWidth="ganttStore.dayWidth"
          :useWeekView="useWeekView"
        />
      </div>
    </div>
    
    <div 
      class="flex-1 overflow-x-auto overflow-y-auto relative"
      ref="scrollContainer"
      @scroll="handleScroll"
    >
      <div class="relative min-h-full" :style="{ width: timelineWidth + 'px' }">
        <GanttTodayMarker :todayPosition="todayPosition" />
      
        <div class="absolute inset-0 flex">
          <div
            v-for="(day, index) in timelineDays"
            :key="day.key"
            class="border-r border-solid border-gray-100"
            :class="{ 'bg-blue-50/50': day.isWeekend }"
            :style="{ width: ganttStore.dayWidth + 'px' }"
          ></div>
        </div>
        
        <div class="relative">
          <div 
            v-for="(phaseTasks, phaseName) in ganttStore.tasksByPhase" 
            :key="phaseName"
          >
            <div 
              class="h-[42px] flex items-center px-2 bg-gray-50 border-gray-200 w-full"
            >
            </div>
            
            <transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-[2000px] opacity-100"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="max-h-[2000px] opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div v-if="ganttStore.expandedPhases.has(phaseName)" class="overflow-hidden">
                <div 
                  v-for="task in phaseTasks"
                  :key="task.id"
                  class="relative hover:bg-slate-200 h-[52px]  border-gray-200 transition-colors overflow-visible w-full"
                  :class="{ 'bg-blue-50/50': hoveredRowId === task.id }"
                  @mouseenter="$emit('hover-row', task.id)"
                  @mouseleave="$emit('hover-row', null)"
                >
                  <GanttTimelineBar
                    :task="task"
                    :timelineStart="timelineStart"
                    :dayWidth="ganttStore.dayWidth"
                    :isHighlighted="hoveredRowId === task.id"
                    @edit="$emit('edit-task', $event)"
                    @delete="$emit('delete-task', $event)"
                    @update-color="$emit('update-color', task.id, $event)"
                  />
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGanttStore } from '@/stores/ganttStore';
import GanttTimelineHeader from './GanttTimelineHeader.vue';
import GanttTimelineBar from './GanttTimelineBar.vue';
import GanttTodayMarker from './components/GanttTodayMarker.vue';
import { useGanttTimeline } from '@/composables/useGanttTimeline';

const props = defineProps({
  hoveredRowId: {
    type: [String, Number, null],
    default: null
  }
});

const ganttStore = useGanttStore();
const emit = defineEmits(['edit-task', 'delete-task', 'update-color', 'hover-row', 'scroll']);
const scrollContainer = ref(null);
const headerScrollContainer = ref(null);

// Use timeline composable
const {
  useWeekView,
  timelineStart,
  timelineDays,
  timelineMonths,
  timelineWeeks,
  timelineWidth
} = useGanttTimeline(ganttStore);

// Handle scroll event - sync both vertical and horizontal scroll
function handleScroll() {
  if (scrollContainer.value) {
    emit('scroll', scrollContainer.value.scrollTop);
    if (headerScrollContainer.value) {
      headerScrollContainer.value.scrollLeft = scrollContainer.value.scrollLeft;
    }
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

// Calculate today's position
const todayPosition = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayIndex = timelineDays.value.findIndex(d => 
    d.date.toDateString() === today.toDateString()
  );
  
  return todayIndex >= 0 ? todayIndex * ganttStore.dayWidth : -1;
});
</script>

<style scoped>
.overflow-x-auto {
  scroll-behavior: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

.relative.min-h-full {
  transition: width 0.3s ease-out;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.overflow-x-auto,
.overflow-y-auto {
  will-change: scroll-position;
}
</style>
