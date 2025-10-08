<template>
  <Modal
    :open="open"
    :title="isEdit ? 'Edit Task' : 'Add Task'"
    :saving="isSaving"
    @cancel="close"
    @confirm="save"
  >
    <div class="flex flex-col gap-6">
      <!-- General Info -->
      <div>
        <h3 class="text-slate-700 font-semibold mb-3">General Information</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="text-sm font-medium">Task Title<span class="text-red-500">*</span></label>
            <input
              v-model="form.title"
              class="p-2 border border-slate-200 rounded w-full"
              :class="{ 'border-red-500': errors.title }"
              placeholder="Task name"
            />
            <div v-if="errors.title" class="text-red-500 text-xs mt-1">
              {{ errors.title }}
            </div>
          </div>

          <div>
            <label class="text-sm font-medium">Phase</label>
            <BaseDropdown
              v-model="form.phase"
              :options="phaseOptions"
              placeholder="Select Phase"
            />
          </div>

          <div>
            <label class="text-sm font-medium">Weight</label>
            <BaseDropdown
              v-model="form.weight"
              :options="WEIGHT_OPTIONS"
              placeholder="Select Weight"
            />
          </div>

          <div>
            <label class="text-sm font-medium">Status</label>
            <BaseDropdown
              v-model="form.status"
              :options="statusOptions"
              placeholder="Select Status"
            />
          </div>
        </div>

        <div class="mt-3">
          <label class="text-sm font-medium">Assign to<span class="text-red-500">*</span></label>
          <DeveloperDropdown
            v-model="form.assigneeIds"
            placeholder="Select developers"
            :hasError="!!errors.assigneeIds"
          />
          <div v-if="errors.assigneeIds" class="text-red-500 text-xs mt-1">
            {{ errors.assigneeIds }}
          </div>
        </div>
      </div>

      <!-- Schedule -->
      <div>
        <h3 class="text-slate-700 font-semibold mb-3">Schedule</h3>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium mb-2 block">
              Start Date <span class="text-red-500">*</span>
            </label>
            <DatePicker
              v-model="form.startDate"
              placeholder="Select start date"
              :max-date="form.targetDate || form.endDate"
              :class="{ 'border-red-500': errors.startDate }"
            />
            <div v-if="errors.startDate" class="text-red-500 text-xs mt-1">
              {{ errors.startDate }}
            </div>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">
              Target Date <span class="text-red-500">*</span>
            </label>
            <DatePicker
              v-model="form.targetDate"
              placeholder="Select target date"
              :min-date="form.startDate"
              :max-date="form.endDate"
              :class="{ 'border-red-500': errors.targetDate }"
            />
            <div v-if="errors.targetDate" class="text-red-500 text-xs mt-1">
              {{ errors.targetDate }}
            </div>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">End Date</label>
            <DatePicker
              v-model="form.endDate"
              placeholder="Select end date"
              :min-date="form.startDate || form.targetDate"
            />
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref } from "vue";
import Modal from "@/components/modals/ModalCom.vue";
import BaseDropdown from "@/components/dropdowns/BaseDropdown.vue";
import DeveloperDropdown from "@/components/dropdowns/DeveloperDropdown.vue";
import DatePicker from "@/components/calendar/DatePicker.vue";
import { useForm } from "@/composables/useForm";
import { useFilterOptions } from "@/composables/useFilterOptions";
import { WEIGHT_OPTIONS, TASK_WEIGHTS, TASK_STATUSES, PHASE_OPTIONS } from "@/constants/common";
import { useToastNotification } from "@/composables/useToastNotification";
const { showSuccess,showError } = useToastNotification();

const props = defineProps({ open: Boolean, isEdit: Boolean, initial: Object });
const emits = defineEmits(["close", "save"]);
const isSaving = ref(false);

const { phaseOptions, statusOptions } = useFilterOptions();

const emptyForm = {
  title: "",
  phase: PHASE_OPTIONS[0],
  weight: TASK_WEIGHTS.LIGHT,
  status: TASK_STATUSES.PENDING,
  assigneeIds: [],
  startDate: null,
  targetDate: null,
  endDate: null,
};

const { form, errors, submitForm, closeForm } = useForm(emptyForm, props, emits);

function close() {
  closeForm();
}

function save() {
  const isValid = submitForm();

  if (!isValid) {
    // Check if date errors exist for more specific message
    if (errors.value.startDate || errors.value.targetDate) {
      showError("Missing Required Dates", "Start date and target date are required to create a task.");
    } else {
      showError("Validation Error", "Please correct the errors in the form.");
    }
    return;
  }

  isSaving.value = true;

  const taskData = {
    title: form.value.title,
    phase: form.value.phase,
    weight: form.value.weight,
    status: form.value.status,
    assigneeIds: form.value.assigneeIds,
  };

  if (form.value.startDate) {
    taskData.startDate = form.value.startDate;
  }
  if (form.value.targetDate) {
    taskData.targetDate = form.value.targetDate;
  }
  if (form.value.endDate) {
    taskData.endDate = form.value.endDate;
  }

  // Emit save with a callback to handle completion
  emits("save", taskData, () => {
    isSaving.value = false;
    showSuccess(
      props.isEdit ? "Task Updated" : "Task Created",
      props.isEdit
        ? "Task has been updated successfully!"
        : "New task has been created successfully!"
    );

    closeForm();
  });
}
</script>
