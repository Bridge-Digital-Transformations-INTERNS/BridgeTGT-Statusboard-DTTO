<template>
  <button
    @click="$emit('open')"
    class="flex items-center gap-2 px-5 py-2 rounded-lg text-white bg-gradient-to-r from-[var(--color-palm)] to-[var(--color-lime)] hover:from-[var(--color-palm)]/90 hover:to-[var(--color-lime)]/90 transition-all duration-200 ease-in-out cursor-pointer transform hover:scale-105 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
  >
    <Icon icon="lucide:plus" width="24" height="24" class="text-white" />
    <span class="text-sm font-medium transition-all duration-200"> Add Task </span>
  </button>
</template>

<script setup>
import { Icon } from "@iconify/vue";
</script>
