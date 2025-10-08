<template>
  <div class="relative" ref="dropdownContainer">
    <button
      @click="toggleDropdown"
      :class="[
        'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap inline-flex items-center gap-2 border transition-colors',
        'hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer',
        statusConfig.bgClass,
        statusConfig.textClass,
        statusConfig.borderClass,
      ]"
    >
      {{ statusConfig.label }}
      <svg
        class="w-3 h-3 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown menu with portal-like positioning -->
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
          'fixed w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-[9999] overflow-hidden',
        ]"
        :style="dropdownStyles"
      >
        <div class="py-1">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            @click="selectStatus(option.value)"
            :class="[
              'w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors',
              'flex items-center gap-2 cursor-pointer',
              option.value === value ? 'bg-slate-50 font-medium' : '',
            ]"
          >
            <span
              :class="['w-2 h-2 rounded-full border', getStatusConfig(option.value).borderClass]"
            ></span>
            {{ option.label }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop to close dropdown and prevent body scroll -->
    <div v-if="isOpen" @click="closeDropdown" class="fixed inset-0 z-[9998] bg-transparent"></div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { useStatusConfig } from "@/composables/useStatusConfig";
import { useClickOutside } from "@/composables/useClickOutside";
import { STATUS_OPTIONS } from "@/constants/common";

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:value"]);

const isOpen = ref(false);
const dropdownContainer = ref(null);
const dropdownMenu = ref(null);
const dropdownPosition = ref("below");
const dropdownStyles = ref({});

// Use the reusable click outside composable
useClickOutside(dropdownContainer, () => {
  isOpen.value = false;
});

// Status options for the dropdown
const statusOptions = STATUS_OPTIONS;

const { getStatusConfig } = useStatusConfig();
const statusConfig = computed(() => {
  return getStatusConfig(props.value, false, "badge");
});


function calculateDropdownPosition() {
  if (!dropdownContainer.value || !dropdownMenu.value) return;

  const containerRect = dropdownContainer.value.getBoundingClientRect();
  const menuHeight = dropdownMenu.value.offsetHeight;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // Calculate space below and above the trigger
  const spaceBelow = viewportHeight - containerRect.bottom;
  const spaceAbove = containerRect.top;

  let top, left;

  // Position dropdown based on available space
  if (spaceBelow < menuHeight + 10 && spaceAbove > menuHeight + 10) {
    // Position above
    top = containerRect.top - menuHeight - 4;
    dropdownPosition.value = "above";
  } else {
    // Position below
    top = containerRect.bottom + 4;
    dropdownPosition.value = "below";
  }

  // Calculate horizontal position
  left = containerRect.left;

  // Ensure dropdown doesn't go off-screen horizontally
  const menuWidth = 192; // w-48 = 12rem = 192px
  if (left + menuWidth > viewportWidth) {
    left = containerRect.right - menuWidth;
  }

  // Ensure dropdown doesn't go off-screen vertically
  if (top < 8) {
    top = 8;
  } else if (top + menuHeight > viewportHeight - 8) {
    top = viewportHeight - menuHeight - 8;
  }

  dropdownStyles.value = {
    top: `${top}px`,
    left: `${left}px`,
  };
}

function toggleDropdown() {
  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    // Prevent body scrolling while preserving scrollbar space
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    nextTick(() => {
      calculateDropdownPosition();
    });
  } else {
    // Restore body scrolling
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }
}

function closeDropdown() {
  isOpen.value = false;
  // Restore body scrolling
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
}

function selectStatus(value) {
  emit("update:value", value);
  closeDropdown();
}
</script>
