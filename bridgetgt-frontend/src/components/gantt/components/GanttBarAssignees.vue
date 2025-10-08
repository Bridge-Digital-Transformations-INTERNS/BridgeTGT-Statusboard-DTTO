<template>
  <!-- Assignees (floating left with 2px gap) -->
  <div 
    v-if="assignees && assignees.length > 0" 
    class="absolute right-full mr-0.5 flex -space-x-2 z-[15]"
  >
    <div
      v-for="(dev, index) in displayedAssignees"
      :key="dev.id || index"
      class="relative group/dev"
    >
      <div
        @mouseenter="(e) => $emit('show-tooltip', dev, e)"
        @mouseleave="$emit('hide-tooltip')"
        class="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-medium border-2 border-white shadow-sm cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10 overflow-hidden"
        :style="{
          backgroundColor: dev.color || dev.avatar_color || '#888',
        }"
      >
        <img
          v-if="dev.profile_picture || dev.avatar_url"
          :src="dev.profile_picture || dev.avatar_url"
          :alt="dev.name || dev.username"
          class="w-full h-full object-cover"
        />
        <span v-else>{{ getInitials(dev.name || dev.username) }}</span>
      </div>
    </div>
    
    <div
      v-if="extraAssigneeCount > 0"
      class="relative group/extra"
    >
      <div
        @mouseenter="(e) => $emit('show-extra-tooltip', e)"
        @mouseleave="$emit('hide-extra-tooltip')"
        class="w-6 h-6 rounded-full flex items-center justify-center bg-gray-500 text-white text-[9px] font-medium border-2 border-white shadow-sm cursor-pointer"
      >
        +{{ extraAssigneeCount }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getInitials } from '@/utils/ui';

const props = defineProps({
  assignees: {
    type: Array,
    default: () => []
  }
});

defineEmits(['show-tooltip', 'hide-tooltip', 'show-extra-tooltip', 'hide-extra-tooltip']);

const displayedAssignees = computed(() => props.assignees.slice(0, 3));
const extraAssignees = computed(() => props.assignees.slice(3));
const extraAssigneeCount = computed(() => Math.max(props.assignees.length - 3, 0));
</script>
