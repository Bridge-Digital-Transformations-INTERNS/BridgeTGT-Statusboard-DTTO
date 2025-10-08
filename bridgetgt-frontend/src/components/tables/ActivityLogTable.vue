<template>
  <div
    class="bg-white p-6 md:p-8 rounded-xl shadow-md border border-slate-100"
  >
    <div class="flex flex-wrap mb-4 gap-3 items-center">
      <div class="relative flex-1 min-w-[220px]">
        <span
          class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
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
        </span>
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          placeholder="Search activity..."
          class="w-full pl-10 pr-3 py-2 border rounded-lg border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
        />
      </div>
      <div class="w-48">
        <BaseDropdown
          :model-value="actionFilter"
          @update:model-value="$emit('update:actionFilter', $event)"
          :options="[
            { label: 'All Actions', value: '' },
            { label: 'Create', value: 'create' },
            { label: 'Update', value: 'update' },
            { label: 'Delete', value: 'delete' },
          ]"
          placeholder="Filter by Action"
        />
      </div>
      <div class="w-48">
        <BaseDropdown
          :model-value="entityFilter"
          @update:model-value="$emit('update:entityFilter', $event)"
          :options="[
            { label: 'All Entities', value: '' },
            { label: 'Tasks', value: 'task' },
            { label: 'Developers', value: 'developer' },
            { label: 'Projects', value: 'project' },
          ]"
          placeholder="Filter by Entity"
        />
      </div>

      <!-- <div class="w-48">
        <BaseDropdown
          :model-value="actionFilter"
          @update:model-value="$emit('update:actionFilter', $event)"
          :options="[
            { label: 'All Actions', value: '' },
            { label: 'Create', value: 'create' },
            { label: 'Update', value: 'update' },
            { label: 'Delete', value: 'delete' },
          ]"
          placeholder="Filter by Action"
        />
      </div> -->
      <!-- Date Filter -->
      <!-- <div class="w-48">
        <DatePicker
          :model-value="dateFilter"
          @update:model-value="$emit('update:dateFilter', $event)"
          placeholder="Filter by Date"
        />
      </div> -->
    </div>
    <div
      class="overflow-x-auto h-125 overflow-y-auto border border-slate-100 rounded-lg"
    >
      <!--TABLE NIGGA-->

      <table class="w-full table-fixed">
        <colgroup>
          <col style="width: 18%" /> 
          <col style="width: 20%" /> 
          <col style="width: 12%" /> 
          <col style="width: 38%" /> 
          <col style="width: 12%" /> 
        </colgroup>
        <thead class="bg-slate-50 sticky top-0 z-10">
          <tr class="text-left text-xs text-slate-600 uppercase tracking-wide">
            <th class="px-4 py-3.5 font-semibold">Date & Time</th>
            <th class="px-4 py-3.5 font-semibold">User</th>
            <th class="px-4 py-3.5 font-semibold">Module</th>
            <th class="px-4 py-3.5 font-semibold">Details</th>
            <th class="px-4 py-3.5 font-semibold">Action</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <!-- Skeleton Loader -->
          <template v-if="loading">
            <tr v-for="n in 8" :key="'skeleton-' + n">
              <td class="p-4">
                <SkeletonLoader class="h-4 w-20 rounded-md" />
              </td>

              <td class="p-4">
                <div class="flex items-center gap-3">
                  <SkeletonLoader type="circle" class="w-8 h-8" />
                  <div class="flex flex-col gap-1">
                    <SkeletonLoader class="h-4 w-28 rounded-md" />
                  </div>
                </div>
              </td>
              <td class="p-4">
                <SkeletonLoader class="h-5 w-16 rounded-full" />
              </td>

              <td class="p-4">
                <SkeletonLoader class="h-4 w-48 rounded-md" />
              </td>

              <td class="p-4 text-right">
                <SkeletonLoader class="h-4 w-32 rounded-md ml-auto" />
              </td>
            </tr>
          </template>
          <template v-else-if="paginatedLogs.length === 0">
            <tr>
              <td colspan="5" class="p-0">
                <div
                  class="h-110 flex flex-col items-center justify-center text-gray-400"
                >
                  <Icon
                    icon="material-symbols:delete-history-rounded"
                    class="w-12 h-12 mb-3"
                  />
                  <p class="text-lg font-medium">No activity logs</p>
                </div>
              </td>
            </tr>
          </template>
          <!-- Actual Logs -->
          <tr
            v-else
            v-for="log in paginatedLogs"
            :key="log.id"
            class="hover:bg-slate-50 transition-colors border-b border-slate-100"
          >
            <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">
              <div class="flex flex-col">
                <span class="font-medium">{{ formatTimestamp(log.timestamp).split(',')[0] }}</span>
                <span class="text-xs text-slate-500">{{ formatTimestamp(log.timestamp).split(',')[1]?.trim() }}</span>
              </div>
            </td>
           
            <td class="px-4 py-3.5">
              <div class="flex items-center gap-3">
                <img
                  v-if="log.session?.avatar_url"
                  :src="log.session.avatar_url"
                  :alt="log.session.username"
                  class="w-9 h-9 rounded-full border-2 border-slate-200 flex-shrink-0"
                />
                <div
                  v-else
                  class="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                >
                  {{ getInitials(log.session?.username || "U") }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="font-medium text-slate-800 truncate">
                    {{ log.session?.username || "Unknown User" }}
                  </div>
                  <div
                    v-if="log.session?.email"
                    class="text-xs text-slate-500 truncate"
                    :title="log.session.email"
                  >
                    {{ log.session.email }}
                  </div>
                </div>
              </div>
            </td>
            
            <td class="px-4 py-3.5">
              <span class="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                {{ log.entity }}
              </span>
            </td>
            
            <td class="px-4 py-3.5 text-sm text-slate-700">
              <div class="line-clamp-2" :title="generateActivityMessage(log)">
                {{ generateActivityMessage(log) }}
              </div>
            </td>
            
            <td class="px-4 py-3.5">
              <ActionBadge :action="log.action" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
      <BasePagination
        :page="currentPage"
        :total-pages="totalPages"
        @update:page="$emit('update:page', $event)"
      />
  </div>
</template>

<script setup>
import SkeletonLoader from "@/components/loaders/SkeletonLoader.vue";
import ActionBadge from "@/components/badges/ActionBadge.vue";
import { getInitials } from "@/utils/ui";
import BaseDropdown from "@/components/dropdowns/BaseDropdown.vue";
import { Icon } from "@iconify/vue";
// import DatePicker from "../calendar/DatePicker.vue";
import { ref, onMounted } from "vue";
import { useActivityLogStore } from "@/stores/activityLogStore";
import BasePagination from "@/components/ui/BasePagination.vue";
const activityLogStore = useActivityLogStore();
const isLoading = ref(false);

defineProps({
  loading: Boolean,
  filteredLogs: Array,
  paginatedLogs: Array,
  currentPage: Number,
  totalPages: Number,
  pageSize: Number,
  generateActivityMessage: Function,
  formatTimestamp: Function,
  searchQuery: String,
  actionFilter: String,
  entityFilter: String,
  // dateFilter: String,
});

defineEmits([
  "update:searchQuery",
  "update:actionFilter",
  "update:entityFilter",
  "update:page",
  // 'update:dateFilter',
  "prev",
  "next",
]);

async function refreshLogs() {
  isLoading.value = true;
  try {
    await activityLogStore.fetchLogs();
  } finally {
    isLoading.value = false;
  }
}

onMounted(refreshLogs);
</script>
