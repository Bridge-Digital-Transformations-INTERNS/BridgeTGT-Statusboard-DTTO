import { onMounted, onUnmounted } from "vue";

export function useClickOutside(elementRef, callback) {
  const handleClickOutside = (event) => {
    if (!elementRef || !elementRef.value) return;

    //GET ROOT ELEMENT
    const el = elementRef.value.$el ?? elementRef.value;

    if (!el.contains(event.target)) {
      callback(event);
    }
  };

  onMounted(() => {
    document.addEventListener("click", handleClickOutside, true);
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside, true);
  });

  return {
    handleClickOutside,
  };
}
