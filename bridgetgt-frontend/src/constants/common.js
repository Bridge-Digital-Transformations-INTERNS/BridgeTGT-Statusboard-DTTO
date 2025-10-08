/**
 * COMMON CONSTANTS AND HELPERS
 * Centralizes hardcoded strings, values, and utilities used throughout the application
 */

/* ==============================
   ASSETS
   ============================== */
export const ASSET_PATHS = {
  BRIDGE_ICON: "/BRIDGE LOGOS_Icon.png",
  BRIDGE_LOGO: "/bridge-logo.png",
};

/* ==============================
   STORAGE KEYS
   ============================== */
export const STORAGE_KEYS = {
  // Legacy access store keys
  BRIDGE_TOKEN: "bridgeTGT_token",
  BRIDGE_TIMESTAMP: "bridgeTGT_timestamp",
  // GitHub auth keys
  GITHUB_SESSION: "github_session",
  GITHUB_USER: "github_user",
  // Other storage keys
  LOCKOUT_TIMESTAMP: "lockoutTimestamp",
  USER_PREFERENCES: "user_preferences",
};

/* ==============================
   TIME CONSTANTS (ms)
   ============================== */
export const TIME_CONSTANTS = {
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, 
  LOCKOUT_TIME: 15 * 60 * 1000, 
  POLLING_INTERVAL: 100,
  DEFAULT_TIMEOUT: 5000,
};

/* ==============================
   AUTHENTICATION
   ============================== */
export const AUTH_CONSTANTS = {
  MAX_LOGIN_ATTEMPTS: 3,
  SESSION_PREFIX: "bridge",
  GITHUB_SCOPES: "user:email read:org",
};

/* ==============================
   USER INTERFACE
   ============================== */
export const UI_CONSTANTS = {
  DEFAULT_AVATAR_INITIALS: "U",
  MAX_INITIALS_LENGTH: 2,
  DROPDOWN_CLOSE_DELAY: 100,
};

/* ==============================
   ERROR MESSAGES
   ============================== */
export const ERROR_MESSAGES = {
  AUTH_FAILED: "Authentication failed",
  TOKEN_EXPIRED: "Session has expired",
  NETWORK_ERROR: "Network connection error",
  VALIDATION_FAILED: "Validation failed",
  UNKNOWN_ERROR: "An unknown error occurred",
  INITIALIZATION_FAILED: "Authentication initialization failed",
};

/* ==============================
   MODAL TYPES
   ============================== */
export const MODAL_TYPES = {
  TASK: "task",
  PROJECT: "project",
  DEVELOPER: "developer",
  DELETE_CONFIRM: "deleteConfirm",
  CONFIRM_DELETE: "confirmDelete",
};

/* ==============================
   ROUTES
   ============================== */
export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/",
  DEVELOPER: "/developer",
  ACTIVITY_LOG: "/activity-log",
  UNAUTHORIZED: "/unauthorized",
  AUTH_CALLBACK: "/auth/callback",
};

/* ==============================
   TASK CARD STYLING
   ============================== */
export const TASK_CARD_CLASSES = {
  completed: "border-green-200 bg-gradient-to-br from-white to-green-50",
  validated: "border-purple-200 bg-gradient-to-br from-white to-purple-50",
  "in-progress": "border-amber-200 bg-gradient-to-br from-white to-amber-50",
  pending: "border-slate-200 bg-gradient-to-br from-white to-slate-50",
  default: "border-slate-200",
};

export function getTaskCardClass(status) {
  return TASK_CARD_CLASSES[status] || TASK_CARD_CLASSES.default;
}

/* ==============================
   PROJECT PHASES
   ============================== */
export const PROJECT_PHASES = [
  "Overall",
  "Planning & Analysis",
  "Designing",
  "Implementation",
  "Testing/QA",
  "Deployment",
];

export const PHASE_OPTIONS = PROJECT_PHASES.filter(
  (phase) => phase !== "Overall",
);

/* ==============================
   TASK WEIGHTS
   ============================== */
export const TASK_WEIGHTS = {
  LIGHT: "light",
  MEDIUM: "medium",
  HEAVY: "heavy",
};

export const WEIGHT_LABELS = {
  [TASK_WEIGHTS.LIGHT]: "Light",
  [TASK_WEIGHTS.MEDIUM]: "Medium",
  [TASK_WEIGHTS.HEAVY]: "Heavy",
};

export const WEIGHT_OPTIONS = [
  { value: TASK_WEIGHTS.LIGHT, label: WEIGHT_LABELS[TASK_WEIGHTS.LIGHT] },
  { value: TASK_WEIGHTS.MEDIUM, label: WEIGHT_LABELS[TASK_WEIGHTS.MEDIUM] },
  { value: TASK_WEIGHTS.HEAVY, label: WEIGHT_LABELS[TASK_WEIGHTS.HEAVY] },
];

