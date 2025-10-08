import { ref } from 'vue';
import { calculateTaskPosition, calculateDateFromPosition } from '@/utils/ganttDates';

export function useGanttDragResize(props, ganttStore, duration) {
  const isDragging = ref(false);
  const resizeDirection = ref(null);
  let autoScrollInterval = null;

  function setupAutoScroll(e, onScroll) {
    const scrollContainer = document.querySelector('.overflow-x-auto.overflow-y-auto');
    if (!scrollContainer) return;

    const containerRect = scrollContainer.getBoundingClientRect();
    const mouseX = e.clientX;
    const edgeThreshold = 100;
    const maxScrollSpeed = 20;
    
    if (autoScrollInterval) {
      cancelAnimationFrame(autoScrollInterval);
      autoScrollInterval = null;
    }

    function scroll() {
      const containerRect = scrollContainer.getBoundingClientRect();
      const mouseX = window.lastMouseX || e.clientX;
      
      let scrollSpeed = 0;
      
      if (mouseX < containerRect.left + edgeThreshold) {
        const distance = containerRect.left + edgeThreshold - mouseX;
        scrollSpeed = -Math.min(maxScrollSpeed, (distance / edgeThreshold) * maxScrollSpeed);
      }
      else if (mouseX > containerRect.right - edgeThreshold) {
        const distance = mouseX - (containerRect.right - edgeThreshold);
        scrollSpeed = Math.min(maxScrollSpeed, (distance / edgeThreshold) * maxScrollSpeed);
      }

      if (scrollSpeed !== 0) {
        scrollContainer.scrollLeft += scrollSpeed;
        
        if (onScroll) {
          onScroll(scrollSpeed);
        }
        
        autoScrollInterval = requestAnimationFrame(scroll);
      } else {
        autoScrollInterval = null;
      }
    }

    scroll();
  }

  function startDrag(event, timelineStart, dayWidth) {
    if (resizeDirection.value) return;
    
    event.preventDefault();
    isDragging.value = true;
    
    const startX = event.clientX;
    const startLeft = calculateTaskPosition(props.task.startDate, timelineStart, dayWidth);
    
    const scrollContainer = document.querySelector('.overflow-x-auto.overflow-y-auto');
    const initialScrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0;
    
    function onMouseMove(e) {
      window.lastMouseX = e.clientX;
      
      const currentScrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0;
      const scrollDelta = currentScrollLeft - initialScrollLeft;
      
      const deltaX = e.clientX - startX + scrollDelta;
      const newLeft = startLeft + deltaX;
      
      const newStartDate = calculateDateFromPosition(newLeft, timelineStart, dayWidth);
      
      const taskDuration = duration.value;
      const newTargetDate = new Date(newStartDate);
      newTargetDate.setDate(newTargetDate.getDate() + taskDuration);
      
      requestAnimationFrame(() => {
        ganttStore.updateTaskLocally(props.task.id, {
          startDate: newStartDate,
          targetDate: newTargetDate
        });
      });
      
      setupAutoScroll(e);
    }
    
    function onMouseUp() {
      isDragging.value = false;
      
      if (autoScrollInterval) {
        cancelAnimationFrame(autoScrollInterval);
        autoScrollInterval = null;
      }
      
      delete window.lastMouseX;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function startResize(direction, event, dayWidth) {
    event.preventDefault();
    event.stopPropagation();
    
    resizeDirection.value = direction;
    
    const startX = event.clientX;
    const originalStartDate = new Date(props.task.startDate);
    const originalTargetDate = new Date(props.task.targetDate);
    
    const scrollContainer = document.querySelector('.overflow-x-auto.overflow-y-auto');
    const initialScrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0;
    
    function onMouseMove(e) {
      window.lastMouseX = e.clientX;
      
      const currentScrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0;
      const scrollDelta = currentScrollLeft - initialScrollLeft;
      
      const deltaX = e.clientX - startX + scrollDelta;
      const deltaDays = Math.round(deltaX / dayWidth);
      
      requestAnimationFrame(() => {
        if (direction === 'left') {
          const newStartDate = new Date(originalStartDate);
          newStartDate.setDate(newStartDate.getDate() + deltaDays);
          
          if (newStartDate < originalTargetDate) {
            ganttStore.updateTaskLocally(props.task.id, {
              startDate: newStartDate
            });
          }
        } else {
          const newTargetDate = new Date(originalTargetDate);
          newTargetDate.setDate(newTargetDate.getDate() + deltaDays);
          
          if (newTargetDate > originalStartDate) {
            ganttStore.updateTaskLocally(props.task.id, {
              targetDate: newTargetDate
            });
          }
        }
      });
      
      setupAutoScroll(e);
    }
    
    function onMouseUp() {
      resizeDirection.value = null;
      
      if (autoScrollInterval) {
        cancelAnimationFrame(autoScrollInterval);
        autoScrollInterval = null;
      }
      
      delete window.lastMouseX;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  return {
    isDragging,
    resizeDirection,
    startDrag,
    startResize
  };
}
