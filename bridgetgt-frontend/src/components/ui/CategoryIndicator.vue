<template>
  <div
    v-if="variant === 'bar'"
    :class="[
      'w-1 rounded-full flex-shrink-0',
      height || 'h-12',
      categoryColor
    ]"
    :title="categoryLabel"
  ></div>
  
  <div
    v-else-if="variant === 'top-bar'"
    :class="[
      'h-0.5 rounded-3xl w-full',
      categoryColor
    ]"
  ></div>
  <div
    v-else-if="variant === 'dot'"
  :class="[
      ' w-2 rounded-full',
      height || 'h-2',
      categoryColor
    ]"
    :title="categoryLabel"
  ></div>
  
  <Icon
    v-else-if="variant === 'icon'"
    :icon="categoryIcon"
    width="14"
    height="14"
    :class="textColor"
  />
  
  <span
    v-else-if="variant === 'text'"
    :class="[
      'capitalize text-xs',
      textColor
    ]"
  >
    {{ categoryLabel }}
  </span>
  
  <span
    v-else
    :class="[
      'px-2 py-0 rounded-full text-xs font-medium capitalize',
      badgeColor
    ]"
  >
    {{ categoryLabel }}
  </span>
</template>

<script setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import { TASK_WEIGHTS, WEIGHT_LABELS, CATEGORY_COLORS } from "@/constants/common";

const props = defineProps({
  category: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: "badge",
    validator: (value) => ["badge", "bar", "top-bar", "text", "dot", "icon"].includes(value)
  },
  height: {
    type: String,
    default: ""
  }
});

const categoryLabel = computed(() => {
  return WEIGHT_LABELS[props.category] || props.category;
});

const categoryColor = computed(() => {
  return CATEGORY_COLORS.SOLID[props.category] || "bg-slate-400";
});

const textColor = computed(() => {
  return CATEGORY_COLORS.TEXT[props.category] || "text-slate-500";
});

const badgeColor = computed(() => {
  return CATEGORY_COLORS.BADGE[props.category] || "bg-gray-50 text-gray-700 border border-gray-300";
});

const categoryIcon = computed(() => {
  const icons = {
    [TASK_WEIGHTS.CRITICAL]: "mdi:alert-circle",
    [TASK_WEIGHTS.HEAVY]: "mdi:weight",
    [TASK_WEIGHTS.MEDIUM]: "mdi:weight-lifter",
    [TASK_WEIGHTS.LIGHT]: "mdi:feather"
  };
  return icons[props.category] || "mdi:circle";
});
</script>