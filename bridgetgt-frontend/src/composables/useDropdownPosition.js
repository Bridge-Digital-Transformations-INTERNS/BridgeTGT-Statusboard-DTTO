import { ref, nextTick } from "vue";

export function useDropdownPosition() {
  const dropdownPosition = ref("below");
  const dropdownStyles = ref({});

  const calculateDropdownPosition = async (containerElement, menuElement, options = {}) => {
    const { offset = 4, preferredPosition = "below", alignment = "right" } = options;

    if (!containerElement || !menuElement) return;

    await nextTick();

    const containerRect = containerElement.getBoundingClientRect();
    const menuHeight = menuElement.offsetHeight || 150;
    const menuWidth = menuElement.offsetWidth || 120;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const spaceBelow = viewportHeight - containerRect.bottom;
    const spaceAbove = containerRect.top;
    const spaceRight = viewportWidth - containerRect.left;
    const spaceLeft = containerRect.right;

    let top, left;

    if (preferredPosition === "below" && spaceBelow >= menuHeight + offset) {
      top = containerRect.bottom + offset;
      dropdownPosition.value = "below";
    } else if (spaceAbove >= menuHeight + offset) {
      top = containerRect.top - menuHeight - offset;
      dropdownPosition.value = "above";
    } else {
      top = containerRect.bottom + offset;
      dropdownPosition.value = "below";
    }

    if (alignment === "right") {
      if (spaceRight >= menuWidth) {
        left = containerRect.right - menuWidth;
      } else if (spaceLeft >= menuWidth) {
        left = containerRect.left;
      } else {
        left = Math.max(10, (viewportWidth - menuWidth) / 2);
      }
    } else {
      if (spaceLeft >= menuWidth) {
        left = containerRect.left;
      } else if (spaceRight >= menuWidth) {
        left = containerRect.right - menuWidth;
      } else {
        left = Math.max(10, (viewportWidth - menuWidth) / 2);
      }
    }

    top = Math.max(10, Math.min(top, viewportHeight - menuHeight - 10));
    left = Math.max(10, Math.min(left, viewportWidth - menuWidth - 10));

    dropdownStyles.value = {
      top: `${top}px`,
      left: `${left}px`,
    };

    return { top, left, position: dropdownPosition.value };
  };

  return {
    dropdownPosition,
    dropdownStyles,
    calculateDropdownPosition,
  };
}
