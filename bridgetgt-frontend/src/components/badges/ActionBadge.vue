<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full"
    :class="badgeClass"
  >
    <Icon :icon="iconName" width="16" height="16" />
    {{ action }}
  </span>
</template>

<script setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";
const props = defineProps({
  action: {
    type: String,
    required: true,
  },
});

const badgeClass = computed(() => {
  switch (props.action.toLowerCase()) {
    case "create":
      return "bg-green-100 text-green-800";
    case "update":
      return "bg-blue-100 text-blue-800";
    case "delete":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
});

const iconName = computed(() => {
  switch (props.action.toLowerCase()) {
    case "create":
      return "lucide:plus";
    case "update":
      return "iconoir:edit-pencil";
    case "delete":
      return "lucide:trash-2";
    default:
      return "basil:history-solid";
  }
});
</script>
