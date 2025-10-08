<template>
  <div ref="userMenuRef" class="relative">
    <button
      @click="$emit('toggle')"
      class="flex items-center cursor-pointer gap-3 pl-3 border-l border-gray-200 hover:bg-gray-50 rounded-xl px-3 py-2"
    >
      <div class="relative">
        <img
          v-if="user.avatar"
          :src="user.avatar"
          :alt="user.name || user.username || 'User'"
          class="w-9 h-9 rounded-full border-2 border-gray-200"
        />
        <div
          v-else
          class="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-white font-semibold text-sm"
        >
          {{ initials }}
        </div>
      </div>
      <div class="flex flex-col items-start">
        <span class="text-sm font-medium text-gray-900">{{ user.name }}</span>
        <span v-if="user.username" class="text-xs text-gray-500">@{{ user.username }}</span>
      </div>
      <Icon
        icon="material-symbols:keyboard-arrow-down-rounded"
        width="20"
        height="20"
        class="text-gray-400 transition-transform"
        :class="{ 'rotate-180': show }"
      />
    </button>

    <transition name="dropdown-slide">
      <div
        v-if="show"
        class="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50"
      >
        <div class="px-4 py-3 border-b border-gray-100">
          <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
          <p v-if="user.username" class="text-xs text-gray-500">@{{ user.username }}</p>
        </div>
        <button
          @click="handleActivityLog"
          class="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <Icon icon="material-symbols:history" width="18" height="18" />
          Activity Log
        </button>
        <button
          @click="handleLogout"
          class="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <Icon icon="material-symbols:logout" width="18" height="18" class="text-red-500" />
          Logout
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Icon } from "@iconify/vue";
import { getInitials } from "@/utils/ui";
import { useClickOutside } from "@/composables/useClickOutside";
import { useToastNotification } from "@/composables/useToastNotification";
const { showSuccess } = useToastNotification();

const props = defineProps({
  user: { type: Object, required: true },
  show: { type: Boolean, default: false },
});
const emit = defineEmits(["toggle", "logout", "activityLog", "close"]);

function handleActivityLog() {
  console.log('UserMenu: Activity Log clicked');
  emit("activityLog");
  emit("close");
}

function handleLogout() {
  emit("logout");
  showSuccess("Sign Out", "You have been logged out successfully!");
}
const initials = computed(() => getInitials(props.user.name || props.user.username || "User"));

const userMenuRef = ref(null);

// Close menu if clicked outside
useClickOutside(userMenuRef, () => {
  if (props.show) emit("close");
});
</script>
