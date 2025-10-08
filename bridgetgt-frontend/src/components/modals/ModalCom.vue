<!-- ModalCom.vue -->
<template>
  <transition name="modal-fade">
    <div
      v-if="open"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="handleBackdropClick"
      @touchmove.prevent
    >
      <div
        class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-8 relative transform transition-transform duration-200 scale-100"
        @click.stop
        tabindex="0"
      >
        <h3 class="text-xl font-semibold mb-6 text-gray-800">{{ title }}</h3>
        <slot />
        <div class="mt-8 flex justify-end gap-4">
          <!-- Cancel -->
          <button
            @click="handleCancel"
            :disabled="saving"
            class="cursor-pointer px-6 py-2.5 rounded-lg border border-slate-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ cancelText }}
          </button>

          <!-- Confirm -->
          <button
            @click="handleConfirm"
            :disabled="saving"
            class="cursor-pointer px-6 py-2.5 rounded-lg text-white transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            :class="confirmClass || ''"
            :style="!confirmClass ? 'background: linear-gradient(to left, var(--color-lime), var(--color-palm))' : ''"
          >
            <!-- Loading spinner -->
            <svg
              v-if="saving"
              class="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ saving ? "Saving..." : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { watch, nextTick, onUnmounted } from "vue";

const props = defineProps({
  open: Boolean,
  title: String,
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  confirmClass: {
    type: String,
    default: ''
  },
  saving: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["cancel", "confirm"]);

function handleBackdropClick() {
  if (!props.saving) emit("cancel");
}

function handleCancel() {
  emit("cancel");
}

function handleConfirm() {
  emit("confirm");
}

// Handle keyboard events
function handleKeydown(event) {
  if (!props.open || props.saving) return;
  if (event.key === 'Enter' && !event.shiftKey) {
    if (event.target.tagName === 'TEXTAREA') return;
    event.preventDefault();
    emit("confirm");
  } else if (event.key === 'Escape') {
    event.preventDefault();
    emit("cancel");
  }
}

// Handle body scroll and padding when modal opens/closes
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        window.addEventListener('keydown', handleKeydown);
      });
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      
      window.removeEventListener('keydown', handleKeydown);
    }
  }
);

onUnmounted(() => {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  window.removeEventListener('keydown', handleKeydown);
});
</script>
