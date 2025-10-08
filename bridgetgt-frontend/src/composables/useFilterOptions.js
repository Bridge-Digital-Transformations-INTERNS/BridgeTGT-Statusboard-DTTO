import { computed } from "vue";
import { WEIGHT_OPTIONS } from "@/constants/common";
import { STATUS_OPTIONS } from "@/constants/common";
import { PHASE_OPTIONS } from "@/constants/common";

export function useFilterOptions() {
  const categoryFilterOptions = computed(() => [
    { value: "", label: "All Categories" },
    ...WEIGHT_OPTIONS,
  ]);

  const statusFilterOptions = computed(() => [
    { value: "", label: "All Status" },
    ...STATUS_OPTIONS,
  ]);

  const phaseFilterOptions = computed(() => [
    { value: "Overall", label: "Overall" },
    ...PHASE_OPTIONS.map((phase) => ({ value: phase, label: phase })),
  ]);

  const phaseOptions = computed(() =>
    PHASE_OPTIONS.map((phase) => ({ value: phase, label: phase })),
  );

  const statusOptions = computed(() => STATUS_OPTIONS);

  return {
    categoryFilterOptions,
    statusFilterOptions,
    phaseFilterOptions,
    phaseOptions,
    statusOptions,
  };
}
