<template>
  <div
    class="bg-white rounded-xl border border-slate-100 shadow-sm transition-all duration-300 flex-shrink-0"
    :class="isFullscreen ? 'p-4 space-y-4' : 'p-6 space-y-6'"
  >
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="font-medium text-black" :class="isFullscreen ? 'text-sm' : 'text-base'">
          {{ titleLabel }}
        </span>
        <span class="font-bold text-black" :class="isFullscreen ? 'text-3xl' : 'text-5xl'">
          {{ taskStore.taskStats.percentDisplay }}%
        </span>
      </div>
      <div
        class="relative w-full bg-slate-100 rounded-full overflow-hidden"
        :class="isFullscreen ? 'h-4' : 'h-6'"
      >
        <div
          class="h-full rounded-full transition-all duration-700"
          :style="{
            width: taskStore.taskStats.percent + '%',
            background:
              'linear-gradient(90deg, var(--progress-gradient-start), var(--progress-gradient-end))',
          }"
        ></div>
      </div>
      <p class="text-center text-slate-500" :class="isFullscreen ? 'text-xs' : 'text-sm'">
        {{ taskStore.taskStats.completedPoints }} / {{ taskStore.taskStats.totalPoints }} points •
        {{ taskStore.taskStats.completedAndValidated }} / {{ taskStore.taskStats.totalTasks }} tasks
      </p>
    </div>
  </div>
</template>

<script setup>
import { useTaskStore } from "@/stores/taskStore";
defineProps({ isFullscreen: Boolean, titleLabel: String });
const taskStore = useTaskStore();
</script>
