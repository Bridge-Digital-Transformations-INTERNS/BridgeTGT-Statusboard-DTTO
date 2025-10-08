<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4"
  >
    <div class="max-w-md w-full text-center">
      <div class="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <!-- Error Icon -->
        <div
          class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h1 class="text-xl font-semibold text-slate-800 mb-2">Access Denied</h1>

        <p class="text-sm text-slate-600 mb-6">
          You must be a developer of the
          <strong>Bridge-Digital-Transformations-INTERNS</strong>
          GitHub organization to access this application.
        </p>

        <div class="space-y-3">
          <button
            @click="tryAgain"
            class="cursor-pointer w-full px-4 py-2 bg-gradient-to-r from-[var(--color-palm)] to-[var(--color-lime)] text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Try Again
          </button>

          <button
            @click="signOut"
            class="cursor-pointer w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Sign Out
          </button>
        </div>

        <p class="text-xs text-slate-500 mt-6">
          Need access? Contact your IT administrator to be added to the organization.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup name="UnauthorizedView">
import { useRouter } from "vue-router";
import { useGitHubAuthStore } from "@/stores/githubAuthStore";
import { useAccessStore } from "@/stores/accessStore";

const router = useRouter();
const githubAuthStore = useGitHubAuthStore();
const accessStore = useAccessStore();

function tryAgain() {
  router.push("/login");
}

function signOut() {
  if (githubAuthStore.isAuthenticated) {
    githubAuthStore.signOut();
  }
  if (accessStore.isAuthenticated) {
    accessStore.logout();
  }
  router.push("/login");
}
</script>
