import { ref } from 'vue';
import { calculateTaskPosition } from '@/utils/ganttDates';

export function useGanttScroll(ganttStore, rightPanelRef) {
  const hoveredRowId = ref(null);
  let isScrolling = false;

  // Right panel scrolls, sync to left panel (primary vertical scroll driver)
  function handleRightScroll(scrollTop, leftPanelRef) {
    if (isScrolling) return;
    isScrolling = true;
    if (leftPanelRef.value) {
      leftPanelRef.value.setScrollTop(scrollTop);
    }
    setTimeout(() => { isScrolling = false; }, 10);
  }

  // Left panel scrolls (fallback, but should be driven by right panel)
  function handleLeftScroll(scrollTop, leftPanelRef) {
    if (isScrolling) return;
    isScrolling = true;
    if (rightPanelRef.value) {
      rightPanelRef.value.setScrollTop(scrollTop);
    }
    setTimeout(() => { isScrolling = false; }, 10);
  }

  function handleRowHover(rowId) {
    hoveredRowId.value = rowId;
  }

  function scrollToToday() {
    if (!rightPanelRef.value) return;

    const scrollContainer = rightPanelRef.value.$el.querySelector('.overflow-x-auto');
    if (!scrollContainer) return;

    let timelineStart;
    if (ganttStore.tasks.length === 0) {
      const now = new Date();
      timelineStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    } else {
      let earliest = null;
      ganttStore.tasks.forEach(t => {
        if (t.startDate) {
          const date = new Date(t.startDate);
          if (!earliest || date < earliest) {
            earliest = date;
          }
        }
      });
      const baseStart = earliest || new Date();
      timelineStart = new Date(baseStart.getFullYear(), baseStart.getMonth() - 6, 1);
    }

    const today = new Date();
    const todayPosition = calculateTaskPosition(today, timelineStart, ganttStore.dayWidth);
    const containerWidth = scrollContainer.clientWidth;
    const scrollLeft = todayPosition - (containerWidth / 2);

    scrollContainer.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: 'smooth'
    });
  }

  function handleScrollToTask(taskId) {
    const task = ganttStore.tasks.find(t => t.id === taskId);
    if (!task || !rightPanelRef.value) return;

    const scrollContainer = rightPanelRef.value.$el.querySelector('.overflow-x-auto');
    if (!scrollContainer) return;

    let timelineStart;
    if (ganttStore.tasks.length === 0) {
      const now = new Date();
      timelineStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    } else {
      let earliest = null;
      ganttStore.tasks.forEach(t => {
        if (t.startDate) {
          const date = new Date(t.startDate);
          if (!earliest || date < earliest) {
            earliest = date;
          }
        }
      });
      const baseStart = earliest || new Date();
      timelineStart = new Date(baseStart.getFullYear(), baseStart.getMonth() - 6, 1);
    }

    const taskPosition = calculateTaskPosition(task.startDate, timelineStart, ganttStore.dayWidth);
    const containerWidth = scrollContainer.clientWidth;
    const scrollLeft = taskPosition - (containerWidth / 2);

    scrollContainer.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: 'smooth'
    });

    hoveredRowId.value = taskId;
    setTimeout(() => {
      hoveredRowId.value = null;
    }, 2000);
  }

  return {
    hoveredRowId,
    handleLeftScroll,
    handleRightScroll,
    handleRowHover,
    scrollToToday,
    handleScrollToTask
  };
}
