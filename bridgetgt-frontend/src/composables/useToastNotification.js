import { useToast } from "primevue/usetoast";

/**
 * Centralized toast notification composable
 * Provides consistent toast notifications across the application
 */
export function useToastNotification() {
  const toast = useToast();

  /**
   * Show a success toast notification
   * @param {string} summary - Toast title
   * @param {string} detail - Toast message
   * @param {number} life - Duration in milliseconds (default: 3000)
   */
  const showSuccess = (summary, detail, life = 2000) => {
    toast.add({
      severity: "success",
      summary,
      detail,
      type: "create",
      life,
    });
  };

  /**
   * Show an error toast notification
   * @param {string} summary - Toast title
   * @param {string} detail - Toast message
   * @param {number} life - Duration in milliseconds (default: 3000)
   */
  const showError = (summary, detail, life = 3000) => {
    toast.add({
      severity: "error",
      summary,
      detail,
      type: "error",
      life,
    });
  };

  /**
   * Show an edit/info toast notification
   * @param {string} summary - Toast title
   * @param {string} detail - Toast message
   * @param {number} life - Duration in milliseconds (default: 3000)
   */
  const showInfo = (summary, detail, life = 2000) => {
    toast.add({
      severity: "success",
      summary,
      detail,
      type: "edit",
      life,
    });
  };

  /**
   * Show a delete toast notification
   * @param {string} summary - Toast title
   * @param {string} detail - Toast message
   * @param {number} life - Duration in milliseconds (default: 3000)
   */
  const showDelete = (summary, detail, life = 3000) => {
    toast.add({
      severity: "error",
      summary,
      detail,
      type: "delete",
      life,
    });
  };

  /**
   * Show a warning toast notification
   * @param {string} summary - Toast title
   * @param {string} detail - Toast message
   * @param {number} life - Duration in milliseconds (default: 3000)
   */
  const showWarning = (summary, detail, life = 3000) => {
    toast.add({
      severity: "warn",
      summary,
      detail,
      type: "error",
      life,
    });
  };

  /**
   * Show a custom toast notification
   * @param {Object} options - Toast options
   * @param {string} options.severity - Toast severity (success, error, warn, info)
   * @param {string} options.summary - Toast title
   * @param {string} options.detail - Toast message
   * @param {string} options.type - Icon type (create, edit, delete, error)
   * @param {number} options.life - Duration in milliseconds (default: 3000)
   */
  const showCustom = (options) => {
    toast.add({
      severity: options.severity || "info",
      summary: options.summary,
      detail: options.detail,
      type: options.type || "create",
      life: options.life || 3000,
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showDelete,
    showWarning,
    showCustom,
  };
}
