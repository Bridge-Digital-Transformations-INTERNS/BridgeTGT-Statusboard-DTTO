import { defineStore } from "pinia";
import api from "@/utils/api";
import { ref, computed } from "vue";
import socket from "@/utils/socket";

export const useProjectStore = defineStore("project", () => {
  const projects = ref([]);
  const selectedProjectId = ref(1);
  const loading = ref(false);
  
  function setSelectedProject(id) {
    selectedProjectId.value = id;
    localStorage.setItem("selectedProjectId", id);
  }

  function restoreSelectedProject() {
    const savedId = localStorage.getItem("selectedProjectId");
    if (savedId) {
      selectedProjectId.value = Number(savedId);
    }
  }

  //SOCKET
  function initSocketListeners() {
    socket.on("project:created", (project) => {
      const exists = projects.value.some((p) => p.id === project.id);
      if (!exists) {
        projects.value.push(project);
      }
    });

    socket.on("project:updated", (updated) => {
      const idx = projects.value.findIndex((t) => t.id === updated.id);
      if (idx !== -1) projects.value[idx] = { ...projects.value[idx], ...updated };
    });

    socket.on("project:deleted", ({ id }) => {
      projects.value = projects.value.filter((t) => t.id !== id);
    });
  }

  function removeSocketListeners() {
    socket.off("project:created");
    socket.off("project:updated");
    socket.off("project:deleted");
  }

  initSocketListeners();

  if (import.meta.hot) {
    import.meta.hot.accept(() => {
      removeSocketListeners();
    });
  }

  // FETCH PROJECTS
  async function fetchProjects() {
    loading.value = true;
    try {
      const response = await api.get("/projects");
      projects.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  // FETCH PROJECT BY ID
  async function fetchProjectById(id) {
    loading.value = true;
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } finally {
      loading.value = false;
    }
  }

  const selectedProject = computed(() =>
    projects.value.find((p) => p.id === selectedProjectId.value),
  );

  // Project CRUD operations

  // ADD
  async function addProject(name) {
    const sessionToken = localStorage.getItem("sessionToken");
    const response = await api.post(
      "/projects",
      { name },
      {
        headers: {
          "x-session-token": sessionToken,
        },
      },
    );
    
    // Add the new project to the local state
    const newProject = response.data;
    const exists = projects.value.some((p) => p.id === newProject.id);
    if (!exists) {
      projects.value.push(newProject);
    }
    
    return newProject;
  }

  // UPDATE
  async function updateProject(id, data) {
    const sessionToken = localStorage.getItem("sessionToken");
    try {
      const response = await api.put(
        `/projects/${id}`,
        data,
        {
          headers: {
            "x-session-token": sessionToken,
          },
        },
      );
      
      // Update the local state
      const updatedProject = response.data;
      const idx = projects.value.findIndex((p) => p.id === id);
      if (idx !== -1) {
        projects.value[idx] = { ...projects.value[idx], ...updatedProject };
      }
      
      return updatedProject;
    } catch (error) {
      console.error("Update project error:", error);
      throw error;
    }
  }

  //DELETE
  async function deleteProject(id) {
    const sessionToken = localStorage.getItem("sessionToken");
    try {
      await api.delete(`/projects/${id}`, {
        headers: {
          "x-session-token": sessionToken,
        },
      });
      
      // Remove from local state
      projects.value = projects.value.filter((p) => p.id !== id);
    } catch (error) {
      console.error("Delete project error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Status:", error.response.status);
        console.error("Headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    }
  }

  return {
    projects,
    selectedProjectId,
    selectedProject,
    loading,
    setSelectedProject,
    restoreSelectedProject,
    fetchProjects,
    fetchProjectById,
    addProject,
    updateProject,
    deleteProject,
  };
});