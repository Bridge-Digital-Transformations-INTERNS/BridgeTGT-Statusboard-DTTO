import { reactive, computed } from 'vue';
import { useToastNotification } from "@/composables/useToastNotification";


import { DEFAULT_Developer_COLOR } from '@/constants/common';

/**
 * Composable for managing developer form state and validation
 * @param {Object} developerStore - Developer store instance
 */
export function useDeveloperForm(developerStore) {
const { showSuccess } = useToastNotification();

  const form = reactive({
    name: '',
    roles: [],
    color: '',
    profile_picture: null
  });

  const errors = reactive({
    name: '',
    roles: '',
    profile_picture: ''
  });

  /**
   * Show validation error toast
   */
  function showValidationError(message) {
    showSuccess('Validation Error', message);
  }

  /**
   * Validate form fields
   */
  function validateForm() {
    errors.name = '';
    errors.roles = '';

    if (!form.name.trim()) {
      errors.name = 'Name is required';
      showValidationError('Please enter a name.');
      return false;
    }

    if (form.roles.length === 0) {
      errors.roles = 'At least one role is required';
      showValidationError('Please select at least one role.');
      return false;
    }

    return true;
  }

  /**
   * Get available role options (excluding already selected roles)
   */
  const availableRoleOptions = computed(() => {
    return developerStore.availableRoles
      .filter((role) => !form.roles.some((r) => r === (role.name || role)))
      .map((role) => ({
        value: role.name || role,
        label: role.name || role
      }));
  });

  /**
   * Remove a role from the form
   */
  function removeRole(role) {
    const index = form.roles.indexOf(role);
    if (index > -1) {
      form.roles.splice(index, 1);
    }
  }

  /**
   * Reset form to initial state
   */
  function resetForm() {
    form.name = '';
    form.roles = [];
    form.color = '';
    form.profile_picture = null;
    errors.name = '';
    errors.roles = '';
    errors.profile_picture = '';
  }

  /**
   * Populate form with initial data (for editing)
   */
  function populateForm(data) {
    form.name = data.name || '';
    form.roles = [...(data.roles || [])];
    form.color = data.color || '';
    form.profile_picture = data.profile_picture || null;
  }

  /**
   * Get form data for submission
   */
  function getFormData() {
    return {
      name: form.name.trim(),
      roles: [...form.roles],
      color: form.color || DEFAULT_Developer_COLOR,
      profile_picture: form.profile_picture || null
    };
  }

  /**
   * Handle role changes for existing developer
   */
  async function syncRoles(developerId, previousRoles) {
    const currentRoles = previousRoles || [];

    // Remove roles that are no longer selected
    for (const role of currentRoles) {
      if (!form.roles.includes(role)) {
        const roleObj = developerStore.availableRoles.find(
          (r) => r.name === role || r === role
        );
        if (roleObj?.id) {
          await developerStore.removeRoleFromDeveloper(developerId, roleObj.id);
        }
      }
    }

    // Add newly selected roles
    for (const roleName of form.roles) {
      if (!currentRoles.includes(roleName)) {
        const roleObj = developerStore.availableRoles.find(
          (r) => r.name === roleName || r === roleName
        );
        if (roleObj?.id) {
          await developerStore.assignRoleToDeveloper(developerId, roleObj.id);
        }
      }
    }
  }

  /**
   * Assign roles to a new developer
   */
  async function assignRolesToNewDeveloper(developerId) {
    if (!developerId || form.roles.length === 0) return;

    for (const roleName of form.roles) {
      const roleObj = developerStore.availableRoles.find(
        (r) => r.name === roleName || r === roleName
      );
      if (roleObj?.id) {
        await developerStore.assignRoleToDeveloper(developerId, roleObj.id);
      }
    }
  }

  return {
    form,
    errors,
    availableRoleOptions,
    validateForm,
    removeRole,
    resetForm,
    populateForm,
    getFormData,
    syncRoles,
    assignRolesToNewDeveloper,
    showValidationError
  };
}
