import { ref, onMounted, onBeforeUnmount } from "vue"

export function usePanelResize(initialWidth = 700, minWidth = 600, maxWidth = 1000) {
  const leftPanelWidth = ref(initialWidth)
  let isResizing = false

  const startResizing = () => { isResizing = true }
  const stopResizing = () => { isResizing = false }
  const resize = (e) => {
    if (!isResizing) return
    const newWidth = Math.min(maxWidth, Math.max(minWidth, e.clientX))
    leftPanelWidth.value = newWidth
  }

  onMounted(() => {
    window.addEventListener("mousemove", resize)
    window.addEventListener("mouseup", stopResizing)
  })
  onBeforeUnmount(() => {
    window.removeEventListener("mousemove", resize)
    window.removeEventListener("mouseup", stopResizing)
  })

  // Simple resize handler for direct event binding
  const startResize = (event, props, emit) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = props.width;

    function onMouseMove(e) {
      const delta = e.clientX - startX;
      const newWidth = startWidth + delta;
      emit('resize', newWidth);
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  return { leftPanelWidth, startResizing, minWidth, startResize }
}
