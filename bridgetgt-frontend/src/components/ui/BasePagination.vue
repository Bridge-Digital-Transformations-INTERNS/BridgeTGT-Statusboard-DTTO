<template>
  <div class="flex justify-end items-center gap-2 mt-6">
    <button
      class="flex items-center justify-center gap-2 w-24 h-10 rounded-lg border border-slate-300 bg-white text-slate-600 text-sm font-medium cursor-pointer
             hover:bg-slate-100 hover:border-slate-400 active:scale-95 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
      :disabled="page === 1"
      @click="$emit('update:page', page - 1)"
    >
      <span class="iconify text-base" data-icon="mdi:chevron-left"></span>
      <span class="hidden sm:inline">Prev</span>
    </button>
    <span
      class="flex items-center justify-center w-32 h-10 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium select-none"
    >
      Page {{ page }} of {{ totalPages }}
    </span>

    <button
      class="flex items-center justify-center gap-2 w-24 h-10 rounded-lg border border-slate-300 bg-white text-slate-600 text-sm font-medium cursor-pointer
             hover:bg-slate-100 hover:border-slate-400 active:scale-95 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
      :disabled="page === totalPages"
      @click="$emit('update:page', page + 1)"
    >
      <span class="hidden sm:inline">Next</span>
      <span class="iconify text-base" data-icon="mdi:chevron-right"></span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
});

defineEmits(["update:page"]);
</script>
