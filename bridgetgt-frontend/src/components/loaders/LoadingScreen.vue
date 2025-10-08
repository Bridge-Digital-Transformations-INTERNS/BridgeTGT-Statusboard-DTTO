<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center"
  >
    <div class="max-w-md w-full text-center px-6">
      <!-- Logo Section -->
      <!-- <div class="mb-8">
        <div class="flex justify-center items-center mb-4">
          <div class="flex items-center">
            <img src="@/BRIDGE LOGOS_Icon.png" alt="Bridge Logo" class="h-12" />
            <div class="relative flex items-center">
              <p
                class="ml-3 leading-none text-3xl font-bold text-[var(--color-palm)]"
              >
                ridge
              </p>
              <h1
                class="absolute -top-2 left-16 text-xl font-bold bg-gradient-to-r from-[var(--color-palm)] to-[var(--color-lime)] bg-clip-text text-transparent"
                aria-hidden="true"
              >
                TGT
              </h1>
            </div>
          </div>
        </div>
        <p class="text-lg font-medium text-slate-700 mb-1">
          {{ title || "Status Board" }}
        </p>
        <p class="text-sm text-slate-500">
          {{ subtitle || "Bridge Digital Transformations" }}
        </p>
      </div> -->

      <!-- Loading Animation -->
      <div class="mb-6">
        <div class="relative inline-block">
          <div
            class="w-16 h-16 border-4 border-slate-200 border-t-[var(--color-palm)] rounded-full animate-spin"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
