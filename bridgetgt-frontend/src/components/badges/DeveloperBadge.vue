<template>
  <div class="flex flex-wrap gap-1">
    <div class="flex -space-x-2">
      <div
        v-for="dev in displayedDevelopers"
        :key="dev.id || dev.session_id"
        class="relative group/dev"
      >
        <div
          class="relative w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium cursor-pointer transition-all duration-200 overflow-hidden"
          :class="
            showOnline && dev.isOnline ? 'ring-1 ' : 'border-2 border-white'
          "
          :style="{
            backgroundColor: dev.color || dev.avatar_color || '#000000',
          }"
        >
          <!-- Avatar -->
          <img
            v-if="dev.profile_picture || dev.avatar_url"
            :src="dev.profile_picture || dev.avatar_url"
            :alt="dev.name || dev.username"
            class="w-full h-full object-cover"
          />
          <span v-else>{{ getInitials(dev.name || dev.username) }}</span>
        </div>

        <!-- Individual Tooltip - Only show name -->
        <div
          class="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover/dev:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 shadow-lg pointer-events-none"
        >
          {{ dev.name || dev.username }}
        </div>
      </div>

      <!-- Extra count -->
      <div
        v-if="extraCount > 0"
        class="relative flex items-center justify-center w-8 h-8 text-xs rounded-full bg-gray-500 text-white cursor-pointer group/extra border-2 border-white"
      >
        <span>+{{ extraCount }}</span>

        <div
          class="absolute transition-all duration-200 top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover/extra:flex flex-col bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 shadow-lg pointer-events-none"
        >
          <div
            v-for="dev in extraDevelopers"
            :key="dev.id || dev.session_id"
            class="py-0.5"
          >
            {{ dev.name || dev.username }}
          </div>
        </div>
      </div>
    </div>

    <span v-if="developers.length === 0" class="text-slate-400 text-xs italic">
      {{ emptyMessage }}
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useDeveloperStore } from "@/stores/developerStore";
import { getInitials } from "@/utils/ui";

const props = defineProps({
  developerIds: { type: Array, default: () => [] },
  developersData: { type: Array, default: () => [] },
  emptyMessage: { type: String, default: "Unassigned" },
  showOnline: { type: Boolean, default: false },
  maxVisible: { type: Number, default: 5 },
});

const developerStore = useDeveloperStore();

const developers = computed(() => {
  if (props.developersData.length) return props.developersData;

  return props.developerIds
    .map((id) => {
      if (typeof id === "object" && id.id) return id;
      return developerStore.getDeveloperById(id);
    })
    .filter(Boolean);
});
const displayedDevelopers = computed(() => developers.value.slice(0, props.maxVisible));
const extraDevelopers = computed(() => developers.value.slice(props.maxVisible));
const extraCount = computed(() => Math.max(developers.value.length - props.maxVisible, 0));
</script>

