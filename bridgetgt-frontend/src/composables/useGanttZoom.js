export function useGanttZoom(ganttStore, rightPanelRef) {
  function handleZoomIn() {
    const scrollContainer = rightPanelRef.value?.$el.querySelector('.overflow-x-auto');
    if (!scrollContainer) {
      ganttStore.zoomIn();
      return;
    }
    const oldDayWidth = ganttStore.dayWidth;
    const centerPosition = scrollContainer.scrollLeft + (scrollContainer.clientWidth / 2);
    const centerDay = centerPosition / oldDayWidth;

    ganttStore.zoomIn();

    requestAnimationFrame(() => {
      const newScrollLeft = (centerDay * ganttStore.dayWidth) - (scrollContainer.clientWidth / 2);
      scrollContainer.scrollTo({
        left: Math.max(0, newScrollLeft),
        behavior: 'smooth'
      });
    });
  }

  function handleZoomOut() {
    const scrollContainer = rightPanelRef.value?.$el.querySelector('.overflow-x-auto');
    if (!scrollContainer) {
      ganttStore.zoomOut();
      return;
    }

    const oldDayWidth = ganttStore.dayWidth;
    const centerPosition = scrollContainer.scrollLeft + (scrollContainer.clientWidth / 2);
    const centerDay = centerPosition / oldDayWidth;

    ganttStore.zoomOut();

    requestAnimationFrame(() => {
      const newScrollLeft = (centerDay * ganttStore.dayWidth) - (scrollContainer.clientWidth / 2);
      scrollContainer.scrollTo({
        left: Math.max(0, newScrollLeft),
        behavior: 'smooth'
      });
    });
  }

  function handleZoomLevelChange(level) {
    const scrollContainer = rightPanelRef.value?.$el.querySelector('.overflow-x-auto');
    if (!scrollContainer) {
      ganttStore.setZoomLevel(level);
      return;
    }

    const oldDayWidth = ganttStore.dayWidth;
    const centerPosition = scrollContainer.scrollLeft + (scrollContainer.clientWidth / 2);
    const centerDay = centerPosition / oldDayWidth;

    ganttStore.setZoomLevel(level);

    requestAnimationFrame(() => {
      const newScrollLeft = (centerDay * ganttStore.dayWidth) - (scrollContainer.clientWidth / 2);
      scrollContainer.scrollTo({
        left: Math.max(0, newScrollLeft),
        behavior: 'smooth'
      });
    });
  }

  return {
    handleZoomIn,
    handleZoomOut,
    handleZoomLevelChange
  };
}
