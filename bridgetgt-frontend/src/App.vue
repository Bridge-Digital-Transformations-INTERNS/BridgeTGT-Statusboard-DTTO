<template>
  <AppToast />
  <LoadingScreen v-if="authInitializing" />
  <router-view v-else />
  <UserOnlineToast 
    :user="sessionStore.newOnlineUser" 
    @close="sessionStore.clearNewOnlineUser" 
  />
</template>

<script setup>
import { computed } from "vue";
import { useGitHubAuthStore } from "@/stores/githubAuthStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useSessionLifecycle } from "@/composables/useSessionLifecycle";
import LoadingScreen from "@/components/loaders/LoadingScreen.vue";
import UserOnlineToast from "@/components/loaders/UserOnlineToast.vue";
import AppToast from "@/components/ui/AppToast.vue";
const githubAuthStore = useGitHubAuthStore();
const sessionStore = useSessionStore();
const authInitializing = computed(() => githubAuthStore.initializing);
// Setup session lifecycle management
const { setupLifecycle } = useSessionLifecycle();
setupLifecycle();
</script>
