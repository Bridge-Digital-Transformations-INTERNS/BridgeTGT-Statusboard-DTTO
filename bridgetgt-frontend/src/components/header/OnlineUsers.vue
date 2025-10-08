<template>
  <div v-if="onlineUsers.length" class="flex items-center gap-2 mr-4">
    <div class="flex -space-x-2">
      <DeveloperBadge
        :developersData="onlineUsers.map((u) => ({ ...u, isOnline: true }))"
        :maxVisible="2"
        showOnline
      />
    </div>
    <!-- <div class="flex items-center gap-1">
      <span class="relative flex h-3 w-3">
        <span
          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
        ></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
      <span class="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
        Online: {{ onlineUsers.length }}
      </span>
    </div> -->
  </div>
</template>

<script setup>
import DeveloperBadge from "@/components/badges/DeveloperBadge.vue";

defineProps({
  onlineUsers: {
    type: Array,
    default: () => [],
  },
});
</script>
