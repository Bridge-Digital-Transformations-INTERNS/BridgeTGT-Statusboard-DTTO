import { TASK_STATUSES, STATUS_LABELS } from "@/constants/common";

export function useStatusConfig() {
  const statusConfigs = {
    [TASK_STATUSES.PENDING]: {
      label: STATUS_LABELS[TASK_STATUSES.PENDING],
      badge: {
        bgClass: "bg-yellow-100",
        textClass: "text-yellow-600",
        borderClass: "border-yellow-50",
      },
      dropdown: {
        bgClass: "bg-white",
        textClass: "text-yellow-600",
        borderClass: "border-yellow-50",
      },
    },
    [TASK_STATUSES.IN_PROGRESS]: {
      label: STATUS_LABELS[TASK_STATUSES.IN_PROGRESS],
      badge: {
        bgClass: "bg-blue-100",
        textClass: "text-blue-600",
        borderClass: "border-blue-50",
      },
      dropdown: {
        bgClass: "bg-white",
        textClass: "text-blue-600",
        borderClass: "border-blue-50",
      },
    },
    [TASK_STATUSES.COMPLETED]: {
      label: STATUS_LABELS[TASK_STATUSES.COMPLETED],
      badge: {
        bgClass: "bg-green-100",
        textClass: "text-green-600",
        borderClass: "border-green-50",
      },
      dropdown: {
        bgClass: "bg-white",
        textClass: "text-green-600",
        borderClass: "border-green-50",
      },
    },
    [TASK_STATUSES.VALIDATED]: {
      label: STATUS_LABELS[TASK_STATUSES.VALIDATED],
      badge: {
        bgClass: "bg-purple-100",
        textClass: "text-purple-600",
        borderClass: "border-purple-50",
      },
      dropdown: {
        bgClass: "bg-white",
        textClass: "text-purple-600",
        borderClass: "border-purple-50",
      },
    },
  };

  const getStatusConfig = (status, validated = false, variant = "badge") => {
    const statusKey = status;

    const config = statusConfigs[statusKey];
    if (!config) {
      return {
        label: "Unknown",
        bgClass: "bg-gray-200",
        textClass: "text-gray-600",
        borderClass: "border-gray-50",
      };
    }

    return {
      label: config.label,
      ...config[variant],
    };
  };

  const getDropdownStatusConfig = (status) => getStatusConfig(status, false, "dropdown");
 const statusColors = {
    [TASK_STATUSES.PENDING]: '#9CA3AF',      // Gray
    [TASK_STATUSES.IN_PROGRESS]: '#F59E0B',  // Amber
    [TASK_STATUSES.COMPLETED]: '#10B981',    // Green
    [TASK_STATUSES.VALIDATED]: '#8B5CF6',    // Purple
    [TASK_STATUSES.CANCELLED]: '#EF4444',    // Red
    [TASK_STATUSES.ON_HOLD]: '#6B7280',      // Dark Gray
  }

  // Weight color mapping
  const weightColors = {
    light: '#10B981',   // Green
    medium: '#F59E0B',  // Amber
    heavy: '#EF4444',   // Red
  }

  // Phase colors for visual distinction
  const phaseColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6B7280', // Gray
  ]

  // Get status color
  const getStatusColor = (status) => {
    return statusColors[status] || '#6B7280'
  }

  // Get weight color
  const getWeightColor = (weight) => {
    return weightColors[weight] || '#6B7280'
  }

  // Get phase color by index
  const getPhaseColor = (index) => {
    return phaseColors[index % phaseColors.length]
  }

  // Get status display text
  const getStatusText = (status) => {
    const statusMap = {
      [TASK_STATUSES.PENDING]: 'Pending',
      [TASK_STATUSES.IN_PROGRESS]: 'In Progress',
      [TASK_STATUSES.COMPLETED]: 'Completed',
      [TASK_STATUSES.VALIDATED]: 'Validated',
      [TASK_STATUSES.CANCELLED]: 'Cancelled',
      [TASK_STATUSES.ON_HOLD]: 'On Hold',
    }
    return statusMap[status] || 'Unknown'
  }

  // Get weight display text
  const getWeightText = (weight) => {
    if (!weight) return 'Unknown'
    return weight.charAt(0).toUpperCase() + weight.slice(1)
  }

  // Get priority level for sorting
  const getWeightPriority = (weight) => {
    const priorities = { heavy: 3, medium: 2, light: 1 }
    return priorities[weight] || 0
  }

  // Get status priority for sorting
  const getStatusPriority = (status) => {
    const priorities = {
      [TASK_STATUSES.IN_PROGRESS]: 5,
      [TASK_STATUSES.PENDING]: 4,
      [TASK_STATUSES.COMPLETED]: 3,
      [TASK_STATUSES.VALIDATED]: 2,
      [TASK_STATUSES.ON_HOLD]: 1,
      [TASK_STATUSES.COMPLETED]: 1,
      [TASK_STATUSES.CANCELLED]: 0
    }
    return priorities[status] || 0
  }
  return {
    getStatusConfig,
    getDropdownStatusConfig,
    statusColors,
    weightColors,
    phaseColors,
    getStatusColor,
    getWeightColor,
    getPhaseColor,
    getStatusText,
    getWeightText,
    getWeightPriority,
    getStatusPriority
  };
}
