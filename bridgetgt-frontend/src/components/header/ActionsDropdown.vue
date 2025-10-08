<template>
  <!-- Bind rootRef here -->
  <div class="relative" ref="rootRef">
    <button
      @click="toggle"
      class="group relative overflow-hidden bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm hover:shadow-md transition-all duration-300 ease-out cursor-pointer"
      :class="{ 'ring-2 ring-blue-500/20 border-blue-300': show }"
    >
      <div class="flex items-center gap-2">
        <Icon
          icon="material-symbols:dashboard-customize-outline"
          width="18"
          height="18"
          class="text-gray-600 group-hover:text-gray-700"
        />
        <span
          class="text-sm font-medium text-gray-700 group-hover:text-gray-900"
        >
          Actions
        </span>
      </div>
      <Icon
        icon="material-symbols:keyboard-arrow-down-rounded"
        width="20"
        height="20"
        class="text-gray-400 transition-transform duration-300"
        :class="{ 'rotate-180': show }"
      />
    </button>

    <transition name="dropdown-slide">
      <div v-if="show" class="absolute right-0 mt-3 w-96 z-50">
        <div
          class="bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl overflow-hidden"
        >
          <!-- Header -->
          <div
            class="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 border-b border-gray-200/50"
          >
            <h3
              class="text-sm font-semibold text-gray-900 flex items-center gap-2"
            >
              <Icon
                icon="material-symbols:dashboard-customize-outline"
                width="16"
                height="16"
                class="text-gray-600"
              />
              Quick Actions
            </h3>
          </div>

          <!-- Quick Actions -->
          <div class="p-4 space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <!-- Developer -->
              <button
                @click="handleNavigateDeveloper"
                class="cursor-pointer group bg-gradient-to-br from-indigo-50 to-indigo-100/50 hover:from-indigo-100 hover:to-indigo-200/50 border border-indigo-200/50 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                <div class="flex flex-col items-center text-center space-y-2">
                  <div
                    class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110"
                  >
                    <Icon
                      icon="material-symbols:group-outline"
                      width="20"
                      height="20"
                      class="text-white"
                    />
                  </div>
                  <span class="text-sm font-medium text-indigo-900">Developer</span>
                  <span class="text-xs text-indigo-600">Manage developers</span>
                </div>
              </button>

              <!-- New Project -->
              <button
                @click="handleOpenNewProject"
                class="cursor-pointer group bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-200/50 border border-emerald-200/50 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                <div class="flex flex-col items-center text-center space-y-2">
                  <div
                    class="w-10 h-10 bg-[var(--color-palm)] rounded-xl flex items-center justify-center group-hover:scale-110"
                  >
                    <Icon
                      icon="material-symbols:create-new-folder-outline"
                      width="20"
                      height="20"
                      class="text-white"
                    />
                  </div>
                  <span class="text-sm font-medium text-emerald-900"
                    >New Project</span
                  >
                  <span class="text-xs text-emerald-600">Create workspace</span>
                </div>
              </button>
            </div>
          </div>

          <ProjectList
            :projects="projects"
            :selectedProject="selectedProject"
            @selectProject="handleSelectProject"
            @openProject="handleOpenProject"
            @deleteProject="handleDeleteProject"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import ProjectList from "@/components/ui/ProjectList.vue";

defineProps({
  projects: { type: Array, default: () => [] },
  selectedProject: { type: Object, default: null },
});

const emit = defineEmits(["selectProject", "openProject", "deleteProject", "navigateDeveloper"]);

const show = ref(false);
const rootRef = ref(null);

function toggle() {
  show.value = !show.value;
}

function close() {
  show.value = false;
}
function handleSelectProject(project) {
  emit("selectProject", project);
  close();
}

function handleOpenProject(isEdit, project) {
  emit("openProject", isEdit, project);
  close();
}

function handleDeleteProject(project) {
  emit("deleteProject", project);
  close();
}

function handleNavigateDeveloper() {
  emit("navigateDeveloper");
  close();
}

function handleOpenNewProject() {
  emit("openProject", false);
  close();
}

defineExpose({
  $el: rootRef,
  close,
});
</script>