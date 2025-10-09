import { defineStore } from "pinia";
import api from "@/utils/api";
import { computed, ref } from "vue";
import { WEIGHT_POINTS } from "@/constants/common";
import { TASK_STATUSES } from "@/constants/common";
import { useDeveloperStore } from "@/stores/developerStore";
import { useProjectStore } from "@/stores/projectStore";
import { watch } from "vue";
import echo from "@/utils/reverb";
import { toRaw } from "vue";
import { formatDateForAPI } from "@/utils/ganttDates";

const projectStore = useProjectStore();
const currentProjectId = ref(projectStore.selectedProjectId);

watch(
  () => projectStore.selectedProjectId,
  (newId) => {
    currentProjectId.value = newId;
  },
);

export const useTaskStore = defineStore("task", () => {
  const searchQuery = ref("");
  const statusFilter = ref("");
  const categoryFilter = ref("");
  const selectedPhase = ref("Overall");
  const developerStore = useDeveloperStore();
  const allTasks = ref([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const totalTasks = ref(0);
  const totalPages = ref(1);

  //REVERB
  function initReverbListeners() {
    echo.channel('tasks')
      .listen('.task.created', (event) => {
        console.log("[TaskStore] Reverb event: task.created", event.task);
        // Only add if task doesn't exist and belongs to current project
        if (currentProjectId.value && event.task.project_id === currentProjectId.value) {
          if (!allTasks.value.some(t => t.id === event.task.id)) {
            allTasks.value = [...allTasks.value, event.task];
            console.log("[TaskStore] Task added to list");
          }
        }
      })
      .listen('.task.updated', (event) => {
        console.log("[TaskStore] Reverb event: task.updated", event.task);
        const idx = allTasks.value.findIndex((t) => t.id === event.task.id);
        if (idx !== -1) {
          // Force reactivity by creating a new object
          allTasks.value[idx] = { ...allTasks.value[idx], ...event.task };
          // Trigger array reactivity
          allTasks.value = [...allTasks.value];
          console.log("[TaskStore] Task updated in list");
        } else {
          console.log("[TaskStore] Task not found in list:", event.task.id);
        }
      })
      .listen('.task.deleted', (event) => {
        console.log("[TaskStore] Reverb event: task.deleted", event.id);
        const beforeLength = allTasks.value.length;
        allTasks.value = allTasks.value.filter((t) => t.id !== event.id);
        if (beforeLength !== allTasks.value.length) {
          console.log("[TaskStore] Task removed from list");
        }
      })
      .listen('.taskAssignee.added', (event) => {
        console.log("[TaskStore] Reverb event: taskAssignee.added", { task_id: event.task_id, developer_id: event.developer_id });
        const idx = allTasks.value.findIndex((t) => t.id === event.task_id);
        if (idx !== -1) {
          const task = allTasks.value[idx];
          if (!task.assigneeIds) task.assigneeIds = [];
          if (!task.assigneeIds.includes(event.developer_id)) {
            task.assigneeIds = [...task.assigneeIds, event.developer_id];
          }

          if (!task.assignees) task.assignees = [];
          const dev = developerStore.getDeveloperById(event.developer_id);
          if (dev && !task.assignees.some((d) => d.id === dev.id)) {
            task.assignees = [...task.assignees, dev];
          }

          // Force reactivity
          allTasks.value[idx] = { ...task };
          allTasks.value = [...allTasks.value];
          console.log("[TaskStore] Assignee added to task");
        }
      })
      .listen('.taskAssignee.removed', (event) => {
        console.log("[TaskStore] Reverb event: taskAssignee.removed", { task_id: event.task_id, developer_id: event.developer_id });
        const idx = allTasks.value.findIndex((t) => t.id === event.task_id);
        if (idx !== -1) {
          const task = allTasks.value[idx];
          if (Array.isArray(task.assigneeIds)) {
            task.assigneeIds = task.assigneeIds.filter(
              (id) => id !== event.developer_id,
            );
          }
          if (Array.isArray(task.assignees)) {
            task.assignees = task.assignees.filter(
              (dev) => dev.id !== event.developer_id,
            );
          }

          // Force reactivity
          allTasks.value[idx] = { ...task };
          allTasks.value = [...allTasks.value];
        console.log("[TaskStore] Assignee removed from task");
      }
    });
  }

  //INIT REVERB IF GAMITON ANG STORE
  initReverbListeners();

  const isDataLoaded = ref(false); // Track if data has been loaded
  const lastFetchedProjectId = ref(null); // Track which project was last fetched

  //FETCH TASKS ASSIGNEE - only fetch if needed
  async function fetchTasks(page = 1, force = false) {
    if (!currentProjectId.value) return;
    
    // Skip if already loaded for this project and not forced
    if (isDataLoaded.value && 
        lastFetchedProjectId.value === currentProjectId.value && 
        !force) {
      console.log('[TaskStore] Tasks already loaded for project', currentProjectId.value);
      return;
    }
    
    loading.value = true;
    try {
      const sessionToken = localStorage.getItem("sessionToken");
      const response = await api.get(
        `/tasks/project/${currentProjectId.value}?page=1&limit=100`,
        { headers: { "x-session-token": sessionToken } },
      );

      const { tasks } = response.data;

      allTasks.value = tasks.map(task => ({
        ...task,
        assignees: task.assignees || []
      }));
      
      currentPage.value = 1;
      isDataLoaded.value = true;
      lastFetchedProjectId.value = currentProjectId.value;
    } finally {
      loading.value = false;
    }
  }

  // TASK FILTERS
  const filteredTasks = computed(() => {
    let tasks = allTasks.value;

    // SEARCH
    if (searchQuery.value) {
      const search = searchQuery.value.toLowerCase();
      tasks = tasks.filter((t) => {
        const textMatch =
          t.title.toLowerCase().includes(search) ||
          (t.description && t.description.toLowerCase().includes(search));

        // SEARCH BY ASSIGNEE NAME
        let assigneeMatch = false;
        if (t.assigneeIds && Array.isArray(t.assigneeIds)) {
          const assignedDevelopers = developerStore.getDevelopersByIds(
            t.assigneeIds,
          );
          assigneeMatch = assignedDevelopers.some((dev) =>
            dev.name.toLowerCase().includes(search),
          );
        }

        const legacyAssigneeMatch =
          t.assignee && t.assignee.toLowerCase().includes(search);

        return textMatch || assigneeMatch || legacyAssigneeMatch;
      });
    }
    // PHASE
    if (selectedPhase.value !== "Overall") {
      tasks = tasks.filter((t) => t.phase === selectedPhase.value);
    }
    // STATUS
    if (statusFilter.value) {
      tasks = tasks.filter((t) => t.status === statusFilter.value);
    }

    // CATEGORY
    if (categoryFilter.value) {
      tasks = tasks.filter((t) => t.weight === categoryFilter.value);
    }
    return tasks;
  });

  // Task statistics based on filtered tasks
  const taskStats = computed(() => {
    const tasks = filteredTasks.value;
    if (!tasks.length) {
      return {
        totalTasks: 0,
        light: 0,
        medium: 0,
        heavy: 0,
        completed: 0,
        validated: 0,
        inprogress: 0,
        pending: 0,
        totalPoints: 0,
        completedPoints: 0,
        completedAndValidated: 0,
        percent: 0,
        percentDisplay: "0.0",
      };
    }

    const stats = {
      totalTasks: tasks.length,
      light: 0,
      medium: 0,
      heavy: 0,
      completed: 0,
      validated: 0,
      inprogress: 0,
      pending: 0,
      totalPoints: 0,
      completedPoints: 0,
    };

    tasks.forEach((t) => {
      // Weight counts
      if (t.weight === "light") stats.light += 1;
      if (t.weight === "medium") stats.medium += 1;
      if (t.weight === "heavy") stats.heavy += 1;

      // Status counts
      if (t.status === TASK_STATUSES.COMPLETED) stats.completed += 1;
      if (t.status === TASK_STATUSES.VALIDATED) stats.validated += 1;
      if (t.status === TASK_STATUSES.IN_PROGRESS) stats.inprogress += 1;
      if (t.status === TASK_STATUSES.PENDING) stats.pending += 1;
      const weight = WEIGHT_POINTS[t.weight] || 1;
      stats.totalPoints += weight;
      if (t.status === TASK_STATUSES.COMPLETED || t.status === TASK_STATUSES.VALIDATED) stats.completedPoints += weight;
    });

    stats.percent =
      stats.totalPoints === 0
        ? 0
        : (stats.completedPoints / stats.totalPoints) * 100;
    stats.percentDisplay = stats.percent.toFixed(1);
    
    //COMPLETED AND VALIDATED COUNT AS DONE
    stats.completedAndValidated = stats.completed + stats.validated;

    return stats;
  });

  ////////////////////////// CRUD ///////////////////////////////////

  // ADD
  async function addTask(task) {
    const sessionToken = localStorage.getItem("sessionToken");
    const plainTask = JSON.parse(JSON.stringify(toRaw(task)));

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    plainTask.startDate = formatDateForAPI(plainTask.startDate) || today;
    plainTask.targetDate = formatDateForAPI(plainTask.targetDate) || today;

    if (plainTask.endDate) {
      plainTask.endDate = formatDateForAPI(plainTask.endDate);
    } else {
      delete plainTask.endDate;
    }

    // Ensure project_id is set before sending
    if (!plainTask.project_id) {
      plainTask.project_id = currentProjectId.value;
    }

    try {
      console.log('[TaskStore] Adding task:', plainTask);

      const response = await api.post(
        "/tasks",
        plainTask,
        {
          headers: {
            "x-session-token": sessionToken,
            "Content-Type": "application/json",
          },
        },
      );

      console.log('[TaskStore] Task created:', response.data);
      const taskId = response?.data?.id;

      // Note: Assignees are handled by backend via assigneeIds in the request
      // No need for separate API calls
      return response.data;
    } catch (err) {
      console.error("ADD TASK ERROR:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
      }
      throw err;
    }
  }

  async function updateTask(taskId, patch) {
    const sessionToken = localStorage.getItem("sessionToken");

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const updatedPatch = { ...patch };

    updatedPatch.startDate = formatDateForAPI(updatedPatch.startDate) || today;
    updatedPatch.targetDate = formatDateForAPI(updatedPatch.targetDate) || today;

    if (updatedPatch.endDate) {
      updatedPatch.endDate = formatDateForAPI(updatedPatch.endDate);
    } else {
      delete updatedPatch.endDate;
    }

    const idx = allTasks.value.findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      allTasks.value[idx] = { ...allTasks.value[idx], ...updatedPatch };
      allTasks.value = [...allTasks.value];
    }

    const response = await api.put(`/tasks/${taskId}`, updatedPatch, {
      headers: {
        "x-session-token": sessionToken,
      },
    });

    return response;
  }

  //DELETE
  function deleteTask(taskId) {
    const sessionToken = localStorage.getItem("sessionToken");
    return api.delete(`/tasks/${taskId}`, {
      headers: {
        "x-session-token": sessionToken,
      },
    });
  }

  // UPDATE WITH ASSIGNEES
  async function updateTaskWithAssignees(taskId, patch) {
    const sessionToken = localStorage.getItem("sessionToken");
    const plainPatch = JSON.parse(JSON.stringify(toRaw(patch)));
    delete plainPatch.id;
    delete plainPatch.project_id;
    delete plainPatch.assignees;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    plainPatch.startDate = formatDateForAPI(plainPatch.startDate) || today;
    plainPatch.targetDate = formatDateForAPI(plainPatch.targetDate) || today;
    if (plainPatch.endDate) {
      plainPatch.endDate = formatDateForAPI(plainPatch.endDate);
    } else {
      delete plainPatch.endDate;
    }

    console.log("SENDING UPDATE REQUEST:", {
      taskId,
      plainPatch,
    });

    //UPDATE TASK
    const taskResponse = await api.put(`/tasks/${taskId}`, plainPatch, {
      headers: {
        "x-session-token": sessionToken,
      },
    });
    //GET CURRENT USER
    const currentAssigneesRes = await api.get(`/task-assignees/${taskId}`, {
      headers: { "x-session-token": sessionToken },
    });
    // Handle paginated response
    const currentAssignees = currentAssigneesRes.data.assignees || currentAssigneesRes.data || [];
    const currentIds = currentAssignees.map((dev) => dev.id);
    //IF ADD OR REMOVE
    const newIds = patch.assigneeIds || [];
    const toAdd = newIds.filter((id) => !currentIds.includes(id));
    const toRemove = currentIds.filter((id) => !newIds.includes(id));
    //REMOVE
    for (const developerId of toRemove) {
      await api.delete(`/task-assignees/${taskId}/${developerId}`, {
        headers: { "x-session-token": sessionToken },
      });
    }
    //ADD
    for (const developerId of toAdd) {
      await api.post(
        "/task-assignees",
        { task_id: taskId, developer_id: developerId },
        {
          headers: { "x-session-token": sessionToken },
        },
      );
    }
    const taskIndex = allTasks.value.findIndex((t) => t.id === taskId);
    if (taskIndex !== -1) {
      const updatedAssigneesRes = await api.get(`/task-assignees/${taskId}`, {
        headers: { "x-session-token": sessionToken },
      });
      // Handle paginated response
      const updatedAssignees = updatedAssigneesRes.data.assignees || updatedAssigneesRes.data || [];

      allTasks.value[taskIndex] = {
        ...allTasks.value[taskIndex],
        ...patch,
        assignees: updatedAssignees,
        assigneeIds: newIds,
      };
    }

    return taskResponse;
  }

  // Client-side pagination for filtered tasks
  const displayTasks = computed(() => {
    const filtered = filteredTasks.value;
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filtered.slice(start, end);
  });

  const pagination = computed(() => {
    const filtered = filteredTasks.value;
    const total = filtered.length;
    const pages = Math.ceil(total / pageSize.value);

    return {
      page: currentPage.value,
      pageSize: pageSize.value,
      totalItems: total,
      totalPages: pages || 1,
    };
  });

  return {
    searchQuery,
    statusFilter,
    categoryFilter,
    selectedPhase,
    allTasks,
    filteredTasks,
    displayTasks,
    taskStats,
    loading,
    currentPage,
    pageSize,
    totalTasks,
    totalPages: computed(() => pagination.value.totalPages),
    pagination,
    initReverbListeners,
    updateTaskWithAssignees,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  };
});

