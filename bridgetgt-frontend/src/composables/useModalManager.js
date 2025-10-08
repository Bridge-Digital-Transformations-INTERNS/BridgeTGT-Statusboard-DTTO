import { useModal, useConfirmModal } from "@/composables/useModal";
import { MODAL_TYPES } from "@/constants/common";

/**
 * Enhanced centralized modal manager for common modal patterns
 * Reduces code duplication across components and standardizes modal operations
 */
export function useModalManager(modalTypes = []) {
  const modals = {};

  // Create modals based on requested types
  modalTypes.forEach((type) => {
    switch (type) {
      case MODAL_TYPES.TASK:
      case "task":
        modals.taskModal = useModal();
        break;
      case MODAL_TYPES.PROJECT:
      case "project":
        modals.projectModal = useModal();
        break;
      case MODAL_TYPES.DEVELOPER:
      case "developer":
        modals.developerModal = useModal();
        break;
      case MODAL_TYPES.DELETE_CONFIRM:
      case "delete":
      case "deleteConfirm":
        modals.deleteConfirm = useConfirmModal();
        break;
      case MODAL_TYPES.CONFIRM_DELETE:
      case "confirmDelete":
        modals.confirmDeleteModal = useConfirmModal();
        break;
      default:
        modals[type + "Modal"] = useModal();
    }
  });

  // Enhanced modal operations with consistent patterns
  const openModal = (modalName, isEdit = false, data = null) => {
    const modal = modals[modalName + "Modal"] || modals[modalName];
    if (modal) {
      if (isEdit) {
        modal.openEdit(data);
      } else {
        modal.openCreate();
      }
    }
  };

  const closeModal = (modalName) => {
    const modal = modals[modalName + "Modal"] || modals[modalName];
    if (modal) {
      modal.close();
    }
  };

  const openConfirmModal = (modalName, item) => {
    const modal = modals[modalName];
    if (modal) {
      modal.open(item);
    }
  };

  // Enhanced CRUD operations for consistent modal workflows
  const handleSave = (modalName, store, isEdit, data, updateMethod, addMethod) => {
    const modal = modals[modalName + "Modal"] || modals[modalName];
    if (!modal) return;

    if (isEdit && modal.data.value?.id) {
      store[updateMethod](modal.data.value.id, data);
    } else {
      store[addMethod](data);
    }
    modal.close();
  };

  const handleDelete = (confirmModalName, store, deleteMethod) => {
    const confirmModal = modals[confirmModalName];
    if (!confirmModal?.item.value) return;

    store[deleteMethod](confirmModal.item.value.id);
    confirmModal.close();
  };

  // Standardized modal workflow patterns
  const createModalWorkflow = (modalName, store, methods) => {
    const { updateMethod = "update", addMethod = "add", deleteMethod = "delete" } = methods;

    return {
      openAdd: () => openModal(modalName, false),
      openEdit: (item) => openModal(modalName, true, item),
      close: () => closeModal(modalName),
      save: (data, isEdit) => handleSave(modalName, store, isEdit, data, updateMethod, addMethod),
      confirmDelete: (item) => openConfirmModal(modalName + "Confirm", item),
      delete: () => handleDelete(modalName + "Confirm", store, deleteMethod),
    };
  };

  return {
    ...modals,
    openModal,
    closeModal,
    openConfirmModal,
    handleSave,
    handleDelete,
    createModalWorkflow,
  };
}

