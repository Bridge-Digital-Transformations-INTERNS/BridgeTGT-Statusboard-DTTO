<template>
  <div class="sticky top-0 z-30 bg-white border-gray-300">
    <!-- Month Headers -->
    <div class="flex  border-gray-300 p-0 relative z-30">
      <div
        v-for="month in months"
        :key="month.key"
        class="border-r border-gray-200 bg-white flex items-center justify-center font-semibold text-gray-700 py-2"
        :class="{
          'text-[10px]': dayWidth < 20,
          'text-xs': dayWidth >= 20 && dayWidth < 30,
          'text-sm': dayWidth >= 30
        }"
        :style="{ minWidth: month.width + 'px', width: month.width + 'px' }"
      >
        {{ month.label }}
      </div>
    </div>
    
    <!-- Week Headers -->
    <div v-if="useWeekView" class="flex bg-white relative z-30">
      <div
        v-for="week in weeks"
        :key="week.key"
        class="border-r border-b border-gray-300 bg-white flex items-center justify-center font-medium py-3.5 overflow-hidden"
        :class="{
          'text-gray-700 font-semibold': true,
          'text-[10px]': dayWidth < 15,
          'text-xs': dayWidth >= 15
        }"
        :style="{ 
          minWidth: week.width + 'px', 
          width: week.width + 'px',
          whiteSpace: 'nowrap'
        }"
      >
        <span class="truncate px-1">{{ week.label }}</span>
      </div>
    </div>
    
    <!-- Day Headers -->
    <div v-else class="flex bg-white relative z-30 border-gray-300">
      <div
        v-for="day in days"
        :key="day.key"
        class=" border-b border-gray-300 flex flex-col items-center justify-center font-medium"
        :class="{
          'bg-blue-50/50 text-blue-600': day.isWeekend,
          'bg-[var(--color-palm)]/10 text-[var(--color-palm)] font-bold': day.isToday,
          'text-black font-bold': !day.isWeekend && !day.isToday,
          'py-0.5': dayWidth < 20,
          'py-1': dayWidth >= 20,
          'text-[9px]': dayWidth < 15,
          'text-[10px]': dayWidth >= 15 && dayWidth < 25,
          'text-xs': dayWidth >= 25
        }"
        :style="{ minWidth: dayWidth + 'px', width: dayWidth + 'px' }"
      >
        <div 
          v-if="dayWidth >= 20"
          class="font-normal opacity-60"
          :class="{
            'text-[8px]': dayWidth < 25,
            'text-[9px]': dayWidth >= 25 && dayWidth < 30,
            'text-[10px]': dayWidth >= 30
          }"
        >
          {{ getDayOfWeek(day.date, dayWidth < 25) }}
        </div>
        <div>{{ day.day }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  months: {
    type: Array,
    required: true
  },
  days: {
    type: Array,
    required: true
  },
  weeks: {
    type: Array,
    default: () => []
  },
  dayWidth: {
    type: Number,
    required: true
  },
  useWeekView: {
    type: Boolean,
    default: false
  }
});

// Get day of week abbreviation
function getDayOfWeek(date, short = false) {
  const days = short 
    ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}
</script>