export const WEIGHT_POINTS = {
  [TASK_WEIGHTS.LIGHT]: 1,
  [TASK_WEIGHTS.MEDIUM]: 2,
  [TASK_WEIGHTS.HEAVY]: 3,
};

/* ==============================
   CATEGORY COLORS
   ============================== */
export const CATEGORY_COLORS = {
  SOLID: {
    [TASK_WEIGHTS.LIGHT]: "bg-emerald-500",
    [TASK_WEIGHTS.MEDIUM]: "bg-amber-500",
    [TASK_WEIGHTS.HEAVY]: "bg-rose-500",
  },
  TEXT: {
    [TASK_WEIGHTS.LIGHT]: "text-emerald-600",
    [TASK_WEIGHTS.MEDIUM]: "text-amber-600",
    [TASK_WEIGHTS.HEAVY]: "text-rose-600",
  },
  BADGE: {
    [TASK_WEIGHTS.LIGHT]: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    [TASK_WEIGHTS.MEDIUM]: "bg-amber-50 text-amber-700 border border-amber-200",
    [TASK_WEIGHTS.HEAVY]: "bg-rose-50 text-rose-700 border border-rose-200",
  },
};

/* ==============================
   TASK STATUSES
   ============================== */
export const TASK_STATUSES = {
  PENDING: "pending",
  IN_PROGRESS: "inprogress",
  COMPLETED: "completed",
  VALIDATED: "validated",
  CANCELLED: "cancelled",
  ON_HOLD: "onhold",
};

export const STATUS_LABELS = {
  [TASK_STATUSES.PENDING]: "Pending",
  [TASK_STATUSES.IN_PROGRESS]: "In Progress",
  [TASK_STATUSES.COMPLETED]: "Completed",
  [TASK_STATUSES.VALIDATED]: "Validated",
  [TASK_STATUSES.CANCELLED]: "Cancelled",
  [TASK_STATUSES.ON_HOLD]: "On Hold",
};

export const STATUS_OPTIONS = [
  { value: TASK_STATUSES.PENDING, label: STATUS_LABELS[TASK_STATUSES.PENDING] },
  {
    value: TASK_STATUSES.IN_PROGRESS,
    label: STATUS_LABELS[TASK_STATUSES.IN_PROGRESS],
  },
  {
    value: TASK_STATUSES.COMPLETED,
    label: STATUS_LABELS[TASK_STATUSES.COMPLETED],
  },
  {
    value: TASK_STATUSES.VALIDATED,
    label: STATUS_LABELS[TASK_STATUSES.VALIDATED],
  },
];

/* ==============================
   GANTT CHART CONSTANTS
   ============================== */
export const GANTT_CONSTANTS = {
  MIN_DAY_WIDTH: 15,
  MAX_DAY_WIDTH: 60,
  DEFAULT_DAY_WIDTH: 30,
  ZOOM_STEP: 5,
  MIN_LEFT_PANEL_WIDTH: 220,
  DEFAULT_LEFT_PANEL_WIDTH: 420,
  MIN_TASK_BAR_WIDTH: 24,
};

export const GANTT_COLORS = {
  PROJECT_BACKGROUND: "bg-blue-50",
  PROJECT_HOVER: "bg-blue-100",
  PROJECT_TEXT: "text-blue-900",
  PROJECT_INDICATOR: "bg-blue-500",

  PHASE_BACKGROUND: "bg-gray-50",
  PHASE_HOVER: "bg-gray-100",
  PHASE_TEXT: "text-gray-700",
  PHASE_BORDER: "border-l-gray-300",
  PHASE_INDICATOR: "bg-gray-500",

  WEEKEND_BACKGROUND: "bg-blue-50",
  WEEKEND_BORDER: "border-blue-200",
  TODAY_BACKGROUND: "bg-yellow-100",
  TODAY_TEXT: "text-yellow-800",
  TODAY_LINE: "bg-red-500",
  TODAY_GUIDE: "bg-red-200",
};

export const BRAND_COLORS = {
  lime: "#e3ea4e",
  palm: "#349083",
  sticky: "#2b2a2a",
  powder: "#a8bfd3",
  cream: "#fff4de",
  cacao: "#352623",
  progressGradient: "bg-gradient-to-r from-[#e3ea4e] to-[#349083]",
};

