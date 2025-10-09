<template>
  <div
    class="mt-6 bg-white p-6 md:p-8 rounded-xl shadow-md border border-slate-100"
  >
    <!-- Task Timeline Header -->
    <div class="flex items-center gap-3 mb-6">
      <Icon icon="lucide:list" width="24" height="24" />
      <h2 class="text-xl font-bold text-black">Task Lists</h2>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 items-center mb-5 z-9">
      <div class="relative flex-1 min-w-[180px]">
        <div
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
        >
          <svg
            class="h-4 w-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <input
          v-model="taskStore.searchQuery"
          placeholder="Search tasks..."
          class="w-full pl-10 pr-3 py-2 border rounded-lg border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
        />
      </div>
      <div class="min-w-[140px]">
        <BaseDropdown
          v-model="taskStore.categoryFilter"
          :options="categoryFilterOptions"
          placeholder="All Categories"
          trigger-class="text-sm"
        />
      </div>
      <div class="min-w-[120px]">
        <BaseDropdown
          v-model="taskStore.statusFilter"
          :options="statusFilterOptions"
          placeholder="All Status"
          trigger-class="text-sm"
        />
      </div>
    </div>

<!-- Task Table -->
    <div
      class="overflow-x-auto h-125 overflow-y-auto rounded-xl border border-slate-200/60 bg-white shadow-sm"
    >
      <table class="min-w-full table-auto text-sm">
        <colgroup>
          <col style="width: 21%" /> 
          <col style="width: 25%" /> 
          <col style="width: 20%" /> 
          <col style="width: 15%" /> 
          <col style="width: 15%" /> 
          <col style="width: 5%" />  
        </colgroup>

        <thead class="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm">
          <tr class="text-left text-xs text-slate-600 tracking-wide border-b border-slate-200/60">
            <th class="px-6 py-3.5 font-medium">Task</th>
            <th class="px-6 py-3.5 font-medium">Timeline</th>
            <th class="px-6 py-3.5 font-medium">Phase</th>
            <th class="px-6 py-3.5 font-medium">Status</th>
            <th class="px-6 py-3.5 font-medium">Assigned to</th>
            <th class="px-6 py-3.5 text-right font-medium whitespace-nowrap">Actions</th>
          </tr>
        </thead>

        <tbody class="bg-white">
          <template v-if="taskStore.loading">
            <tr v-for="i in 5" :key="'skeleton-' + i" class="animate-pulse border-b border-slate-100/80 last:border-0">
              <td class="px-6 py-4 align-middle">
                <div class="flex items-center gap-3">
                  <SkeletonLoader class="w-3 h-3 rounded-full" />
                  <div class="flex flex-col flex-1">
                    <SkeletonLoader class="w-48 h-4 mb-2" />
                    <SkeletonLoader class="w-15 h-4" />
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 align-middle">
                <SkeletonLoader class="w-32 h-4 mb-2" />
                <SkeletonLoader class="w-24 h-3" />
              </td>
              <td class="px-6 py-4 align-middle">
                <SkeletonLoader class="w-20 h-4" />
              </td>
              <td class="px-6 py-4 align-middle">
                <SkeletonLoader class="w-24 h-8 rounded-md" />
              </td>
              <td class="px-6 py-4 align-middle">
                <div class="flex gap-2">
                  <SkeletonLoader class="w-10 h-10 rounded-full" />
                  <SkeletonLoader class="w-10 h-10 rounded-full" />
                </div>
              </td>
              <td class="px-6 py-4 align-middle text-right">
                <SkeletonLoader class="w-8 h-8 rounded-md ml-auto" />
              </td>
            </tr>
          </template>
          
          <!-- No Tasks Placeholder -->
          <template v-else-if="taskStore.displayTasks.length === 0">
            <tr>
              <td colspan="6" class="p-0">
                <div
                  class="h-110 flex flex-col items-center justify-center text-slate-400"
                >
                  <Icon
                    icon="material-symbols:no-sim-outline-rounded"
                    class="w-12 h-12 mb-3 opacity-40"
                  />
                  <p class="text-base font-medium">No tasks yet</p>
                </div>
              </td>
            </tr>
          </template>
          
          <!-- Real Rows -->
          <template v-else>
            <tr
              v-for="t in taskStore.displayTasks"
              :key="t.id"
              class="border-b border-slate-100/80 last:border-0 hover:bg-slate-50/50 transition-all duration-150"
            >
              <!-- Task Title -->
              <td class="px-6 py-4 align-middle">
                <div class="flex items-center gap-3">
                  <CategoryIndicator 
                    :category="t.weight" 
                    variant="dot"
                    height="h-2"
                  />
                  <div class="flex flex-col min-w-0">
                    <div class="font-semibold text-slate-800 truncate text-base">
                      {{ t.title }}
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5">
                      <CategoryIndicator 
                        :category="t.weight" 
                        variant="text"
                      /> 
                    </div>
                  </div>
                </div>
              </td>

              <!-- Timeline -->
              <td class="px-6 py-4 align-middle">
                <div class="flex flex-col gap-1.5">
                  <!-- Start → Target -->
                  <div class="flex items-center gap-1.5 text-xs">
                    <span class="text-slate-500 font-medium whitespace-nowrap">
                      {{ formatDate(t.startDate) }}
                    </span>
                    <Icon class="text-slate-400" icon="lucide:move-right" width="24" height="24" />
                    <span class="text-slate-900 font-semibold whitespace-nowrap">
                      {{ formatDate(t.targetDate) }}
                    </span>
                  </div>
                  
                  <!-- End Date -->
                  <div v-if="t.endDate" class="flex items-center gap-1.5 text-xs">
                    <span class="inline-flex items-center gap-1 text-emerald-600">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span class="font-medium">Completed:</span>
                    </span>
                    <span class="text-slate-600 font-medium">{{ formatDate(t.endDate) }}</span>
                  </div>
                  
                  <!-- Status indicator for in-progress tasks -->
                  <div v-else-if="t.status === 'inprogress'" class="flex items-center gap-1.5 text-xs">
                    <span class="inline-flex items-center gap-1 text-blue-500">
                      <svg class="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="6" />
                      </svg>
                      <span class="font-medium">In Progress</span>
                    </span>
                  </div>
                </div>
              </td>

              <!-- Phase -->
              <td class="px-6 py-4 align-middle">
                <div class="text-sm text-slate-700 font-medium">
                  {{ t.phase }}
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 align-middle">
                <div class="flex items-center gap-2">
                  <StatusDropdown
                    :value="t.status"
                    @update:value="updateStatus(t, $event)"
                    @wheel.prevent
                    @touchmove.prevent
                    @scroll.prevent
                  />
                </div>
              </td>

              <!-- Assigned To -->
              <td class="px-6 py-4 align-middle">
                <DeveloperBadge
                  :developerIds="t.assignees"
                  emptyMessage="Unassigned"
                  :maxVisible="3"
                />
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 align-middle text-right">
                <div class="inline-flex items-center justify-end">
                  <MeatballMenu
                    :item="t"
                    @edit="openEdit"
                    @delete="askDelete"
                  />
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    
    <TaskModal
      :open="editModal.isOpen.value"
      :isEdit="true"
      :initial="editModal.data.value"
      @close="editModal.close"
      @save="saveTask"
    />
    <ConfirmModal
      :open="deleteConfirm.isOpen.value"
      title="Delete Task"
      message="Are you sure you want to delete this task?"
      @cancel="deleteConfirm.close"
      @confirm="confirmDelete"
    />
    <BasePagination
      v-if="taskStore.pagination.totalPages > 1"
      :page="taskStore.currentPage"
      :total-pages="taskStore.pagination.totalPages"
      @update:page="(p) => taskStore.currentPage = p"
    />
  </div>
