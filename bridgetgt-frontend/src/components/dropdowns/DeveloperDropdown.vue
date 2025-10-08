<template>
  <div class="relative">
    <BaseDropdown
      v-model="internalSelection"
      :options="dropdownOptions"
      placeholder="Select developers..."
      :option-value="'value'"
      :option-label="'label'"
      :option-description="'description'"
      :option-icon="(opt) => opt.avatar"
      :option-icon-class="(opt) => opt.avatar.color"
      multiple
    >
      <!-- Custom slot for rendering selected items inside input -->
      <template #selected>
        <div class="flex flex-wrap gap-1">
          <div
            v-for="developer in selectedDevelopers"
            :key="developer.id"
            class="inline-flex items-center gap-1.5 pl-1 pr-2 py-1 text-xs rounded-full text-white"
            :style="{ backgroundColor: developer.color }"
          >
            <div
              class="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden"
              :style="{ backgroundColor: developer.color }"
            >
              <img
                v-if="developer.profile_picture"
                :src="developer.profile_picture"
                :alt="developer.name"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-[10px] font-semibold">{{ developerStore.getInitials(developer.name) }}</span>
            </div>
            <span>{{ developer.name }}</span>
            <button
              @click.stop="removeDeveloper(developer.id)"
              class="hover:bg-slate-600 cursor-pointer hover:bg-opacity-20 rounded-full p-0.5"
            >
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </template>
    </BaseDropdown>
  </div>
</template>

<script setup>
import { computed } from "vue";
import BaseDropdown from "@/components/dropdowns/BaseDropdown.vue";
import { useDeveloperStore } from "@/stores/developerStore";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "Select developers...",
  },
});

const emit = defineEmits(["update:modelValue"]);

const developerStore = useDeveloperStore();
// const selectedOption = ref("");

// Get selected developers with full details
const selectedDevelopers = computed(() => {
  return developerStore.getDevelopersByIds(props.modelValue);
});

// Get available options (excluding already selected)
const dropdownOptions = computed(() => {
  const availableDevelopers = developerStore.developers.filter(
    (dev) => !props.modelValue.includes(dev.id),
  );

  return availableDevelopers.map((dev) => ({
    value: dev.id,
    label: dev.name,
    description: Array.isArray(dev.roles) ? dev.roles.join(", ") : "",
    avatar: {
      initials: developerStore.getInitials(dev.name),
      color: dev.color,
      profile_picture: dev.profile_picture,
    },
  }));
});

// function handleSelection(developerId) {
//   if (developerId && !props.modelValue.includes(developerId)) {
//     const newSelection = [...props.modelValue, developerId];
//     emit("update:modelValue", newSelection);
//   }
//   selectedOption.value = "";
// }
const internalSelection = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

function removeDeveloper(developerId) {
  const newSelection = props.modelValue.filter((id) => id !== developerId);
  emit("update:modelValue", newSelection);
}
</script>

