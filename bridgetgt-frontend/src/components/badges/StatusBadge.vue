<template>
  <span
    :class="[
      'px-5 py-0 rounded-full text-label-md whitespace-nowrap inline-block',
      statusConfig.bgClass,
      statusConfig.textClass,
    ]"
  >
    {{ statusConfig.label }}
  </span>
</template>

<script setup>
import { computed } from "vue";
import { useStatusConfig } from "@/composables/useStatusConfig";

const props = defineProps({
  status: String,
});

const { getStatusConfig } = useStatusConfig();

const statusConfig = computed(() => getStatusConfig(props.status));
</script>
