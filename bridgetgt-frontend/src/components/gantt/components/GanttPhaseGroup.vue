<template>
  <div>
    <!-- Phase Header -->
    <button 
      @click="$emit('toggle')"
      class="w-full h-[42px] cursor-pointer hover:bg-gray-50 flex items-center gap-3 px-4 transition-all duration-200 bg-slate-0"
    >
      <Icon 
        :icon="isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'"
        width="18" 
        height="18" 
        class="transition-transform text-gray-900 duration-200 flex-shrink-0"
      />
      <span class="text-md font-bold text-black  tracking-wider  truncate">{{ phaseName }}</span>
      <span class="text-sm text-white h-6 w-6 bg-[var(--color-palm)] rounded-full px-0.5 py-0.5  font-medium">
        {{ taskCount }}
      </span>
    </button>
    
    <!-- Phase Tasks with Animation -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[2000px] opacity-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="max-h-[2000px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-if="isExpanded" class="overflow-hidden bg-white">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';

defineProps({
  phaseName: {
    type: String,
    required: true
  },
  taskCount: {
    type: Number,
    default: 0
  },
  isExpanded: {
    type: Boolean,
    default: false
  }
});

defineEmits(['toggle']);
</script>