</template>

<script setup>
import TaskModal from "@/components/modals/TaskModal.vue";
import ConfirmModal from "@/components/modals/ConfirmModal.vue";
import CategoryIndicator from "@/components/ui/CategoryIndicator.vue";
import DeveloperBadge from "@/components/badges/DeveloperBadge.vue";
import StatusDropdown from "@/components/dropdowns/StatusDropdown.vue";
import BaseDropdown from "@/components/dropdowns/BaseDropdown.vue";
import MeatballMenu from "@/components/ui/MeatballMenu.vue";
import { useTaskStore } from "@/stores/taskStore";
import { useModalManager } from "@/composables/useModalManager";
import { useTaskOperations } from "@/composables/useTaskOperations";
import { useFilterOptions } from "@/composables/useFilterOptions";
import { onMounted, watch } from "vue";
import { useDeveloperStore } from "@/stores/developerStore";
import SkeletonLoader from "@/components/loaders/SkeletonLoader.vue";
import { Icon } from "@iconify/vue";
import BasePagination from "@/components/ui/BasePagination.vue";
import { onUnmounted } from "vue";
import { useToastNotification } from "@/composables/useToastNotification";
const { showSuccess } = useToastNotification();

const taskStore = useTaskStore();
const developerStore = useDeveloperStore();
const { categoryFilterOptions, statusFilterOptions } = useFilterOptions();
const { updateTaskStatus } = useTaskOperations(taskStore);
const { taskModal: editModal, deleteConfirm } = useModalManager([
  "task",
  "delete",
]);

onMounted(async () => {
  await developerStore.fetchDevelopers();
  taskStore.fetchTasks();
});

onUnmounted(() => {
  
});

// Reset to page 1 when filters change
watch([
  () => taskStore.searchQuery,
  () => taskStore.statusFilter,
  () => taskStore.categoryFilter,
  () => taskStore.selectedPhase
], () => {
  taskStore.currentPage = 1;
});

function openEdit(task) {
  editModal.openEdit(task);
}

function askDelete(task) {
  deleteConfirm.open(task);
}

async function saveTask(data, onComplete) {
  try {
    await taskStore.updateTaskWithAssignees(editModal.data.value.id, data);
    editModal.close();
    if (onComplete) onComplete();
  } catch (error) {
    console.error("Error saving task:", error);
    if (onComplete) onComplete();
  }
}

function confirmDelete() {
  if (!deleteConfirm.item.value) return;
  taskStore.deleteTask(deleteConfirm.item.value.id);
  showSuccess("Task Deleted", "Task has been deleted successfully!");
  deleteConfirm.close();
}

function updateStatus(task, event) {
  updateTaskStatus(task, event);
}

function formatDate(date) {
  if (!date) return "—"; 
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
</script>
