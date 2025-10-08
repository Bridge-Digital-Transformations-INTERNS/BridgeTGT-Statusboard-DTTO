import { ref, watch } from "vue";
import { useFormValidation } from "@/composables/useFormValidation";
import { parseDateFromAPI } from "@/utils/ganttDates";

function formatDateForPicker(dateStr) {
  return parseDateFromAPI(dateStr) || "";
}

export function useForm(initialForm, props, emits) {
  const form = ref({ ...initialForm });
  const { errors, validateRequired, validateArrayNotEmpty, clearAllErrors, runValidation } =
    useFormValidation();

  // Watch for changes in initial data
  if (props) {
    watch(
      () => props.initial,
      (val) => {
        if (val) {
          const mergedData = { ...initialForm, ...val };
          
          if (val.startDate) {
            mergedData.startDate = formatDateForPicker(val.startDate);
          }
          if (val.targetDate) {
            mergedData.targetDate = formatDateForPicker(val.targetDate);
          }
          if (val.endDate) {
            mergedData.endDate = formatDateForPicker(val.endDate);
          }

          if (val.assignees && Array.isArray(val.assignees)) {
            mergedData.assigneeIds = val.assignees.map((dev) => dev.id);
          } else if (val.assigneeIds && Array.isArray(val.assigneeIds)) {
            mergedData.assigneeIds = val.assigneeIds;
          } else {
            mergedData.assigneeIds = [];
          }

          form.value = mergedData;
        } else {
          form.value = { ...initialForm };
        }
        errors.value = {};
      },
      { immediate: true, deep: true } 
    );
  }

  const resetForm = () => {
    form.value = { ...initialForm };
    clearAllErrors();
  };

  const updateForm = (field, value) => {
    form.value[field] = value;
    if (errors.value[field]) {
      delete errors.value[field];
    }
  };

  const validateForm = () => {
    const validationRules = [
      {
        field: "title",
        value: form.value.title,
        rules: [(value) => validateRequired(value, "Task title")],
      },
      {
        field: "assigneeIds",
        value: form.value.assigneeIds,
        rules: [(value) => validateArrayNotEmpty(value, "assignee")],
      },
      {
        field: "startDate",
        value: form.value.startDate,
        rules: [(value) => validateRequired(value, "Start date")],
      },
      {
        field: "targetDate",
        value: form.value.targetDate,
        rules: [(value) => validateRequired(value, "Target date")],
      },
    ];

    return runValidation(validationRules);
  };

  const submitForm = () => {
    return validateForm();
  };

  const closeForm = () => {
    if (emits) {
      emits("close");
    }
    form.value = { ...initialForm };
    clearAllErrors();
  };

  return {
    form,
    errors,
    resetForm,
    updateForm,
    validateForm,
    submitForm,
    closeForm,
  };
}