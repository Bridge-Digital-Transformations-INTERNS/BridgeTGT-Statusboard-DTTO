<template>
  <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
    <button
      v-if="hasPendingChanges"
      @click="$emit('discard')"
      class="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-slate-50 text-black rounded-lg transition-all text-sm font-semibold"
      title="Discard Changes (Esc)"
    >
      <span>Discard</span>
    </button>
    
    <button
      v-if="hasPendingChanges"
      @click="$emit('save')"
      :disabled="loading || isSaving"
      class="flex items-center gap-1.5 px-5 py-1.5 cursor-pointer bg-[var(--color-palm)] hover:opacity-90 text-white rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      title="Save Changes (Ctrl+S)"
    >
      <Icon v-if="isSaving" icon="lucide:loader-2" width="16" height="16" class="animate-spin" />
      <span>{{ isSaving ? 'Saving...' : 'Save' }}</span>
      
    </button>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';

defineProps({
  hasPendingChanges: {
    type: Boolean,
    default: false
  },
  isSaving: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  pendingChangesCount: {
    type: Number,
    default: 0
  }
});

defineEmits(['save', 'discard']);
</script>
