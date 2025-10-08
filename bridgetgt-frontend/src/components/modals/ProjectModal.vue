<template>
  <Modal
    :open="open"
    :title="isEdit ? 'Edit Project' : 'Add Project'"
    @cancel="close"
    @confirm="save"
  >
    <div class="flex flex-col gap-3">
      <label class="text-sm font-medium">Project Name<span class="text-red-500">*</span></label>
      <input
        v-model="name"
        class="p-2 border border-slate-200 rounded outline-none"
        :class="{ 'border-red-500': error }"
        placeholder="Enter project name"
      />
      <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
    </div>
  </Modal>
</template>

<script setup>
import Modal from "@/components/modals/ModalCom.vue";
import { ref, watch } from "vue";
import { useToastNotification } from "@/composables/useToastNotification";
const { showSuccess,showError  } = useToastNotification();

const props = defineProps({ 
  open: Boolean, 
  isEdit: Boolean, 
  initial: Object 
});
const emits = defineEmits(["close", "save"]);
const name = ref("");
const error = ref("");

watch(
  () => ({ open: props.open, isEdit: props.isEdit, initial: props.initial }),
  ({ open, isEdit, initial }) => {
    if (open) {
      if (isEdit && initial && initial.name) {
        name.value = initial.name;
      } else {
        name.value = "";
      }
      error.value = "";
    }
  },
  { immediate: true, deep: true }
);

function close() {
  error.value = "";
  name.value = "";
  emits("close");
}


function save() {
  if (!name.value.trim()) {
    error.value = "Project name is required";
    showError("Validation Error","Project name is required");
    return;
  }

  emits("save", {
    name: name.value.trim(),
  });
  close();
}
</script>
