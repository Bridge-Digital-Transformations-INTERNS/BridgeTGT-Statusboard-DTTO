import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/utils/api";

export const useActivityLogStore = defineStore("activityLog", () => {
  const logs = ref([]);
  const pagination = ref({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const loading = ref(false);


  //FETCH LOG BUT NAKA PAGINATED
  const fetchLogs = async (page = 1, pageSize = 20) => {
    loading.value = true;
    try {
      const response = await api.get("/change-logs", {
        params: { page, pageSize },
        headers: { "x-session-token": localStorage.getItem("sessionToken") },
      });
      logs.value = response.data.logs;
      pagination.value = response.data.pagination;
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    logs,
    pagination,
    loading,
    fetchLogs,
  };
});
