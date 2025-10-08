<template>
  <Modal
    :open="open"
    :title="title"
    :saving="saving"
    :confirmText="confirmText"
    :cancelText="cancelText"
    :confirmClass="confirmClass"
    @cancel="handleCancel"
    @confirm="handleConfirm"
  >
    <p class="text-sm text-gray-600">{{ message }}</p>
  </Modal>
</template>

<script setup>
import { ref, watch } from "vue";
import Modal from "@/components/modals/ModalCom.vue";

const props = defineProps({
  open: Boolean,
  title: String,
  message: String,
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  confirmClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(["cancel", "confirm"]);

const saving = ref(false);

function handleConfirm() {
  saving.value = true;

  const done = () => {
    saving.value = false;
  };

  emit("confirm", done);
}

function handleCancel() {
  if (!saving.value) {
    emit("cancel");
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      saving.value = false; 
    }
  }
);
</script>
