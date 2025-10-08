<template>
  <div class="flex flex-wrap items-start justify-between gap-4 flex-shrink-0">
    <!-- Project Title -->
    <div class="min-w-0">
      <h2
        class="font-bold text-slate-700 truncate transition-all duration-300"
        :class="isFullscreen ? 'text-3xl md:text-4xl' : 'text-2xl md:text-4xl'"
      >
        <template v-if="!projectStore.loading && project?.name">
          {{ project.name }}
        </template>
        <template v-else>
          <SkeletonLoader :class="isFullscreen ? 'w-72 h-10 rounded' : 'w-80 h-10 rounded'" />
        </template>
      </h2>
      <p
        class="mt-1 text-slate-500 transition-all duration-300"
        :class="isFullscreen ? 'text-base' : 'text-sm md:text-base'"
      >
        Overall progress of this project
      </p>
    </div>

    <!-- Status Totals -->
    <!-- <div class="flex gap-2">
      <span class="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
        Pending: {{ taskStore.taskStats.pending }}
      </span>
      <span class="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
        In Progress: {{ taskStore.taskStats.inprogress }}
      </span>
      <span class="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
        Completed: {{ taskStore.taskStats.completed }}
      </span>
    </div> -->

    <!-- Phase Dropdown -->
    <div class="flex-col flex-shrink-0">
      <div class="flex items-center gap-3 justify-end">
        <div :class="isFullscreen ? 'w-56' : 'w-48'" class="transition-all duration-300">
          <BaseDropdown
            v-model="taskStore.selectedPhase"
            :options="phaseFilterOptions"
            placeholder="Select Phase"
            trigger-class="text-sm"
          />
        </div>
      </div>
      <p
        class="mt-1 text-slate-500 transition-all duration-300"
        :class="isFullscreen ? 'text-sm' : 'text-xs md:text-sm'"
      >
        Choose a phase to filter
      </p>
    </div>
  </div>
</template>

<script setup>
import BaseDropdown from "@/components/dropdowns/BaseDropdown.vue";
import SkeletonLoader from "@/components/loaders/SkeletonLoader.vue";
import { useProjectStore } from "@/stores/projectStore";
import { useTaskStore } from "@/stores/taskStore";
import { useFilterOptions } from "@/composables/useFilterOptions";

defineProps({ isFullscreen: Boolean, project: Object });
const projectStore = useProjectStore();
const taskStore = useTaskStore();
const { phaseFilterOptions } = useFilterOptions();
</script>
