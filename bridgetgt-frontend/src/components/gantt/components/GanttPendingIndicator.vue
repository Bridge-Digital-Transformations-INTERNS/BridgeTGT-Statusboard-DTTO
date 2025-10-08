<template>
  <div 
    v-if="hasPendingChanges"
    class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-600 font-medium whitespace-nowrap"
  >
    <div class="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse"></div>
    {{ pendingCount }} unsaved
  </div>
</template>

<script setup>
defineProps({
  hasPendingChanges: {
    type: Boolean,
    default: false
  },
  pendingCount: {
    type: Number,
    default: 0
  }
});
</script>
