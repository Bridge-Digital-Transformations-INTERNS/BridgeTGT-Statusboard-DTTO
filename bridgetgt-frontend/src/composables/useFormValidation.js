import { ref } from "vue";

/**
 * Reusable form validation composable
 * Centralizes common validation patterns
 */
export function useFormValidation() {
  const errors = ref({});

  const validateRequired = (value, fieldName) => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return `${fieldName} is required`;
    }
    return null;
  };

  const validateArrayNotEmpty = (array, fieldName) => {
    if (!array || !Array.isArray(array) || array.length === 0) {
      return `Please select at least one ${fieldName}`;
    }
    return null;
  };

  const setError = (field, message) => {
    errors.value[field] = message;
  };

  const clearError = (field) => {
    if (errors.value[field]) {
      delete errors.value[field];
    }
  };

  const clearAllErrors = () => {
    errors.value = {};
  };

  const hasErrors = () => {
    return Object.keys(errors.value).length > 0;
  };

  // Generic validation runner
  const runValidation = (validationRules) => {
    clearAllErrors();

    validationRules.forEach(({ field, value, rules }) => {
      for (const rule of rules) {
        const error = rule(value);
        if (error) {
          setError(field, error);
          break; // Stop at first error for this field
        }
      }
    });

    return !hasErrors();
  };

  return {
    errors,
    validateRequired,
    validateArrayNotEmpty,
    setError,
    clearError,
    clearAllErrors,
    hasErrors,
    runValidation,
  };
}
