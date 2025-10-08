<template>
  <div class="flex items-center justify-center p-4 lg:p-6">
    <div class="w-full max-w-sm">
      <LoginLogo class="mb-4" />
      <LoginForm class="mb-4" />
      <LoginFooter />
    </div>
  </div>
</template>

<script setup>
import LoginLogo from "@/components/login/LoginLogo.vue";
import LoginForm from "@/components/login/LoginForm.vue";
import LoginFooter from "@/components/login/LoginFooter.vue";
</script>
