<template>
  <div class="relative cursor-pointer" ref="dropdownContainer">
    <!-- Meatball Button -->
    <button
      @click="toggleMenu"
      class="cursor-pointer p-2  text-slate-500  hover:bg-slate-200 rounded-full transition-colors"
      :class="{ 'bg-slate-100': isOpen }"
      title="More actions"
    >
      <Icon icon="lucide:ellipsis" width="24" height="24" />
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        ref="dropdownMenu"
        class="fixed bg-white border border-slate-200 rounded-lg shadow-xl z-[9999] overflow-hidden min-w-[120px]"
        :style="dropdownStyles"
      >
        <div class="py-1">
          <!-- Edit -->
          <button
            v-if="showEdit"
            @click="handleEdit"
            class="w-full px-3 py-2 text-left text-md  text-black hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Icon icon="iconoir:edit-pencil" width="18" height="18" class="text-slate-600" />
            Edit
          </button>

          <!-- Delete -->
          <button
            v-if="showDelete"
            @click="handleDelete"
            class="w-full px-3 py-2 text-left text-md  text-red-600 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Icon icon="lucide:trash-2" width="16" height="16" class="text-red-600" />
            Delete
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <div v-if="isOpen" @click="closeMenu" class="fixed inset-0 z-[9998] bg-transparent"></div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { Icon } from "@iconify/vue";
import { useClickOutside } from "@/composables/useClickOutside";
import { useDropdownPosition } from "@/composables/useDropdownPosition";

const props = defineProps({
  item: { type: Object, required: true },
  showEdit: { type: Boolean, default: true },
  showDelete: { type: Boolean, default: true },
});

const emit = defineEmits(["edit", "delete"]);

const isOpen = ref(false);
const dropdownContainer = ref(null);
const dropdownMenu = ref(null);

const { dropdownStyles, calculateDropdownPosition } = useDropdownPosition();
useClickOutside(dropdownContainer, closeMenu);

function toggleMenu() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    nextTick(() => {
      calculateDropdownPosition(dropdownContainer.value, dropdownMenu.value, {
        alignment: "right",
        preferredPosition: "below",
      });
    });
  } else {
    closeMenu();
  }
}

function closeMenu() {
  isOpen.value = false;
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
}

function handleEdit() {
  emit("edit", props.item);
  closeMenu();
}

function handleDelete() {
  emit("delete", props.item);
  closeMenu();
}
</script>
