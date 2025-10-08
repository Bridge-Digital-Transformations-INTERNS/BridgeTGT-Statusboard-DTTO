<template>
  <PageHeader
  title="Activity Log"
  subtitle="Track all system changes and user actions"
  :showBack="true"
  @back="$emit('back')"
>
  <template #actions>
    <button
      @click="$emit('refresh')"
      :disabled="loading"
      class="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
    >
      <svg
        class="w-4 h-4"
        :class="{ 'animate-spin': loading }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      Refresh
    </button>
  </template>
</PageHeader>
</template>

<script setup>
import PageHeader from '@/components/layout/PageHeader.vue'
defineProps({ loading: Boolean });
</script>
