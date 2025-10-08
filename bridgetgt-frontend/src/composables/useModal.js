import { ref } from "vue";

export function useModal() {
  const isOpen = ref(false);
  const isEdit = ref(false);
  const data = ref(null);

  const open = (editMode = false, initialData = null) => {
    isEdit.value = editMode;
    data.value = initialData ? { ...initialData } : null; 
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
    setTimeout(() => {
      isEdit.value = false;
      data.value = null;
    }, 300);
  };

  const openCreate = () => {
    open(false, null);
  };
  
  const openEdit = (item) => {
    open(true, item);
  };

  return {
    isOpen,
    isEdit,
    data,
    open,
    close,
    openCreate,
    openEdit,
  };
}

export function useConfirmModal() {
  const isOpen = ref(false);
  const item = ref(null);

  const open = (itemToConfirm) => {
    item.value = itemToConfirm ? { ...itemToConfirm } : null;
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
    setTimeout(() => {
      item.value = null;
    }, 300);
  };

  return {
    isOpen,
    item,
    open,
    close,
  };
}