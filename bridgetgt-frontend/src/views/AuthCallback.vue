<template>
  <LoadingScreen />
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useGitHubAuthStore } from "@/stores/githubAuthStore";
import { useToastNotification } from "@/composables/useToastNotification";
import LoadingScreen from "@/components/loaders/LoadingScreen.vue";

const router = useRouter();
const githubAuthStore = useGitHubAuthStore();
const { showSuccess, showError } = useToastNotification();

onMounted(async () => {
  try {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      router.push("/login");
      return;
    }
    const success = await githubAuthStore.handleGitHubCallback(code);

    if (success && githubAuthStore.isAuthenticated) {
      showSuccess(
        "GitHub Sign-In Successful",
        `Hi! Welcome, ${githubAuthStore.user?.name || githubAuthStore.user?.github_login}!`
      );
      router.push("/");
    } else {
      showError(
        "GitHub Login Failed",
        githubAuthStore.error || "Unauthorized access."
      );
      router.push("/unauthorized");
    }
  } catch (error) {
    console.error("Auth callback error:", error);
    showError("Auth Error", "Something went wrong during authentication.");
    router.push("/login");
  }
});
</script>
