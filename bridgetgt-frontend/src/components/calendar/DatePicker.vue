<!--


      PALIHOG AYAW NI HILABTI FUTURE EDITOR KAY CUSTOM CALENDAR RANI



-->

<template>
  <div class="relative">
    <!-- Input Field -->
    <div @click="toggleCalendar" class="relative cursor-pointer">
      <input
        :value="displayValue"
        readonly
        :placeholder="placeholder"
        class="w-full p-2 border border-gray-200 rounded-lg bg-white cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        :class="inputClass"
      />
      <!-- <div
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div> -->
    </div>

    <!-- Calendar Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="showCalendar"
        class="absolute bottom-full z-50 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
        :class="dropdownClass"
      >
        <!-- Calendar Header -->
        <div
          class="bg-gradient-to-r from-[var(--color-palm)] to-[var(--color-lime)] text-white p-2"
        >
          <div class="flex items-center justify-between">
            <button
              @click="previousMonth"
              class="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div class="text-center">
              <div class="text-lg font-semibold">{{ monthYear }}</div>
              <div class="text-sm opacity-90">{{ todayFormatted }}</div>
            </div>

            <button
              @click="nextMonth"
              class="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Calendar Body -->
        <div class="p-4">
          <!-- Weekday Headers -->
          <div class="grid grid-cols-7 gap-1 mb-3">
            <div
              v-for="day in weekDays"
              :key="day"
              class="text-center text-xs font-medium text-gray-500 py-2"
            >
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="date in calendarDays"
              :key="date.key"
              @click="selectDate(date)"
              :disabled="date.isDisabled"
              class="relative h-10 w-10 text-sm rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="getDateClass(date)"
            >
              {{ date.day }}
              <div
                v-if="date.isToday"
                class="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full"
              ></div>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <div v-if="showCalendar" @click="closeCalendar" class="fixed inset-0 z-40"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Select date",
  },
  inputClass: {
    type: String,
    default: "",
  },
  dropdownClass: {
    type: String,
    default: "w-80",
  },
  minDate: {
    type: String,
    default: null,
  },
  maxDate: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const showCalendar = ref(false);
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ---------- DATE UTILITIES ----------
const formatDateToISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseDateFromISO = (dateStr) => {
  if (!dateStr) return null;
  
  // Extract date part if it includes time (MySQL format)
  let datePart = dateStr;
  if (dateStr.includes(' ')) {
    datePart = dateStr.split(' ')[0];
  }
  
  const [year, month, day] = datePart.split("-").map(Number);
  // Create date at local midnight to avoid timezone issues
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

const formatDisplayDate = (dateStr) => {
  const date = parseDateFromISO(dateStr);
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const isDateDisabled = (date) => {
  if (props.minDate && date < parseDateFromISO(props.minDate)) return true;
  if (props.maxDate && date > parseDateFromISO(props.maxDate)) return true;
  return false;
};

// ---------- COMPUTED ----------
const displayValue = computed(() => formatDisplayDate(props.modelValue));

const monthYear = computed(() => `${months[currentMonth.value]} ${currentYear.value}`);

const todayFormatted = computed(() => {
  const today = new Date();
  return today.toLocaleDateString("en-US", { weekday: "long", day: "numeric" });
});

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days = [];

  // Previous month trailing days
  const prevMonthLast = new Date(currentYear.value, currentMonth.value, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLast - i;
    days.push({
      day,
      date: new Date(currentYear.value, currentMonth.value - 1, day),
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isDisabled: true,
      key: `prev-${day}`,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear.value, currentMonth.value, day);
    const dateStr = formatDateToISO(date);
    const today = new Date();
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
    const isSelected = props.modelValue === dateStr;
    const isDisabled = isDateDisabled(date);

    days.push({
      day,
      date,
      dateStr,
      isCurrentMonth: true,
      isToday,
      isSelected,
      isDisabled,
      key: `current-${day}`,
    });
  }

  // Next month leading days
  const remainingDays = 42 - days.length; // 6 rows × 7 days
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      day,
      date: new Date(currentYear.value, currentMonth.value + 1, day),
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isDisabled: true,
      key: `next-${day}`,
    });
  }

  return days;
});

// ---------- METHODS ----------
const toggleCalendar = () => (showCalendar.value = !showCalendar.value);
const closeCalendar = () => (showCalendar.value = false);

const selectDate = (dateObj) => {
  if (dateObj.isDisabled || !dateObj.isCurrentMonth) return;
  emit("update:modelValue", formatDateToISO(dateObj.date));
  closeCalendar();
};

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const getDateClass = (dateObj) => {
  const classes = [];
  if (!dateObj.isCurrentMonth || dateObj.isDisabled) {
    classes.push("text-gray-300 cursor-not-allowed");
  } else if (dateObj.isSelected) {
    classes.push(
      "bg-gradient-to-r from-[var(--color-palm)] to-[var(--color-lime)] text-white font-semibold shadow-lg",
    );
  } else if (dateObj.isToday) {
    classes.push("bg-blue-50 text-blue-600 font-semibold border border-blue-200");
  } else {
    classes.push("text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium");
  }
  return classes.join(" ");
};

// Escape key closes calendar
const handleEscape = (event) => {
  if (event.key === "Escape") closeCalendar();
};
onMounted(() => document.addEventListener("keydown", handleEscape));
onUnmounted(() => document.removeEventListener("keydown", handleEscape));

// Watch modelValue to update current month/year
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      const date = parseDateFromISO(newValue);
      currentMonth.value = date.getMonth();
      currentYear.value = date.getFullYear();
    }
  },
);
</script>

<style scoped>
/* Additional custom styles if needed */
.calendar-enter-active,
.calendar-leave-active {
  transition: all 0.3s ease;
}

.calendar-enter-from,
.calendar-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
