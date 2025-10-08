<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <PageHeader
  title="Developer Management"
  subtitle="Manage your developer developers and their roles"
  :showBack="true"
  @back="goBack"
>
  <template #actions>
    <button
      @click="openAddModal"
      class="flex items-center gap-2 px-5 py-2 rounded-lg text-white bg-gradient-to-r from-[var(--color-palm)] to-[var(--color-lime)] hover:from-[var(--color-palm)]/90 hover:to-[var(--color-lime)]/90 transition-all duration-200 ease-in-out cursor-pointer transform hover:scale-105 hover:shadow-lg hover:-translate-y-0.5"
    >
      <Icon icon="lucide:plus" width="24" height="24" class="text-white" />
      Add Developer
    </button>
  </template>
</PageHeader>


    <!-- Content -->
    <div class="max-w-7xl mx-auto p-6">
      <DeveloperTable
        :developers="paginatedDevelopers"
        @edit="editDeveloper"
        @delete="confirmDelete"
      />
      
    </div>

    <DeveloperModal
      :open="developerModal.isOpen.value"
      :title="developerModal.isEdit.value ? 'Edit Developer' : 'Add Developer'"
      :isEdit="developerModal.isEdit.value"
      :initial="developerModal.data.value"
      @close="closeModal"
      @save="saveDeveloper"
    />
    <ConfirmModal
      :open="confirmDeleteModal.isOpen.value"
      title="Delete Developer"
      :message="`Are you sure you want to delete ${confirmDeleteModal.item.value?.name}? This action cannot be undone.`"
      @cancel="cancelDelete"
      @confirm="deleteDeveloper"
    />
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useDeveloperStore } from "@/stores/developerStore";
import DeveloperModal from "@/components/modals/DeveloperModal.vue";
import DeveloperTable from "@/components/tables/DeveloperTable.vue";
import ConfirmModal from "@/components/modals/ConfirmModal.vue";
import { useModalManager } from "@/composables/useModalManager";
import { onMounted, computed } from "vue";
import PageHeader from "@/components/layout/PageHeader.vue";
import { Icon } from "@iconify/vue";
import { useToastNotification } from "@/composables/useToastNotification";
const { showSuccess,showError } = useToastNotification();

const router = useRouter();
const developerStore = useDeveloperStore();
const { developerModal, confirmDeleteModal } = useModalManager([
  "developer",
  "confirmDelete",
]);

// Compute paginated developers
const paginatedDevelopers = computed(() => {
  const start = (developerStore.pagination.page - 1) * developerStore.pagination.pageSize;
  const end = start + developerStore.pagination.pageSize;
  return developerStore.developers.slice(start, end);
});

onMounted(() => {
  developerStore.fetchDevelopers();
});

function goBack() {
  router.push("/");
}

function openAddModal() {
  developerModal.openCreate();
}

function editDeveloper(developer) {
  developerModal.openEdit(developer);
}

function closeModal() {
  developerModal.close();
}

function saveDeveloper(developerData) {
  if (developerModal.isEdit.value) {
    developerStore.updateDeveloper(developerModal.data.value.id, developerData);
  } else {
    developerStore.addDeveloper(developerData);
  }
  closeModal();
}

function confirmDelete(developer) {
  confirmDeleteModal.open(developer);
}

function cancelDelete() {
  confirmDeleteModal.close();
}

function deleteDeveloper() {
  if (confirmDeleteModal.item.value) {
    developerStore.deleteDeveloper(confirmDeleteModal.item.value.id);
    showSuccess("Developer Deleted", "Developer has been deleted successfully!");
    cancelDelete();
  }
}
</script>




