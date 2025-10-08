<template>
  <div class="flex-1 flex flex-col min-h-0 mt-6 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg">
          <Icon icon="material-symbols:task-alt" class="text-black" width="20" height="20" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-slate-800">Task Overview</h3>
          <p class="text-xs text-slate-500">{{ totalTasks }} total tasks</p>
        </div>
      </div>
      <div class="flex gap-3">
        <div class="w-56">
          <BaseDropdown
            v-model="localFilterStatus"
            :options="statusOptions"
            placeholder="Filter by Status"
            trigger-class="text-sm"
          />
        </div>
      </div>
    </div>

    <!-- Task Grid -->
    <div class="flex-1 overflow-y-auto p-6 min-h-0">
      <div v-if="paginatedTasks.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          <TransitionGroup name="task-fade">
            <TaskCard v-for="task in paginatedTasks" :key="task.id" :task="task" />
          </TransitionGroup>
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
        <div class="p-4 bg-white rounded-full mb-3">
          <Icon icon="material-symbols:search-off" width="40" height="40" class="text-slate-300" />
        </div>
        <p class="text-base font-medium text-slate-600">No tasks found</p>
        <p class="text-sm mt-1">Try adjusting your filters or add new tasks</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="px-6 pb-4 bg-white border-t border-slate-200">
      <BasePagination
        :page="currentPage"
        :totalPages="totalPages"
        @update:page="currentPage = $event"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { Icon } from "@iconify/vue";
import BaseDropdown from "@/components/dropdowns/BaseDropdown.vue";
import BasePagination from "@/components/ui/BasePagination.vue";
import TaskCard from "./TaskCard.vue";

const props = defineProps({
  filteredTasks: { type: Array, default: () => [] },
  filterStatus: { type: String, default: "" },
  statusOptions: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:filterStatus"]);

const localFilterStatus = computed({
  get: () => props.filterStatus,
  set: (val) => emit("update:filterStatus", val),
});

// Pagination state
const currentPage = ref(1);
const pageSize = 12;

// Computed pagination values
const totalTasks = computed(() => props.filteredTasks.length);
const totalPages = computed(() => Math.ceil(totalTasks.value / pageSize) || 1);

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return props.filteredTasks.slice(start, end);
});

// Reset to page 1 when filter changes
watch(() => props.filterStatus, () => {
  currentPage.value = 1;
});

// Reset to page 1 if current page exceeds total pages
watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) {
    currentPage.value = 1;
  }
});
</script>

<style scoped>
.task-fade-enter-active,
.task-fade-leave-active {
  transition: all 0.3s ease;
}

.task-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.task-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.task-fade-move {
  transition: transform 0.3s ease;
}
</style>
