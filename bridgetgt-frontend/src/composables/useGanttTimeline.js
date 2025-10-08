import { computed } from 'vue';

export function useGanttTimeline(ganttStore) {
  // Determine if we should use week view (when zoomed out)
  const useWeekView = computed(() => {
    return ganttStore.dayWidth <= 20;
  });

  // Calculate timeline range
  const timelineStart = computed(() => {
    if (ganttStore.tasks.length === 0) {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() - 6, 1);
    }

    let earliest = null;
    ganttStore.tasks.forEach(task => {
      if (task.startDate) {
        const date = new Date(task.startDate);
        if (!earliest || date < earliest) {
          earliest = date;
        }
      }
    });

    const baseStart = earliest || new Date();
    return new Date(baseStart.getFullYear(), baseStart.getMonth() - 6, 1);
  });

  const timelineEnd = computed(() => {
    if (ganttStore.tasks.length === 0) {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 12, 0);
    }

    let latest = null;
    ganttStore.tasks.forEach(task => {
      const date = task.endDate ? new Date(task.endDate) :
        task.targetDate ? new Date(task.targetDate) : null;
      if (date && (!latest || date > latest)) {
        latest = date;
      }
    });

    const minEnd = new Date(timelineStart.value);
    minEnd.setMonth(minEnd.getMonth() + 12);
    const actualEnd = latest && latest > minEnd ? latest : minEnd;
    const endWithBuffer = new Date(actualEnd);
    endWithBuffer.setMonth(endWithBuffer.getMonth() + 6);

    return new Date(endWithBuffer.getFullYear(), endWithBuffer.getMonth() + 1, 0);
  });

  // Generate timeline days
  const timelineDays = computed(() => {
    const days = [];
    const start = new Date(timelineStart.value);
    const end = new Date(timelineEnd.value);
    let current = new Date(start);

    while (current <= end) {
      days.push({
        key: current.toISOString(),
        date: new Date(current),
        day: current.getDate(),
        isWeekend: current.getDay() === 0 || current.getDay() === 6,
        isToday: current.toDateString() === new Date().toDateString()
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  });

  // Generate timeline months
  const timelineMonths = computed(() => {
    const months = [];
    let current = new Date(timelineStart.value);
    const end = new Date(timelineEnd.value);

    while (current <= end) {
      const daysInMonth = timelineDays.value.filter(d =>
        d.date.getMonth() === current.getMonth() &&
        d.date.getFullYear() === current.getFullYear()
      ).length;

      months.push({
        key: `${current.getFullYear()}-${current.getMonth()}`,
        label: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        width: daysInMonth * ganttStore.dayWidth
      });

      current.setMonth(current.getMonth() + 1);
    }

    return months;
  });

  // Generate timeline weeks
  const timelineWeeks = computed(() => {
    const weeks = [];
    let weekStart = null;
    let weekDays = [];
    let weekNumber = 1;
    let currentMonth = null;
    
    // Determine label format based on dayWidth
    const getWeekLabel = (num) => {
      if (ganttStore.dayWidth >= 15) {
        return `Week ${num}`;
      } else {
        return `W${num}`;
      }
    };

    timelineDays.value.forEach((day, index) => {
      const isMonday = day.date.getDay() === 1;
      const isFirstDay = index === 0;
      const monthChanged = currentMonth !== null && day.date.getMonth() !== currentMonth;

      if (isMonday || isFirstDay || monthChanged) {
        if (weekStart !== null && weekDays.length > 0) {
          weeks.push({
            key: `week-${weekStart.toISOString()}`,
            label: getWeekLabel(weekNumber),
            width: weekDays.length * ganttStore.dayWidth,
            startDate: weekStart,
            month: weekStart.getMonth(),
            year: weekStart.getFullYear()
          });

          if (monthChanged) {
            weekNumber = 1;
          } else {
            weekNumber++;
          }
        }

        weekStart = new Date(day.date);
        weekDays = [day];
        currentMonth = day.date.getMonth();
      } else {
        weekDays.push(day);
      }

      if (index === timelineDays.value.length - 1 && weekDays.length > 0) {
        weeks.push({
          key: `week-${weekStart.toISOString()}`,
          label: getWeekLabel(weekNumber),
          width: weekDays.length * ganttStore.dayWidth,
          startDate: weekStart,
          month: weekStart.getMonth(),
          year: weekStart.getFullYear()
        });
      }
    });

    return weeks;
  });

  const timelineWidth = computed(() => {
    return timelineDays.value.length * ganttStore.dayWidth;
  });

  return {
    useWeekView,
    timelineStart,
    timelineEnd,
    timelineDays,
    timelineMonths,
    timelineWeeks,
    timelineWidth
  };
}
