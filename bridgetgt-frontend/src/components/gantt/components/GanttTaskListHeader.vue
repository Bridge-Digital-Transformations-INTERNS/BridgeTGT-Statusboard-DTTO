<template>
  <div class="bg-white border-b-2 shadow-sm border-gray-300 px-1 sm:px-7 pt-10 pb-2.5  sticky top-0 z-10 flex-shrink-0">
    <div class="flex items-center gap-4">
      <!-- Task Name -->
      <div class="flex-1 min-w-0">
        <span class="text-md font-semibold text-gray-600 pl-8 tracking-wide">Task</span>
      </div>
      <!-- Dates -->
      <div class="hidden md:block text-md font-semibold pr-18 text-gray-600  tracking-wide">
        Timeline
      </div>
      <!-- Weight Dot -->
      <div class="hidden lg:block w-2 flex-shrink-0"></div>
      <!-- Status -->
      <div class=" pr-5 w-[100px]  flex-shrink-0">
        <span class="text-md font-semibold  text-gray-600  tracking-wide">Status</span>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
