<template>
  <div class="min-h-screen bg-slate-50">
    <ActivityLogHeader
      :loading="loading"
      @back="goBack"
      @refresh="refreshLogs"
    />

    <div class="max-w-7xl mx-auto p-6">
      <ActivityLogTable
        :loading="loading"
        :filteredLogs="filteredLogs"
        :paginatedLogs="paginatedLogs"
        :currentPage="currentPage"
        :totalPages="totalPages"
        :pageSize="pageSize"
        :generateActivityMessage="generateActivityMessage"
        :formatTimestamp="formatTimestamp"
        :searchQuery="searchQuery"
        :actionFilter="actionFilter"
        :entityFilter="entityFilter"
        @update:searchQuery="searchQuery = $event"
        @update:actionFilter="actionFilter = $event"
        @update:entityFilter="entityFilter = $event"
        @update:page="currentPage = $event"
      />
      
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, onUnmounted } from 'vue'
import { useActivityLogFilters } from "@/composables/useActivityLogFilters";
import ActivityLogHeader from "@/components/ui/ActivityLogHeader.vue";
import ActivityLogTable from "@/components/tables/ActivityLogTable.vue";
import { useActivityLogStore } from "@/stores/activityLogStore";

const activityLogStore = useActivityLogStore();
const router = useRouter();
const loading = ref(false);
const isNavigating = ref(false); 

onMounted(() => {
  console.log('ActivityLog: Component mounted');
});

onUnmounted(() => {
  console.log('ActivityLog: Component unmounted');
  isNavigating.value = false;
});
const {
  searchQuery,
  actionFilter,
  entityFilter,
  // dateFilter,
  currentPage,
  pageSize,
  filteredLogs,
  paginatedLogs,
  totalPages,
  generateActivityMessage,
  formatTimestamp,
} = useActivityLogFilters();

function goBack() {
  if (isNavigating.value) {
    console.log('ActivityLog: Navigation already in progress, ignoring...');
    return;
  }
  
  console.log('ActivityLog: goBack() called');
  isNavigating.value = true;
  
  const previousRoute = localStorage.getItem('previousRoute');
  console.log('ActivityLog: Going back from Activity Log. Previous route:', previousRoute);
  localStorage.removeItem('previousRoute');
  
  if (previousRoute === 'GanttView') {
    console.log('ActivityLog: Navigating back to Gantt view');
    router.push('/gantt').finally(() => {
      setTimeout(() => {
        isNavigating.value = false;
      }, 100);
    });
  } else {
    console.log('ActivityLog: Navigating to dashboard (previousRoute was:', previousRoute, ')');
    router.push('/').finally(() => {
      setTimeout(() => {
        isNavigating.value = false;
      }, 100);
    });
  }
}

async function refreshLogs() {
  loading.value = true;
  try {
    await activityLogStore.fetchLogs();
  } finally {
    loading.value = false;
  }
}
</script>
