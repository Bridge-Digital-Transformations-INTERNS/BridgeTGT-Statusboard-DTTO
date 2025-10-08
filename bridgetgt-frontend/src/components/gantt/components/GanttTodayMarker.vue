<template>
  <div 
    v-if="todayPosition >= 0"
    class="absolute w-0.5 bg-[#349083] z-40 pointer-events-none"
    style="width: 1px;"
    :style="{ 
      left: todayPosition + 'px',
      top: '0',
      height: '100%',
      minHeight: '100%'
    }"
  >
    <div class="sticky flex justify-center top-0 left-1/2 transform translate-x-0 bg-[#349083] text-white text-xs px-9 py-1 rounded whitespace-nowrap z-40 font-medium">
      Today
    </div>
  </div>
</template>

<script setup>
defineProps({
  todayPosition: {
    type: Number,
    required: true
  }
});
</script>
