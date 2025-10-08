<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed z-[9999] w-[280px] bg-white rounded-lg shadow-xl border border-gray-200 pointer-events-none overflow-hidden"
      :style="position"
    >
      <!-- Header -->
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div
          v-if="task.projectName"
          class="flex items-center gap-2 mb-2"
        >
          <span class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            {{ task.projectName }}
          </span>
        </div>
        
        <!-- Title -->
        <div class="text-sm font-bold text-gray-900 leading-snug">
          {{ task.title }}
        </div>
      </div>

      <div class="px-4 py-3 space-y-3">
        <!-- Assignees -->
        <div v-if="task.assignees && task.assignees.length > 0" class="flex items-start gap-2">
          <span class="text-[11px] text-gray-500 mt-0.5">Assignees</span>
          <div class="flex-1">
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="assignee in task.assignees"
                :key="assignee.id || assignee.name"
                class="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-[11px] font-medium"
              >
                {{ assignee.name || assignee.developerName }}
              </span>
            </div>
          </div>
        </div>

        <!-- Dates -->
        <div class="space-y-2 text-[11px]">
          <div class="flex justify-between items-center">
            <span class="text-gray-500">Start</span>
            <span class="font-semibold text-gray-900">
              {{ formatDate(task.startDate) }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500">Target</span>
            <span class="font-semibold text-gray-900">
              {{ formatDate(task.targetDate) }}
            </span>
          </div>
          <div v-if="task.endDate" class="flex justify-between items-center">
            <span class="text-gray-500">Completed</span>
            <span class="text-md font-bold text-green-700">
              {{ formatDate(task.endDate) }}
            </span>
          </div>
        </div>
        <!-- Duration -->
        <div class="pt-2 border-t border-gray-100">
          <div class="flex justify-between items-center text-[11px]">
            <span class="text-gray-500">Duration</span>
            <span class="font-bold text-gray-900">
              {{ task.duration }} days
            </span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { formatDateDisplay } from '@/utils/ganttDates';

defineProps({
  visible: Boolean,
  position: Object,
  task: {
    type: Object,
    required: true,
  },
});

function formatDate(dateString) {
  return formatDateDisplay(dateString, 'medium');
}
</script>
