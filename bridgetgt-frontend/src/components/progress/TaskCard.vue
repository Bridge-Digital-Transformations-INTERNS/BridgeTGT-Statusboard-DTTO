<template>
  <div
    class="group bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden relative cursor-pointer"
  >
    <!-- Category Color Bar -->
    <CategoryIndicator :category="task.weight" variant="top-bar" />
    
    <div class="p-5">
      <!-- Header: Title & Status -->
      <div class="flex items-start justify-between gap-3 mb-4">
        <h4 class="text-base font-semibold text-slate-900 line-clamp-2 flex-1 min-h-[3rem] leading-snug">
          {{ task.title }}
        </h4>
        <StatusBadge :status="task.status" class="flex-shrink-0 mt-1" />
      </div>

      <!-- Metadata Row -->
      <div class="flex items-center gap-2 mb-4 text-xs">
        <div class="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md">
          <CategoryIndicator :category="task.weight" variant="dot" />
          <span class="font-medium">{{ task.weight }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md">
          <Icon icon="mdi:folder-outline" width="14" height="14" class="text-slate-500" />
          <span class="font-medium">{{ task.phase }}</span>
        </div>
      </div>

      <!-- Timeline -->
      <div class="mb-4 p-3 bg-slate-50 rounded-md">
        <div class="flex items-center justify-between text-xs mb-2">
          <span class="text-slate-500 font-medium">Timeline</span>
          <span class="text-slate-900 font-semibold">{{ formatDate(task.targetDate) }}</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <span>{{ formatDate(task.startDate) }}</span>
          <div class="flex-1 h-px bg-slate-300 relative">
            <div class="absolute inset-0 flex items-center justify-center">
              <Icon icon="mdi:arrow-right" width="12" height="12" class="bg-slate-50 text-slate-400" />
            </div>
          </div>
          <span>{{ formatDate(task.endDate) }}</span>
        </div>
      </div>

      <!-- Assignees -->
      <div class="relative z-10">
        <div class="text-xs text-slate-500 font-medium mb-2">Assigned to</div>
        <DeveloperBadge
          :developerIds="task.assignees"
          emptyMessage="Unassigned"
          :showOnline="false"
          :maxVisible="3"
          size="sm"
        />
      </div>
    </div>

    <!-- Hover Effect -->
    <div class="absolute inset-0 border-2 border-transparent group-hover:border-emerald-400 rounded-lg pointer-events-none transition-colors duration-200"></div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import DeveloperBadge from "@/components/badges/DeveloperBadge.vue";
import CategoryIndicator from "@/components/ui/CategoryIndicator.vue";
import StatusBadge from "@/components/badges/StatusBadge.vue";
import { formatDateDisplay } from "@/utils/ganttDates";

defineProps({ task: Object });

function formatDate(date) {
  return formatDateDisplay(date, 'medium');
}
</script>