import { defineStore } from "pinia";
import api from "@/utils/api";
import { ref, computed } from "vue";
import { AVAILABLE_ROLES, AVAILABLE_COLORS } from "@/constants/common";
import { getInitials } from "@/utils/ui";
import echo from "@/utils/reverb";
import { onMounted } from "vue";

export const useDeveloperStore = defineStore("developer", () => {
  const developers = ref([]);
  const availableRoles = ref([...AVAILABLE_ROLES]);
  const availableColors = ref([...AVAILABLE_COLORS]);
  const loading = ref(false);
  const isDataLoaded = ref(false); // Track if data has been loaded
  const developerOptions = computed(() =>
    developers.value.map((dev) => ({
      value: dev.id,
      label: dev.name,
      color: dev.color,
      roles: dev.roles,
    })),
  );

  //REVERB
  function initReverbListeners() {
    echo.channel('developers')
      .listen('.developer.created', (event) => {
        console.log('[DeveloperStore] Developer created event:', event);
        const exists = developers.value.some((d) => d.id === event.developer.id);
        if (!exists) {
          developers.value = [...developers.value, event.developer];
        }
      })
      .listen('.developer.updated', (event) => {
        console.log('[DeveloperStore] Developer updated event:', event);
        const idx = developers.value.findIndex((t) => t.id === event.developer.id);
        if (idx !== -1) {
          developers.value[idx] = { ...developers.value[idx], ...event.developer };
          developers.value = [...developers.value];
        }
      })
      .listen('.developer.deleted', (event) => {
        console.log('[DeveloperStore] Developer deleted event:', event);
        developers.value = developers.value.filter((t) => t.id !== event.id);
      })
      .listen('.developer.roleAssigned', (event) => {
        console.log('[DeveloperStore] Role assigned event:', event);
        const dev = developers.value.find((d) => d.id === event.developer_id);
        if (dev) {
          if (!dev.roles) dev.roles = [];
          if (!dev.roles.includes(event.role_name)) {
            dev.roles = [...dev.roles, event.role_name];
          }
        }
      })
      .listen('.developer.roleRemoved', (event) => {
        console.log('[DeveloperStore] Role removed event:', event);
        const dev = developers.value.find((d) => d.id === event.developer_id);
        if (dev && dev.roles) {
          dev.roles = dev.roles.filter((r) => r !== event.role_name);
        }
      });
  }
  //INIT REVERB IF GAMITON ANG STORE
  initReverbListeners();

  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  // FETCH ALL DEVELOPERS - only fetch if not already loaded
  async function fetchDevelopers(page = 1, pageSize = 10, force = false) {
    if (isDataLoaded.value && !force) {
      console.log('[DeveloperStore] Developers already loaded, skipping fetch');
      return;
    }
    
    loading.value = true;
    try {
      // Fetch all developers with roles in ONE request (optimized!)
      const response = await api.get(`/developers?page=1&pageSize=10000`);
      // Backend now returns developers with roles already included
      developers.value = response.data.data;
      isDataLoaded.value = true;

      // Update pagination
      pagination.value.page = page;
      pagination.value.pageSize = pageSize;
      pagination.value.total = developers.value.length;
      pagination.value.totalPages = Math.ceil(developers.value.length / pageSize);

      // No need for individual API calls - roles are already included!
      // Each developer.roles is already an array of role names
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
