import { ref, computed, watch } from "vue";
import { useActivityLogStore } from "@/stores/activityLogStore";
import { storeToRefs } from "pinia";
import { getEntityDisplayName } from "@/utils/ui";

export function useActivityLogFilters() {
  const store = useActivityLogStore();
  const { logs } = storeToRefs(store);
  const searchQuery = ref("");
  const actionFilter = ref("");
  const entityFilter = ref("");
  //  const dateFilter = ref("");
  const currentPage = ref(1);
  const pageSize = ref(15); // Reduced from 1000 to 15 for better readability

  // Reset to page 1 when filters change
  watch([searchQuery, actionFilter, entityFilter], () => {
    currentPage.value = 1;
  });

  // Filtered logs
  const filteredLogs = computed(() => {
    return logs.value.filter((log) => {
      const matchesSearch =
        searchQuery.value === "" ||
        log.session?.username?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        log.session?.email?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        log.entity?.toLowerCase().includes(searchQuery.value.toLowerCase());

      const matchesAction = actionFilter.value === "" || log.action === actionFilter.value;

      const matchesEntity = entityFilter.value === "" || log.entity === entityFilter.value;

      // const matchesDate =
      // dateFilter.value === "" ||
      // log.timestamp.startsWith(dateFilter.value);

      return matchesSearch && matchesAction && matchesEntity;
    });
  });

  // Pagination
  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredLogs.value.length / pageSize.value)),
  );

  const paginatedLogs = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredLogs.value.slice(start, start + pageSize.value);
  });

  function generateActivityMessage(log) {
    const details = log.details ? JSON.parse(log.details) : {};
    const entityName = getEntityDisplayName(log.entity);
    switch (log.action) {
      case "create":
        return `Created ${entityName.toLowerCase()} "${details.name || details.title || `#${log.entity_id}`}"`;
      case "update":
        return `Updated ${entityName.toLowerCase()} "${details.name || details.title || `#${log.entity_id}`}"`;
      case "delete":
        return `Deleted ${entityName.toLowerCase()} "${details.name || details.title || `#${log.entity_id}`}"`;
      default:
        return `Performed ${log.action} on ${entityName.toLowerCase()}`;
    }
  }

  function formatTimestamp(ts) {
    if (!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return {
    searchQuery,
    actionFilter,
    entityFilter,
    //  dateFilter,
    currentPage,
    pageSize,
    filteredLogs,
    paginatedLogs,
    totalPages,
    generateActivityMessage,
    formatTimestamp,
  };
}
