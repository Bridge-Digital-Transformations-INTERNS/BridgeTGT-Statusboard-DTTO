<template>
  <span :class="['px-2 py-0 rounded-full text-xs font-medium capitalize', badgeColor]">
    {{ category }}
  </span>
</template>

<script setup>
import { computed } from "vue";
import { TASK_WEIGHTS } from "@/constants/common";

const props = defineProps({ category: String });

const badgeColor = computed(() => {
  if (props.category === TASK_WEIGHTS.LIGHT)
    return "bg-[var(--category-light-bg)] text-[var(--category-light-text)] border border-[var(--category-light-border)]";
  if (props.category === TASK_WEIGHTS.MEDIUM)
    return "bg-[var(--category-medium-bg)] text-[var(--category-medium-text)] border border-[var(--category-medium-border)]";
  if (props.category === TASK_WEIGHTS.HEAVY)
    return "bg-[var(--category-heavy-bg)] text-[var(--category-heavy-text)] border border-[var(--category-heavy-border)]";
  return "bg-gray-50 text-gray-700 border border-gray-300";
});
</script>
