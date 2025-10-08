<template>
  <Modal
    :open="open"
    :title="isEdit ? 'Edit Developer' : 'Add Developer'"
    :saving="isSaving"
    @cancel="close"
    @confirm="save"
  >
    <div class="flex flex-col gap-6">
      <!-- Basic Information -->
      <div>
        <h3 class="text-slate-700 font-semibold mb-3">Developer Information</h3>
        <div class="grid grid-cols-2 gap-4">
          <!-- Profile Picture Upload -->
          <div class="col-span-2">
            <label class="text-sm font-medium mb-2 block">Profile Picture (Optional)</label>
            <div class="flex items-center gap-3">
              <!-- Avatar Preview -->
              <div
                class="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-medium overflow-hidden flex-shrink-0 border-2 border-slate-200"
                :style="{ backgroundColor: form.color || '#94A3B8' }"
              >
                <img
                  v-if="form.profile_picture"
                  :src="form.profile_picture"
                  alt="Profile"
                  class="w-full h-full object-cover"
                />
                <span v-else-if="form.name">{{ getInitials(form.name) }}</span>
                <span v-else>
                  <Icon icon="solar:user-bold" width="40" height="40" />
                </span>
              </div>

              <!-- Upload Controls -->
              <div class="flex-1">
                <div class="flex gap-2">
                  <label
                    class="flex-1 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer text-center text-sm transition-colors"
                    :class="{ 'border-red-500': errors.profile_picture }"
                  >
                    <input
                      ref="fileInput"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      @change="handleUpload"
                      class="hidden"
                    />
                    <span class="inline-flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ form.profile_picture ? 'Change' : 'Choose File' }}
                    </span>
                  </label>
                  <button
                    v-if="form.profile_picture"
                    @click="removeImage"
                    type="button"
                    class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm transition-colors border border-red-200"
                    title="Remove picture"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p v-if="!errors.profile_picture" class="text-xs text-slate-500 mt-1">
                  JPG, JPEG, PNG or WEBP 
                </p>
                <div v-else class="text-red-500 text-xs mt-1">
                  {{ errors.profile_picture }}
                </div>
              </div>
            </div>
          </div>

          <div class="col-span-2">
            <label class="text-sm font-medium">Full Name<span class="text-red-500">*</span></label>
            <input
              v-model="form.name"
              class="p-2 border border-slate-200 rounded w-full"
              :class="{ 'border-red-500': errors.name }"
              placeholder="Enter full name"
            />
            <div v-if="errors.name" class="text-red-500 text-xs mt-1">
              {{ errors.name }}
            </div>
          </div>

          <!-- Roles Section -->
          <div class="col-span-2">
            <label class="text-sm font-medium mb-2 block">Roles<span class="text-red-500">*</span></label>

            <!-- Add Role -->
            <div class="flex gap-2">
              <BaseDropdown
                v-model="form.roles"
                :options="availableRoleOptions"
                placeholder="Select roles..."
                multiple
                class="flex-1"
              >
                <template #selected>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="role in form.roles"
                      :key="role"
                      class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                    >
                      {{ role }}
                      <button
                        @click.stop="removeRole(role)"
                        class="hover:bg-blue-200 rounded-full p-0.5 cursor-pointer"
                      >
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  </div>
                </template>
              </BaseDropdown>
            </div>
            <div v-if="errors.roles" class="text-red-500 text-xs mt-1">
              {{ errors.roles }}
            </div>
          </div>

          <!-- Color Section -->
          <div class="col-span-2">
            <label class="text-sm font-medium mb-2 block">Color</label>
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="color in developerStore.availableColors"
                :key="color"
                @click="form.color = color"
                class="w-12 h-12 rounded-full border-2 transition-all cursor-pointer hover:"
                :class="{
                  'border-slate-400 ring-2 ring-slate-400':
                    form.color === color,
                  'border-slate-200 hover:border-slate-300':
                    form.color !== color,
                }"
                :style="{ backgroundColor: color }"
                :title="getColorName(color)"
              >
                <svg
                  v-if="form.color === color"
                  class="w-6 h-6 text-white mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div v-if="form.name">
        <h3 class="text-slate-700 font-semibold mb-3">Preview</h3>
        <div class="p-3 bg-slate-50 rounded-lg">
          <div class="flex items-center gap-3">
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-white font-medium overflow-hidden"
              :style="{ backgroundColor: form.color || '#94A3B8' }"
            >
              <img
                v-if="form.profile_picture"
                :src="form.profile_picture"
                alt="Profile"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ getInitials(form.name) }}</span>
            </div>
            <div>
              <div class="font-medium text-slate-800">{{ form.name }}</div>
              <div class="flex flex-wrap gap-1 mt-1">
                <span
                  v-for="role in form.roles"
                  :key="role"
                  class="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded"
                >
                  {{ role }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useDeveloperStore } from "@/stores/developerStore";
