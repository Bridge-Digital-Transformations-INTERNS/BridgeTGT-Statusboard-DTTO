<template>
  <div class="flex items-center gap-3">
    <button
      @click="$emit('back')"
      class="p-2 text-gray-600 cursor-pointer hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
      title="Back to Dashboard"
    >
      <Icon icon="lucide:chevron-left" width="24" height="24" />
    </button>
  
    <div class="h-6 w-px bg-gray-300"></div>
    
    <div class="relative" ref="dropdownRef">
      <button
        @click="showDropdown = !showDropdown"
        class="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-all cursor-pointer"
      >
        <span class="text-2xl font-bold text-[var(--color-palm)]">
          {{ selectedProject?.name || 'Select Project' }}
        </span>
        <Icon 
          icon="lucide:chevron-down" 
          width="18" 
          height="18" 
          class="text-gray-500 transition-transform"
          :class="{ 'rotate-180': showDropdown }"
        />
      </button>
      
      <div
        v-if="showDropdown"
        class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[250px] max-h-[300px] overflow-y-auto"
      >
        <button
          v-for="project in projects"
          :key="project.id"
          @click="selectProject(project.id)"
          class="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between"
          :class="{ 'bg-blue-50': selectedProjectId === project.id }"
        >
          <span class="text-sm font-medium text-gray-900">{{ project.name }}</span>
          <Icon 
            v-if="selectedProjectId === project.id"
            icon="lucide:check" 
            width="16" 
            height="16" 
            class="text-[var(--color-palm)]"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Icon } from '@iconify/vue';

defineProps({
  projects: {
    type: Array,
    required: true
  },
  selectedProject: {
    type: Object,
    default: null
  },
  selectedProjectId: {
    type: [Number, null],
    default: null
  }
});

const emit = defineEmits(['back', 'select-project']);
const showDropdown = ref(false);

function selectProject(projectId) {
  emit('select-project', projectId);
  showDropdown.value = false;
}
</script>
