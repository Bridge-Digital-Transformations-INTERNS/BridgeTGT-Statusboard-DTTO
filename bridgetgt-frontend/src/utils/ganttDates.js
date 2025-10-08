/**
 * Gantt Chart Date Utilities
 * Handles date calculations and formatting for timeline
 */

/**
 * Calculate the number of days between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of days
 */
export function calculateDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate position of a task bar in the timeline
 * @param {Date|string} taskStart - Task start date
 * @param {Date|string} timelineStart - Timeline start date
 * @param {number} dayWidth - Width of each day in pixels
 * @returns {number} Left position in pixels
 */
export function calculateTaskPosition(taskStart, timelineStart, dayWidth) {
  const daysFromStart = calculateDaysBetween(timelineStart, taskStart);
  return daysFromStart * dayWidth;
}

/**
 * Calculate width of a task bar
 * @param {Date|string} startDate - Task start date
 * @param {Date|string} endDate - Task end date
 * @param {number} dayWidth - Width of each day in pixels
 * @returns {number} Width in pixels
 */
export function calculateTaskWidth(startDate, endDate, dayWidth) {
  const duration = calculateDaysBetween(startDate, endDate);
  return Math.max(duration * dayWidth, 24); // Minimum 24px width
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'medium', 'long')
 * @returns {string} Formatted date string
 */
export function formatDateDisplay(date, format = 'short') {
  if (!date) return 'Not set';
  
  const d = new Date(date);
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'medium':
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    case 'long':
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    default:
      return d.toLocaleDateString();
  }
}

/**
 * Calculate date from pixel position
 * @param {number} pixels - Pixel position
 * @param {Date|string} timelineStart - Timeline start date
 * @param {number} dayWidth - Width of each day in pixels
 * @returns {Date} Calculated date
 */
export function calculateDateFromPosition(pixels, timelineStart, dayWidth) {
  const daysFromStart = Math.round(pixels / dayWidth);
  const date = new Date(timelineStart);
  date.setDate(date.getDate() + daysFromStart);
  return date;
}

/**
 * Check if a date is weekend
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if weekend
 */
export function isWeekend(date) {
  const d = new Date(date);
  const day = d.getDay();
  return day === 0 || day === 6;
}

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if today
 */
export function isToday(date) {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * Add days to a date
 * @param {Date|string} date - Start date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format date to YYYY-MM-DD for API
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateForAPI(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse date from MySQL/API response (handles timezone issues)
 * MySQL returns dates as "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DD"
 * @param {string} dateStr - Date string from API
 * @returns {string} YYYY-MM-DD format
 */
export function parseDateFromAPI(dateStr) {
  if (!dateStr) return null;
  
  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // If in MySQL datetime format (YYYY-MM-DD HH:MM:SS), extract date part
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
    return dateStr.split(' ')[0];
  }
  
  // Parse as date and format properly to avoid timezone issues
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
