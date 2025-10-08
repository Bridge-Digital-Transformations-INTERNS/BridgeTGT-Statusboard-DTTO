<template>
  <div class="flex items-center gap-2">
    <OnlineUsers :onlineUsers="onlineUsers" />
    
    <button
      @click="$emit('add-task')"
      class="flex items-center cursor-pointer gap-1.5 px-4 py-2 bg-gradient-to-r from-[#349083] to-[#e3ea4e] text-white rounded-lg hover:shadow-md transition-all text-sm font-medium"
    >
      <Icon icon="lucide:plus" width="20" height="20" class="text-white" />
      <span class="text-sm font-medium">Add Task</span>
    </button>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import OnlineUsers from '@/components/header/OnlineUsers.vue';

defineProps({
  onlineUsers: {
    type: Array,
    default: () => []
  }
});

defineEmits(['add-task']);
</script>
