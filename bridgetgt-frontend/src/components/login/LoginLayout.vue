<template>
  <div class="h-screen grid lg:grid-cols-2 overflow-hidden">
    <div class="relative flex items-center justify-center p-4 lg:p-6">
      <div class="absolute top-4 left-4 flex items-center">
        <LoginLogo />
      </div>
      <div class="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
    <LoginRightPanel />
  </div>
</template>

<script setup>
import LoginForm from "@/components/login/LoginForm.vue";
import LoginRightPanel from "@/components/login/LoginRightPanel.vue";
import LoginLogo from "@/components/login/LoginLogo.vue";
</script>
