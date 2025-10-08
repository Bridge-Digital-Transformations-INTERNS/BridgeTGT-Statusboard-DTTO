<template>
  <div class="bg-white border-b border-gray-200 px-2 sm:px-4 py-2.5 flex items-center justify-between flex-shrink-0 gap-2">
    <!-- Left: View Mode and Zoom Controls -->
    <div class="flex items-center gap-2 sm:gap-3 flex-wrap">

      
      <div class="h-5 w-px bg-gray-300 hidden sm:block"></div>
      <!-- Expand/collapse -->
      <button
        @click="$emit('expand-all')"
        class="px-2 sm:px-3 py-1.5 cursor-pointer hover:bg-gray-200 rounded transition-colors flex items-center gap-1.5"
        title="Expand all"
      >
        <Icon icon="material-symbols:expand-all" width="16" height="16" class="text-gray-600"/>
        <span class="text-md text-black font-medium hidden md:inline">Expand all</span>
      </button>
      <button
        @click="$emit('collapse-all')"
        class="px-2 sm:px-3 py-1.5 cursor-pointer hover:bg-gray-200 rounded transition-colors flex items-center gap-1.5"
        title="Collapse all"
      >
        <Icon icon="material-symbols:collapse-all" width="16" height="16" class="text-gray-600" />
        <span class="text-md text-black font-medium hidden md:inline">Collapse all</span>
      </button>
    </div>
    
    <!-- Right:zoom -->
    <div class="flex items-center gap-1 sm:gap-2">
<!-- Online Users -->
      <OnlineUsers :onlineUsers="onlineUsers" />
      <div class="flex items-center gap-2">
        <!-- Days/Week/Month View Selector with dropdown -->
      <div class="relative" ref="viewDropdownRef">
        <button
          @click="showViewDropdown = !showViewDropdown"
          class="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <Icon 
            :icon="currentViewIcon" 
            width="16" 
            height="16" 
            class="text-[var(--color-palm)]" 
          />
          <span class="text-sm font-medium text-gray-700 hidden sm:inline">{{ currentZoomLevelLabel }}</span>
          <span class="text-sm font-medium text-gray-700 sm:hidden">{{ currentZoomLevelShort }}</span>
          <Icon icon="mdi:chevron-down" width="14" height="14" class="text-gray-500" />
        </button>
        
        <!-- View Dropdown Menu -->
        <div
          v-if="showViewDropdown"
          class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px] py-1"
        >
          <button
            v-for="level in zoomLevels"
            :key="level.value"
            @click="selectZoomLevel(level.value)"
            class="w-full cursor-pointer px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
            :class="{ 'bg-blue-50 text-[var(--color-palm)] font-semibold': currentZoomLevel === level.value }"
          >
            <Icon :icon="level.icon" width="16" height="16" />
            <span>{{ level.label }}</span>
          </button>
        </div>
      </div>
        <button
          @click="$emit('zoom-out')"
          class="p-2 cursor-pointer hover:bg-gray-200 rounded-full transition-colors"
          title="Zoom out"
        >
          <Icon icon="ri:zoom-out-line" width="26" height="26" class="text-gray-500" />
        </button>
        
        <button
          @click="$emit('zoom-in')"
          class="p-2 cursor-pointer hover:bg-gray-200 rounded-full transition-colors"
          title="Zoom in"
        >
          <Icon icon="ri:zoom-in-line" width="26" height="26" class="text-gray-500" />
        </button>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import OnlineUsers from '@/components/header/OnlineUsers.vue';

const props = defineProps({
  currentZoomLevel: {
    type: String,
    default: 'day'
  },
  onlineUsers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['zoom-in', 'zoom-out', 'zoom-level-change', 'expand-all', 'collapse-all']);

const showViewDropdown = ref(false);
const viewDropdownRef = ref(null);

const zoomLevels = [
  { value: 'day', label: 'Day View', icon: 'mdi:calendar-text', short: 'Days' },
  { value: 'week', label: 'Week View', icon: 'mdi:calendar-week', short: 'Weeks' },
  { value: 'month', label: 'Month View', icon: 'mdi:calendar-month', short: 'Months' }
];

const currentZoomLevelLabel = computed(() => {
  const level = zoomLevels.find(l => l.value === props.currentZoomLevel);
  return level ? level.label : 'Day View';
});

const currentZoomLevelShort = computed(() => {
  const level = zoomLevels.find(l => l.value === props.currentZoomLevel);
  return level ? level.short : 'Days';
});

const currentViewIcon = computed(() => {
  const level = zoomLevels.find(l => l.value === props.currentZoomLevel);
  return level ? level.icon : 'mdi:calendar-text';
});

function selectZoomLevel(level) {
  emit('zoom-level-change', level);
  showViewDropdown.value = false;
}

function handleClickOutside(event) {
  if (viewDropdownRef.value && !viewDropdownRef.value.contains(event.target)) {
    showViewDropdown.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
