/**
 * Gantt Chart Color Utilities
 * Generates random colors for timeline bars
 */

// Modern, vibrant color palette for Gantt bars
export const GANTT_BAR_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F43F5E', // Rose
  '#8B5CF6', // Violet
  '#0EA5E9', // Sky
  '#22C55E', // Emerald
];

/**
 * Generate a random color for a new task
 * @returns {string} Hex color code
 */
export function generateRandomTaskColor() {
  const randomIndex = Math.floor(Math.random() * GANTT_BAR_COLORS.length);
  return GANTT_BAR_COLORS[randomIndex];
}

/**
 * Get a color with opacity
 * @param {string} color - Hex color code
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} RGBA color string
 */
export function getColorWithOpacity(color, opacity = 0.1) {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Darken a color for hover effects
 * @param {string} color - Hex color code
 * @param {number} amount - Amount to darken (0-100)
 * @returns {string} Darkened hex color
 */
export function darkenColor(color, amount = 20) {
  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - amount);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
