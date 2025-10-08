import { ref, computed } from 'vue';

/**
 * Gantt Tooltip Composable
 * Handles tooltip positioning and visibility for Gantt timeline bars
 */
export function useGanttTooltip() {
  const showTooltip = ref(false);
  const tooltipPosition = ref({ left: '0px', top: '0px' });
  
  const showDevTooltip = ref(false);
  const devTooltipPosition = ref({ left: '0px', top: '0px' });
  const currentDevTooltip = ref('');
  
  const showExtraTooltip = ref(false);
  const extraTooltipPosition = ref({ left: '0px', top: '0px' });

  function updateTooltipPosition(event, tooltipWidth = 220, tooltipHeight = 180) {
    const offset = 15;
    let left = event.clientX + offset;
    let top = event.clientY + offset;
    
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = event.clientX - tooltipWidth - offset;
    }
    
    if (top + tooltipHeight > window.innerHeight - 10) {
      top = event.clientY - tooltipHeight - offset;
    }
    
    if (left < 10) left = 10;
    if (top < 10) top = 10;
    
    tooltipPosition.value = {
      left: `${left}px`,
      top: `${top}px`
    };
  }

  function showMainTooltip(event) {
    showTooltip.value = true;
    updateTooltipPosition(event);
  }

  function hideMainTooltip() {
    showTooltip.value = false;
  }

  function showDeveloperTooltip(dev, event) {
    currentDevTooltip.value = dev.name || dev.username;
    showDevTooltip.value = true;
    
    const rect = event.target.getBoundingClientRect();
    const tooltipWidth = 150;
    
    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let top = rect.top - 30;
    
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }
    if (top < 10) top = rect.bottom + 8;
    
    devTooltipPosition.value = {
      left: `${left}px`,
      top: `${top}px`
    };
  }

  function hideDeveloperTooltip() {
    showDevTooltip.value = false;
  }

  function showExtraAssigneesTooltip(event) {
    showExtraTooltip.value = true;
    
    const rect = event.target.getBoundingClientRect();
    const tooltipWidth = 150;
    
    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let top = rect.top - 30;
    
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }
    if (top < 10) top = rect.bottom + 8;
    
    extraTooltipPosition.value = {
      left: `${left}px`,
      top: `${top}px`
    };
  }

  function hideExtraAssigneesTooltip() {
    showExtraTooltip.value = false;
  }

  return {
    showTooltip,
    tooltipPosition,
    showDevTooltip,
    devTooltipPosition,
    currentDevTooltip,
    showExtraTooltip,
    extraTooltipPosition,
    updateTooltipPosition,
    showMainTooltip,
    hideMainTooltip,
    showDeveloperTooltip,
    hideDeveloperTooltip,
    showExtraAssigneesTooltip,
    hideExtraAssigneesTooltip
  };
}
