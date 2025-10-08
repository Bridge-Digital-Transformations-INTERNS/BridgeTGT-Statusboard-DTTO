<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-[999] min-w-[160px]"
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
      @click.stop
      @contextmenu.prevent
    >
      <!-- Color Picker Section -->
      <div class="p-2 border-b border-gray-200">
        <div class="text-xs text-gray-500 mb-1 px-1">Change Color</div>
        <div class="grid grid-cols-5 gap-1">
          <button
            v-for="color in colorOptions"
            :key="color"
            @click="$emit('color-change', color)"
            class="w-6 h-6 rounded-full cursor-pointer hover:ring-2 ring-gray-400 transition-all"
            :style="{ backgroundColor: color }"
            :class="{ 'ring-2 ring-blue-500': selectedColor === color }"
            :title="'Change to ' + color"
          ></button>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="py-1">
        <button
          @click="$emit('edit')"
          class="w-full px-4 py-2 cursor-pointer text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
        >
          <Icon icon="iconoir:edit-pencil" width="16" height="16" />
          <span>Edit</span>
        </button>
        <button
          @click="$emit('delete')"
          class="w-full px-4 py-2 cursor-pointer text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
        >
          <Icon icon="lucide:trash-2" width="16" height="16" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { TIMELINE_BAR_COLORS } from '@/constants/common';

defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  position: {
    type: Object,
    required: true
  },
  selectedColor: {
    type: String,
    default: null
  }
});

defineEmits(['edit', 'delete', 'color-change']);

const colorOptions = TIMELINE_BAR_COLORS;
</script>
