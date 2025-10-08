<template>
  <form @submit.prevent="handleLogin" class="space-y-6">
    <div class="flex flex-col items-center text-center">
      <h2 class="text-2xl md:text-3xl font-extrabold text-black tracking-wide mb-0">
        Access Status Board
      </h2>
      <p class="text-sm md:text-base text-slate-600 mb-5">Secure access for company developers only</p>
    </div>

    <!-- Access Key Input -->
    <div>
      <label for="accessKey" class="block text-md font-medium text-slate-700 mb-2">
        Company Access Key
      </label>
      <div class="relative">
        <input
          id="accessKey"
          v-model="accessKey"
          :type="showPassword ? 'text' : 'password'"
          :disabled="accessStore.isLocked || accessStore.isLoading"
          :class="[
            'w-md px-4 mb-0 py-3 text-base border outline-none rounded-lg focus:ring-1 focus:ring-[var(--color-palm)]',
            inputError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300',
          ]"
          placeholder="Enter access key"
          autocomplete="off"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          :disabled="accessStore.isLoading"
        >
          <Icon
            :icon="showPassword ? 'material-symbols:visibility-off' : 'material-symbols:visibility'"
            width="20"
            height="20"
          />
        </button>
      </div>
    </div>

    <!-- Submit -->
    <button
      type="submit"
      :disabled="accessStore.isLoading || accessStore.isLocked"
      class="w-md mt-0 text-md md:text-md mb-0 rounded-md text-white font-bold py-3 px-4 bg-gradient-to-r from-[var(--color-palm)] to-[var(--color-lime)] hover:from-[var(--color-palm)]/90 hover:to-[var(--color-lime)]/90 transition-all duration-200 ease-in-out cursor-pointer active:opacity-80"
    >
      <span v-if="accessStore.isLoading">Verifying Access...</span>
      <span v-else>Access Board</span>
    </button>

    <!-- Divider -->
    <div class="relative flex items-center justify-center my-6">
      <div class="w-md border-t border-slate-300"></div>
      <span class="absolute bg-white px-3 text-sm text-slate-500">OR</span>
    </div>

    <!-- GitHub -->
    <button
      @click.prevent="loginWithGitHub"
      :disabled="githubAuthStore.loading"
      class="mb-2 w-md text-md md:text-md py-3 px-4 font-bold bg-white text-slate-900 rounded-md flex items-center border border-slate-400 justify-center gap-3 hover:opacity-90 hover:bg-slate-100 transition cursor-pointer active:opacity-70"
    >
      <Icon icon="mdi:github" width="22" height="22" />
      <span v-if="githubAuthStore.loading">Connecting to GitHub...</span>
      <span v-else>Sign in with GitHub</span>
    </button>

    <p class="text-xs text-slate-500 text-center mt-0">Organization developers only</p>
  </form>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAccessStore } from "@/stores/accessStore";
import { useGitHubAuthStore } from "@/stores/githubAuthStore";
import { Icon } from "@iconify/vue";
import { useToastNotification } from "@/composables/useToastNotification";
const { showSuccess,showError } = useToastNotification();

const router = useRouter();
const accessStore = useAccessStore();
const githubAuthStore = useGitHubAuthStore();

const accessKey = ref("");
const showPassword = ref(false);
const inputError = ref(false);

watch(accessKey, (val) => {
  if (val.trim()) inputError.value = false;
});

function loginWithGitHub() {
  githubAuthStore.signInWithGitHub();
}

async function handleLogin() {
  if (!accessKey.value.trim()) {
    inputError.value = true;

    return;
  }

  const success = await accessStore.login(accessKey.value.trim());

  if (success) {
    router.push("/");
    showSuccess("Access Granted", "Welcome! You have successfully accessed the status board.");
  } else {
    showError("Access Denied", "Invalid access key. Please try again.");
  }
}
</script>
