<template>
  <div class="bg-white  border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <!-- Left: Back + Title -->
      <div class="flex items-center gap-3">
        <!-- Back Button -->
        <button
          v-if="showBack"
          @click.stop="$emit('back')"
          class="p-2 cursor-pointer hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Icon icon="lucide:chevron-left" width="24" height="24" />
        </button>

        <div>
          <h1 class="text-2xl font-semibold text-slate-800">
            {{ title }}
          </h1>
          <p v-if="subtitle" class="text-sm text-slate-600">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- Right: Action Buttons -->
      <div class="flex items-center gap-2">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  showBack: { type: Boolean, default: true },
})
defineEmits(["back"])
</script>
