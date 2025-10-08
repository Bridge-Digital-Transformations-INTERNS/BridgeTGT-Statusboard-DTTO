import { UI_CONSTANTS } from "@/constants/common";
import { COLOR_MAP } from "@/constants/common";

export function getColorName(color) {
  return COLOR_MAP[color] || "Unknown";
}
const entityLabels = {
  project: "Project",
  task: "Task",
  user: "User",
  account: "Account",
  file: "File",

};
/**
 * UI utility functions
 * Common UI-related helper functions used across components
 */

/**
 * Generate initials from a name for avatar fallback
 * @param {string} name - The name to generate initials from
 * @returns {string} - Generated initials (max 2 characters)
 */
export function getInitials(name) {
  if (!name || typeof name !== "string") return UI_CONSTANTS.DEFAULT_AVATAR_INITIALS;

  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, UI_CONSTANTS.MAX_INITIALS_LENGTH);
}

/**
 * Generate a consistent avatar configuration
 * @param {Object} user - User object with name, avatar, etc.
 * @returns {Object} - Avatar configuration object
 */
export function getAvatarConfig(user) {
  if (!user) {
    return {
      initials: UI_CONSTANTS.DEFAULT_AVATAR_INITIALS,
      hasAvatar: false,
      avatar: null,
    };
  }
  const name = user.name || user.username || user.email || "";
  const initials = getInitials(name);
  const hasAvatar = !!(user.avatar || user.avatar_url);

  return {
    initials,
    hasAvatar,
    avatar: user.avatar || user.avatar_url || null,
    name,
  };
}

/**
 * Format user display name consistently
 * @param {Object} user - User object
 * @returns {string} - Formatted display name
 */
export function formatUserName(user) {
  if (!user) return "Unknown User";

  return user.name || user.full_name || user.username || user.email?.split("@")[0] || "User";
}

/**
 * Get user profile data in a consistent format
 * @param {Object} user - Raw user object from different sources
 * @returns {Object} - Standardized user profile
 */
export function standardizeUserProfile(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: formatUserName(user),
    username: user.username || user.user_name,
    email: user.email,
    avatar: user.avatar || user.avatar_url || user.user_metadata?.avatar_url,
    isGitHubUser: !!(user.user_metadata || user.github_id || user.githubId),
    ...getAvatarConfig(user),
  };
}
export function getEntityDisplayName(entity) {
  if (!entity) return "Unnamed";
  if (typeof entity === "string") {
    return entityLabels[entity] || entity.charAt(0).toUpperCase() + entity.slice(1);
  }
  if (typeof entity === "object") {
    if (entity.name) return entity.name;
    if (entity.title) return entity.title;
    if (entity.username) return entity.username;
    if (entity.label) return entity.label;
  }

  return "Unnamed";
}

export default {
  getEntityDisplayName,
  getInitials,
  getAvatarConfig,
  formatUserName,
  standardizeUserProfile,
};
