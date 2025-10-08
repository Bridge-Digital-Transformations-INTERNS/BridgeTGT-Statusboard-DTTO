<template>
  <div 
    class="group h-[52px] transition-all duration-200 hover:bg-gray-50 cursor-pointer bg-white "
    :style="isHovered ? { backgroundColor: `${task.color || '#94A3B8'}20`, borderLeft: `3px solid ${task.color || '#94A3B8'}` } : {}"
    @click="handleTaskClick"
    @contextmenu.prevent="showContextMenu"
    title="Click to scroll to timeline, right-click for options"
  >
    <div class="h-full flex items-center gap-2 px-10">
      
      <!-- Weight Indicator -->
      <!-- <div class="hidden lg:block flex-shrink-0">
        <div 
          class="w-1 h-1 rounded-full"
          :class="{
            'bg-green-400': task.weight === 'light',
            'bg-yellow-400': task.weight === 'medium',
            'bg-red-400': task.weight === 'heavy'
          }"
          :title="task.weight || 'medium'"
        ></div>
      </div> -->
      
      <!-- Task Name - More identifiable -->
      <div class="pl-6 flex-1 min-w-0">
        <input
          v-if="isEditingTitle"
          ref="titleInput"
          v-model="editedTitle"
          @blur="saveTitle"
          @keydown.enter="saveTitle"
          @keydown.esc="cancelEdit"
          @click.stop
          class="text-lg font-semibold text-black w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-palm)] focus:border-[var(--color-palm)]"
        />
        <div
          v-else
          @click.stop="startEditTitle"
          class="text-md font-medium text-black truncate hover:text-black cursor-text transition-colors"
          :title="task.title + ' (Click to edit, right-click for more options)'"
        >
          {{ task.title }}
        </div>
      </div>
      
      <!-- Dates - Minimal, monospace style -->
      <div class="hidden md:flex items-center gap-5 text-xs pr-5">
        <div class="flex flex-col">
          <span class="text-gray-400 uppercase text-[10px] font-medium">Start</span>
          <span class="text-gray-700 font-medium">{{ formatDate(task.startDate) }}</span>
        </div>
        <Icon class="text-slate-300" icon="lucide:move-right" width="24" height="24" />
        <div class="flex flex-col">
          <span class="text-gray-400 uppercase text-[10px] font-medium">Target</span>
          <span class="text-gray-900 font-bold">{{ formatDate(task.targetDate) }}</span>
        </div>
      </div>

      
      <!-- Status - Compact -->
      <div class="w-[100px] flex-shrink-0">
        <StatusDropdown
          :value="typeof task.status === 'string' ? task.status : task.status?.status || 'pending'"
          @update:value="updateStatus"
        />
      </div>
    </div>
    
    <!-- Context Menu -->
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
import { ref, nextTick } from 'vue';
import StatusDropdown from '@/components/dropdowns/StatusDropdown.vue';
import GanttContextMenu from './components/GanttContextMenu.vue';
import { formatDateDisplay } from '@/utils/ganttDates';
import { useContextMenu } from '@/composables/useContextMenu';
import { useGanttStore } from '@/stores/ganttStore';
import { Icon } from '@iconify/vue';

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  isHovered: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['edit', 'delete', 'update-status', 'scroll-to-task', 'update-title', 'update-color']);

const ganttStore = useGanttStore();

const {
  contextMenuVisible,
  contextMenuPosition,
  showContextMenu: showContextMenuHandler,
  hideContextMenu,
  setupClickOutside
} = useContextMenu();

setupClickOutside();

const isEditingTitle = ref(false);
const editedTitle = ref('');
const titleInput = ref(null);

function formatDate(date) {
  return formatDateDisplay(date, 'short');
}

function updateStatus(newStatus) {
  emit('update-status', newStatus);
}

function handleTaskClick() {
  if (!isEditingTitle.value) {
    emit('scroll-to-task', props.task.id);
  }
}

function startEditTitle() {
  isEditingTitle.value = true;
  editedTitle.value = props.task.title;
  nextTick(() => {
    titleInput.value?.focus();
    titleInput.value?.select();
  });
}

function saveTitle() {
  if (editedTitle.value.trim() && editedTitle.value !== props.task.title) {
    emit('update-title', props.task.id, editedTitle.value.trim());
  }
  isEditingTitle.value = false;
}

function cancelEdit() {
  isEditingTitle.value = false;
  editedTitle.value = props.task.title;
}

// Context Menu Handlers
const showContextMenu = (event) => {
  showContextMenuHandler(event);
};

const handleEdit = () => {
  hideContextMenu();
  emit('edit', props.task.id);
};

const handleDelete = () => {
  hideContextMenu();
  emit('delete', props.task.id);
};

const handleColorChange = (newColor) => {
  hideContextMenu();
  emit('update-color', props.task.id, newColor);
};
</script>
