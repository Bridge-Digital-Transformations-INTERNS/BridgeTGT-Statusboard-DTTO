<template>
  <div class="border-t border-gray-200/50">
    <!-- Header -->
    <div class="px-6 py-3 bg-gray-50/50 flex items-center justify-between">
      <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
        <Icon icon="basil:folder-open-solid" width="20" height="20" />
        Your Projects
      </h4>
      <span class="text-xs text-gray-400 bg-gray-200/50 px-2 py-1 rounded-full">
        {{ projects.length }}
      </span>
    </div>

    <!-- Projects List -->
    <div class="max-h-80 overflow-y-auto">
      <div
        v-for="project in projects"
        :key="project.id"
        @click="handleSelectProject(project)"
        class="group mx-4 my-1 p-3 rounded-xl cursor-pointer transition-all duration-200"
        :class="{
          'bg-[var(--color-palm)]/15': selectedProject?.id === project.id,
          'hover:bg-gray-50/50 hover:border-gray-200/50 border border-transparent': true,
        }"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2 flex-1 min-w-0">
            <div
              class="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
            >
              <Icon
                icon="material-symbols:folder-outline"
                width="16"
                height="16"
                :class="selectedProject?.id === project.id ? 'text-[var(--color-palm)]' : 'text-gray-600'"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-medium truncate"
                :class="selectedProject?.id === project.id
                  ? 'text-[var(--color-palm)]'
                  : 'text-gray-900 group-hover:text-gray-700'"
              >
                {{ project.name }}
              </p>
              <p v-if="selectedProject?.id === project.id" class="text-xs text-[var(--color-palm)] font-semibold">
                Current Project
              </p>
              <p v-else class="text-xs text-gray-500">Click to select</p>
            </div>
          </div>

          <!-- Edit/Delete Buttons -->
          <div class="flex justify-center items-center space-x-1 opacity-0 group-hover:opacity-100 h-full">
            <button
              @click.stop="handleEditClick(project)"
              class="flex items-center justify-center text-right cursor-pointer w-8 h-8 bg-blue-500/10 hover:bg-blue-500/20 text-gray-700 rounded-lg"
            >
              <Icon icon="iconoir:edit-pencil" width="16" height="16" />
            </button>
            <button
              @click.stop="handleDeleteClick(project)"
              class="flex items-center justify-center cursor-pointer w-8 h-8 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg"
            >
              <Icon icon="lucide:trash-2" width="16" height="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="projects.length === 0" class="flex flex-col items-center py-12 text-center">
        <Icon icon="material-symbols:folder-off-outline" width="32" height="32" class="text-gray-400 mb-4" />
        <h4 class="text-sm font-medium text-gray-900 mb-1">No projects yet</h4>
        <p class="text-xs text-gray-500 mb-4">Create your first project to get started</p>
        <button
          @click="handleCreateClick"
          class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-palm)] to-[var(--color-lime)] text-white text-xs font-medium rounded-lg"
        >
          <Icon icon="material-symbols:add" width="14" height="14" />
          Create Project
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const props = defineProps({
  projects: { type: Array, default: () => [] },
  selectedProject: { type: Object, default: null },
});

const emit = defineEmits(["selectProject", "openProject", "deleteProject"]);

function handleSelectProject(project) {
  emit("selectProject", project);
}

function handleEditClick(project) {
  emit("openProject", true, project);
}

function handleDeleteClick(project) {
  emit("deleteProject", project);
}

function handleCreateClick() {
  emit("openProject", false);
}
</script>