import Modal from "@/components/modals/ModalCom.vue";
import BaseDropdown from "@/components/dropdowns/BaseDropdown.vue";
import { useImageUpload } from "@/composables/useImageUpload";
import { useDeveloperForm } from "@/composables/useDeveloperForm";
import { getInitials, getColorName } from "@/utils/ui";
import { Icon } from "@iconify/vue";
import { useToastNotification } from "@/composables/useToastNotification";
const { showSuccess,showError } = useToastNotification();


const emit = defineEmits(["close"]);
const developerStore = useDeveloperStore();

const props = defineProps({
  open: Boolean,
  initial: Object,
});

const isEdit = computed(() => Boolean(props.initial));
const isSaving = ref(false);

// Use composables
const {
  form,
  errors,
  availableRoleOptions,
  validateForm,
  removeRole,
  resetForm: resetDeveloperForm,
  populateForm,
  getFormData,
  syncRoles,
  assignRolesToNewDeveloper
} = useDeveloperForm(developerStore);

const {
  fileInput,
  imageUrl,
  error: imageError,
  handleUpload,
  removeImage,
  reset: resetImageUpload,
  setImageUrl
} = useImageUpload({
  maxWidth: 400,
  maxHeight: 400,
  quality: 0.8,
  maxFileSizeMB: 5,
  maxCompressedSizeKB: 500
});

// Sync image error with form errors
watch(imageError, (newError) => {
  errors.profile_picture = newError;
});

// Sync imageUrl with form.profile_picture
watch(imageUrl, (newUrl) => {
  form.profile_picture = newUrl;
});

// Reset form completely
function resetForm() {
  resetDeveloperForm();
  resetImageUpload();
}

function close() {
  resetForm();
  emit("close");
}

async function save() {
  if (!validateForm()) {
    return;
  }

  isSaving.value = true;

  try {
    const DeveloperData = getFormData();

    if (isEdit.value) {
      await developerStore.updateDeveloper(props.initial.id, DeveloperData);
      await syncRoles(props.initial.id, props.initial.roles);
      await developerStore.fetchDevelopers();
    } else {
      const response = await developerStore.addDeveloper(DeveloperData);
      const newDevId = response?.data?.id;
      if (newDevId) {
        await assignRolesToNewDeveloper(newDevId);
      }
      // Fetch developers to refresh the list
      await developerStore.fetchDevelopers();
    }

    showSuccess(
      isEdit.value ? "Developer Updated" : "Developer Added",
      isEdit.value
        ? "Developer has been updated successfully!"
        : "New developer has been added successfully!"
    );

    close();
  } catch (error) {
    console.error('Error saving developer:', error);
    showError(
      "Operation Failed",
      isEdit.value
        ? "Failed to update developer. Please try again."
        : "Failed to add developer. Please try again."
    );
  } finally {
    isSaving.value = false;
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.initial) {
      populateForm(props.initial);
      setImageUrl(props.initial.profile_picture || null);
    } else if (isOpen) {
      resetForm();
      form.color = developerStore.availableColors[0];
    }
  }
);
</script>


