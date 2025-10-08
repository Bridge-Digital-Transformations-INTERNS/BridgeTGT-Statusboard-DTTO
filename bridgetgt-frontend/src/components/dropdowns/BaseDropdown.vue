<template>
  <div class="relative" ref="dropdownContainer">
    <button
      @click="toggleDropdown"
      :disabled="disabled"
      :class="[
        'w-full relative px-3 py-3 text-left bg-white border rounded-lg text-sm transition-all duration-200',
        'hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300',
        disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'cursor-pointer',
        error ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : 'border-slate-200',
        triggerClass,
      ]"
    >
      <div class="flex items-center justify-between">
          <span
            v-if="(!Array.isArray(props.modelValue) && !props.modelValue) || (Array.isArray(props.modelValue) && props.modelValue.length === 0)"
            class="block truncate text-slate-400"
          >
            {{ placeholder || "Select option..." }}
          </span>
          <slot
            v-else-if="$slots.selected"
            name="selected"
            :selectedOptions="props.options.filter((opt) => isSelected(opt))"
          />
          <span v-else class="block truncate text-slate-700">
            {{ selectedLabel }}
          </span>
        <svg
          class="w-4 h-4 text-slate-400 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </button>

    <div v-if="error" class="text-red-500 text-xs mt-1">
      {{ error }}
    </div>

    <!-- Dropdown menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        ref="dropdownMenu"
        :class="[
          'absolute left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden p-2',
          dropdownPosition === 'above' ? 'bottom-full mb-1' : 'top-full mt-1',
          menuClass,
        ]"
      >
        <div v-if="searchable" class="p-2 border-b border-slate-100">
          <div class="relative">
            <svg
              class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Search options..."
              class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300"
              @click.stop
            />
          </div>
        </div>
        <div :class="['py-1 max-h-60 overflow-y-auto', optionsClass]">
          <div
            v-if="filteredOptions.length === 0"
            class="px-3 py-2 text-sm text-slate-500 text-center"
          >
            {{ searchQuery ? "No options found" : "No options available" }}
          </div>

          <!-- Options -->
          <button
            v-for="option in filteredOptions"
            :key="getOptionValue(option)"
            @click="selectOption(option)"
            :class="[
              'w-full text-left px-3 py-2 text-sm transition-colors duration-150',
              'hover:opacity-80  focus:bg-opacity-90 focus:outline-none rounded-lg',
              'flex items-center justify-between group cursor-pointer',
              isSelected(option)
                ? 'bg-[var(--color-palm)] text-slate-200 font-medium'
                : 'text-slate-700',
            ]"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div v-if="getOptionIcon(option)" class="flex-shrink-0">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden"
                  :style="{ backgroundColor: getOptionIconClass(option) }"
                >
                  <img
                    v-if="getOptionIcon(option).profile_picture"
                    :src="getOptionIcon(option).profile_picture"
                    :alt="getOptionLabel(option)"
                    class="w-full h-full object-cover"
                  />
                  <span v-else>{{ getOptionIcon(option).initials }}</span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="truncate">{{ getOptionLabel(option) }}</div>
                <div v-if="getOptionDescription(option)" class="text-xs text-slate-500 truncate">
                  {{ getOptionDescription(option) }}
                </div>
              </div>
            </div>
            <svg
              v-if="isSelected(option)"
              class="w-4 h-4 text-slate-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>
        <div v-if="$slots.footer" class="border-t border-slate-100">
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useClickOutside } from "@/composables/useClickOutside";

const props = defineProps({
  modelValue: {
    type: [String, Number, Object, Array],
    default: null,
  },
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
  searchable: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  // Styling props
  triggerClass: {
    type: String,
    default: "",
  },
  menuClass: {
    type: String,
    default: "",
  },
  optionsClass: {
    type: String,
    default: "",
  },
  // Option configuration
  optionValue: {
    type: [String, Function],
    default: "value",
  },
  optionLabel: {
    type: [String, Function],
    default: "label",
  },
  optionDescription: {
    type: [String, Function],
    default: null,
  },
  optionIcon: {
    type: [String, Function],
    default: null,
  },
  optionIconClass: {
    type: [String, Function],
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "change", "open", "close"]);

// Refs
const dropdownContainer = ref(null);
const dropdownMenu = ref(null);
const searchInput = ref(null);

// State
const isOpen = ref(false);
const searchQuery = ref("");
const dropdownPosition = ref("below");

// Computed
const selectedLabel = computed(() => {
  if (props.multiple) {
    if (Array.isArray(props.modelValue) && props.modelValue.length > 0) {
      if (props.modelValue.length === 1) {
        const option = props.options.find((opt) => getOptionValue(opt) === props.modelValue[0]);
        return option ? getOptionLabel(option) : "";
      }
      return `${props.modelValue.length} selected`;
    }
    return "";
  } else {
    const option = props.options.find((opt) => getOptionValue(opt) === props.modelValue);
    return option ? getOptionLabel(option) : "";
  }
});

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options;
  }

  const query = searchQuery.value.toLowerCase();
  return props.options.filter((option) => {
    const label = getOptionLabel(option).toLowerCase();
    const description = getOptionDescription(option)?.toLowerCase() || "";
    return label.includes(query) || description.includes(query);
  });
});

// Helper functions
const getOptionValue = (option) => {
  return typeof props.optionValue === "function"
    ? props.optionValue(option)
    : (option[props.optionValue] ?? option);
};

const getOptionLabel = (option) => {
  return typeof props.optionLabel === "function"
    ? props.optionLabel(option)
    : (option[props.optionLabel] ?? option);
};

const getOptionDescription = (option) => {
  if (!props.optionDescription) return null;
  return typeof props.optionDescription === "function"
    ? props.optionDescription(option)
    : option[props.optionDescription];
};

const getOptionIcon = (option) => {
  if (!props.optionIcon) return null;
  return typeof props.optionIcon === "function"
    ? props.optionIcon(option)
    : option[props.optionIcon];
};

const getOptionIconClass = (option) => {
  return typeof props.optionIconClass === "function"
    ? props.optionIconClass(option)
    : props.optionIconClass;
};

const isSelected = (option) => {
  const value = getOptionValue(option);
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(value);
  }
  return props.modelValue === value;
};

// Methods
const toggleDropdown = () => {
  if (props.disabled) return;

  if (isOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
};

const openDropdown = async () => {
  isOpen.value = true;
  emit("open");

  await nextTick();

  // Calculate position
  if (dropdownMenu.value) {
    const rect = dropdownContainer.value.getBoundingClientRect();
    const menuHeight = dropdownMenu.value.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    dropdownPosition.value = spaceBelow < menuHeight && spaceAbove > menuHeight ? "above" : "below";
  }

  // Focus search input if searchable
  if (props.searchable && searchInput.value) {
    searchInput.value.focus();
  }
};

const closeDropdown = () => {
  isOpen.value = false;
  searchQuery.value = "";
  emit("close");
};

const selectOption = (option) => {
  const value = getOptionValue(option);

  if (props.multiple) {
    const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const index = currentValues.indexOf(value);

    if (index > -1) {
      currentValues.splice(index, 1);
    } else {
      currentValues.push(value);
    }

    emit("update:modelValue", currentValues);
    emit("change", currentValues);
  } else {
    emit("update:modelValue", value);
    emit("change", value);
    closeDropdown();
  }
};

// Use the reusable click outside composable
useClickOutside(dropdownContainer, closeDropdown);

// Watch for search query changes
watch(searchQuery, () => {
  if (dropdownMenu.value) {
    dropdownMenu.value.scrollTop = 0;
  }
});
</script>