export const GANTT_STATUS_STYLES = {
  TASK_BAR_COLORS: {
    [TASK_STATUSES.PENDING]: "bg-[#e67a3f]",
    [TASK_STATUSES.IN_PROGRESS]: "bg-[#6faed9]",
    [TASK_STATUSES.COMPLETED]: "bg-[#2f4c91]",
    [TASK_STATUSES.VALIDATED]: "bg-[#5b3c88]",
  },
  PROGRESS_BAR_COLORS: {
    [TASK_STATUSES.PENDING]: "bg-[#e67a3f]",
    [TASK_STATUSES.IN_PROGRESS]: "bg-[#6faed9]",
    [TASK_STATUSES.COMPLETED]: BRAND_COLORS.progressGradient,
    [TASK_STATUSES.VALIDATED]: "bg-[#5b3c88]",
  },
  BORDER_COLORS: {
    [TASK_STATUSES.PENDING]: "border-l-[#e67a3f]",
    [TASK_STATUSES.IN_PROGRESS]: "border-l-[#6faed9]",
    [TASK_STATUSES.COMPLETED]: "border-l-[#2f4c91]",
    [TASK_STATUSES.VALIDATED]: "border-l-[#5b3c88]",
  },
};

/* ==============================
   GANTT HELPER FUNCTIONS
   ============================== */
export function getGanttTaskBarClass(status) {
  return (
    GANTT_STATUS_STYLES.TASK_BAR_COLORS[status] ||
    GANTT_STATUS_STYLES.TASK_BAR_COLORS[TASK_STATUSES.PENDING]
  );
}

export function getGanttProgressBarClass(status) {
  return (
    GANTT_STATUS_STYLES.PROGRESS_BAR_COLORS[status] ||
    GANTT_STATUS_STYLES.PROGRESS_BAR_COLORS[TASK_STATUSES.PENDING]
  );
}

export function getGanttBorderClass(status) {
  return (
    GANTT_STATUS_STYLES.BORDER_COLORS[status] ||
    GANTT_STATUS_STYLES.BORDER_COLORS[TASK_STATUSES.PENDING]
  );
}

export function calculateGanttProgress(status) {
  switch (status) {
    case TASK_STATUSES.COMPLETED:
      return 100;
    case TASK_STATUSES.VALIDATED:
      return 100;
    case TASK_STATUSES.IN_PROGRESS:
      return 50;
    case TASK_STATUSES.PENDING:
      return 0;
    default:
      return 0;
  }
}

export function formatGanttDate(date) {
  if (!date) return "Not set";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* ==============================
   DEVELOPER ROLES AND COLORS
   ============================== */
export const AVAILABLE_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Product Designer",
  "DevOps",
  "QA Engineer",
  "Project Manager",
  "Tech Lead",
  "Mobile Developer",
];

export const AVAILABLE_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#EC4899",
  "#6366F1",
];
export const DEFAULT_Developer_COLOR = "#94A3B8";

export const TIMELINE_BAR_COLORS = [
  "#60A5FA", 
  "#34D399", 
  "#A78BFA", 
  "#F472B6", 
  "#FBBF24", 
  "#FB923C", 
  "#4ADE80", 
  "#C084FC", 
  "#38BDF8", 
  "#F87171", 
];

export const COLOR_MAP = {
  "#EF4444": "Red",
  "#F97316": "Orange",
  "#EAB308": "Yellow",
  "#22C55E": "Green",
  "#3B82F6": "Blue",
  "#8B5CF6": "Purple",
  "#EC4899": "Pink",
  "#94A3B8": "Gray",
};

/* ==============================
   DEFAULT EXPORT
   ============================== */
export default {
  DEFAULT_Developer_COLOR,
  COLOR_MAP,
  ASSET_PATHS,
  STORAGE_KEYS,
  TIME_CONSTANTS,
  AUTH_CONSTANTS,
  UI_CONSTANTS,
  ERROR_MESSAGES,
  MODAL_TYPES,
  ROUTES,
  TASK_CARD_CLASSES,
  getTaskCardClass,
  PROJECT_PHASES,
  PHASE_OPTIONS,
  TASK_WEIGHTS,
  WEIGHT_LABELS,
  WEIGHT_OPTIONS,
  WEIGHT_POINTS,
  CATEGORY_COLORS,
  TASK_STATUSES,
  STATUS_LABELS,
  STATUS_OPTIONS,
  AVAILABLE_ROLES,
  AVAILABLE_COLORS,
  TIMELINE_BAR_COLORS,
  GANTT_CONSTANTS,
  GANTT_COLORS,
  GANTT_STATUS_STYLES,
  getGanttTaskBarClass,
  getGanttProgressBarClass,
  getGanttBorderClass,
  calculateGanttProgress,
  formatGanttDate,
};