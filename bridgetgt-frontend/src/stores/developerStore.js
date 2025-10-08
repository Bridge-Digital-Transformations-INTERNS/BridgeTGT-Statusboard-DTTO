import { defineStore } from "pinia";
import api from "@/utils/api";
import { ref, computed } from "vue";
import { AVAILABLE_ROLES, AVAILABLE_COLORS } from "@/constants/common";
import { getInitials } from "@/utils/ui";
import socket from "@/utils/socket";
import { onMounted } from "vue";

export const useDeveloperStore = defineStore("developer", () => {
  const developers = ref([]);
  const availableRoles = ref([...AVAILABLE_ROLES]);
  const availableColors = ref([...AVAILABLE_COLORS]);
  const loading = ref(false);
  const developerOptions = computed(() =>
    developers.value.map((dev) => ({
      value: dev.id,
      label: dev.name,
      color: dev.color,
      roles: dev.roles,
    })),
  );

  //SOCKET
  function initSocketListeners() {
    socket.on("developer:created", (task) => {
      developers.value.push(task);
    });

    socket.on("developer:updated", (updated) => {
      const idx = developers.value.findIndex((t) => t.id === updated.id);
      if (idx !== -1) developers.value[idx] = { ...developers.value[idx], ...updated };
    });

    socket.on("developer:deleted", ({ id }) => {
      developers.value = developers.value.filter((t) => t.id !== id);
    });
    socket.on("developer:roleAssigned", ({ developer_id, role_name }) => {
      const dev = developers.value.find((d) => d.id === developer_id);
      if (dev) {
        if (!dev.roles) dev.roles = [];
        if (!dev.roles.includes(role_name)) {
          dev.roles.push(role_name);
        }
      }
    });

    socket.on("developer:roleRemoved", ({ developer_id, role_name }) => {
      const dev = developers.value.find((d) => d.id === developer_id);
      if (dev && dev.roles) {
        dev.roles = dev.roles.filter((r) => r !== role_name);
      }
    });
  }
  //INIT SOCKET IF GAMITON ANG STORE
  onMounted(() => {
    initSocketListeners();
  });
  // onUnmounted(() => {
  //   socket.off("developer:created");
  //   socket.off("developer:updated");
  //   socket.off("developer:deleted");

  // });

  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  // FETCH ALL DEVELOPERS (without backend pagination for proper client-side filtering)
  async function fetchDevelopers(page = 1, pageSize = 10) {
    loading.value = true;
    try {
      // Fetch all developers with a large limit
      const response = await api.get(`/developers?page=1&pageSize=10000`);
      developers.value = response.data.data;

      // Update pagination
      pagination.value.page = page;
      pagination.value.pageSize = pageSize;
      pagination.value.total = developers.value.length;
      pagination.value.totalPages = Math.ceil(developers.value.length / pageSize);

      await Promise.all(
        developers.value.map(async (dev) => {
          try {
            const rolesRes = await api.get(`/developer-roles/${dev.id}`);
            dev.roles = Array.isArray(rolesRes.data) ? rolesRes.data.map((r) => r.name || r) : [];
          } catch {
            dev.roles = [];
          }
        })
      );
    } finally {
      loading.value = false;
    }
  }

  //////////////////////////// CRUD ////////////////////////////////////////////////////

  //FETCH ROLES
  async function fetchRoles() {
    const response = await api.get("/roles");
    availableRoles.value = response.data;
  }

  //ADD
  async function addDeveloper(dev) {
    const sessionToken = localStorage.getItem("sessionToken");
    return api.post("/developers", dev, {
      headers: {
        "x-session-token": sessionToken,
      },
    });
  }

  //UPDATE
  async function updateDeveloper(id, patch) {
    const sessionToken = localStorage.getItem("sessionToken");
    return api.put(`/developers/${id}`, patch, {
      headers: {
        "x-session-token": sessionToken,
      },
    });
  }

  //DELETE
  async function deleteDeveloper(id) {
    const sessionToken = localStorage.getItem("sessionToken");
    return api.delete(`/developers/${id}`, {
      headers: {
        "x-session-token": sessionToken,
      },
    });
  }

  //ADD ROLE
  async function assignRoleToDeveloper(developer_id, role_id) {
    const sessionToken = localStorage.getItem("sessionToken");
    await api.post(
      "/developer-roles",
      { developer_id, role_id },
      {
        headers: { "x-session-token": sessionToken },
      },
    );

    const dev = developers.value.find((d) => d.id === developer_id);
    const roleObj = availableRoles.value.find((r) => r.id === role_id);
    if (dev && roleObj && !dev.roles.includes(roleObj.name)) {
      dev.roles.push(roleObj.name);
    }
  }

  //DELETE ROLE
  async function removeRoleFromDeveloper(developer_id, role_id) {
    const sessionToken = localStorage.getItem("sessionToken");
    await api.delete("/developer-roles", {
      headers: { "x-session-token": sessionToken },
      data: { developer_id, role_id },
    });

    const dev = developers.value.find((d) => d.id === developer_id);
    const roleObj = availableRoles.value.find((r) => r.id === role_id);
    if (dev && roleObj) {
      dev.roles = dev.roles.filter((r) => r !== roleObj.name);
    }
  }
  //FETCH DEVELOPER BY ID
  function getDeveloperById(id) {
    return developers.value.find((dev) => dev.id === id);
  }

  function getDevelopersByIds(ids) {
    return developers.value.filter((dev) => ids.includes(dev.id));
  }

  return {
    developers,
    availableRoles,
    availableColors,
    developerOptions,
    loading,
    pagination,
    fetchDevelopers,
    fetchRoles,
    addDeveloper,
    updateDeveloper,
    deleteDeveloper,
    assignRoleToDeveloper,
    removeRoleFromDeveloper,
    getDeveloperById,
    getDevelopersByIds,
    getInitials,
  };
});
