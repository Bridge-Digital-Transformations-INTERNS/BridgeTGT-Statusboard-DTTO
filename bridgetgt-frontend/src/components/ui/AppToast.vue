<template>
  <Toast>
    <template #message="slotProps">
      <div class="flex items-center gap-3">
        <Icon
          v-if="slotProps.message.type === 'create'"
          icon="material-symbols:check-circle-rounded"
          width="24"
          height="24"
          class="text-white"
        />
        <Icon
          v-else-if="slotProps.message.type === 'delete'"
          icon="lucide:trash-2"
          width="24"
          height="24"
          class="text-white"
        />
        <Icon
          v-else-if="slotProps.message.type === 'edit'"
          icon="iconoir:edit-pencil"
          width="24"
          height="24"
          class="text-white"
        />
        <Icon
          v-else-if="slotProps.message.type === 'error'"
          icon="material-symbols:error-rounded"
          width="24"
          height="24"
          class="text-white"
        />
        <div>
          <p class="font-semibold">{{ slotProps.message.summary }}</p>
          <p class="text-sm">{{ slotProps.message.detail }}</p>
        </div>
      </div>
    </template>
  </Toast>
</template>

<script setup>
import Toast from "primevue/toast";
import { Icon } from "@iconify/vue";
</script>
