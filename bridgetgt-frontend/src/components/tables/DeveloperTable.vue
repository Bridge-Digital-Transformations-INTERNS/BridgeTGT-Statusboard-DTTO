<template>
  <div
    class="bg-white p-6 md:p-8 rounded-xl shadow-md border border-slate-100"
  >
    <div class="p-6 border-b border-slate-100">
      <h2 class="text-lg font-semibold text-black">Developer Developers</h2>
    </div>

    <div
      class="overflow-x-auto h-125 overflow-y-auto border border-slate-100 rounded-lg"
    >
      <table class="w-full">
        <thead class="bg-slate-50 sticky top-0 z-10">
          <tr class="text-left text-xs text-slate-500 uppercase">
            <th class="px-4 py-3">Developer</th>
            <th class="px-4 py-3">Role</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <!-- Loading Skeleton -->
          <template v-if="developerStore.loading">
            <tr v-for="n in 9" :key="'skeleton-' + n">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <SkeletonLoader type="circle" class="w-8 h-8" />
                  <SkeletonLoader class="w-33 h-4" />
                </div>
              </td>
              <td class="p-4">
                <div class="flex flex-wrap gap-2">
                  <SkeletonLoader class="w-30 h-5 rounded-full" />
                  <SkeletonLoader class="w-23 h-5 rounded-full" />
                </div>
              </td>
              <td class="p-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <SkeletonLoader class="w-8 h-8 rounded-lg" />
                  <SkeletonLoader class="w-8 h-8 rounded-lg" />
                </div>
              </td>
            </tr>
          </template>

          <!-- No Developers Placeholder (centered) -->
          <template v-else-if="developers.length === 0">
            <tr>
              <td colspan="3" class="p-0">
                <div
                  class="h-110 flex flex-col items-center justify-center text-gray-400"
                >
                  <Icon
                    icon="material-symbols:group-add-outline-rounded"
                    class="w-12 h-12 mb-3"
                  />
                  <p class="text-sm font-medium">No developers yet</p>
                </div>
              </td>
            </tr>
          </template>

          <!-- Actual Data Rows -->
          <tr
            v-else
            v-for="developer in developers"
            :key="developer.id"
            class="hover:bg-slate-100 transition-colors"
          >
            <td class="p-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden"
                  :style="{ backgroundColor: developer.color }"
                >
                  <img
                    v-if="developer.profile_picture"
                    :src="developer.profile_picture"
                    :alt="developer.name"
                    class="w-full h-full object-cover"
                  />
                  <span v-else>{{ developerStore.getInitials(developer.name) }}</span>
                </div>
                <div>
                  <div class="font-medium text-slate-800">
                    {{ developer.name }}
                  </div>
                </div>
              </div>
            </td>

            <td class="p-4">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="role in developer.roles || []"
                  :key="role"
                  class="inline-block bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-full"
                >
                  {{ role }}
                </span>
                <span
                  v-if="!developer.roles || developer.roles.length === 0"
                  class="inline-block bg-slate-50 text-slate-400 text-sm px-3 py-1 rounded-full italic"
                >
                  No roles
                </span>
              </div>
            </td>

            <td class="p-4 text-right">
              <div class="inline-flex items-center justify-end">
                <MeatballMenu
                  :item="developer"
                  @edit="$emit('edit', developer)"
                  @delete="$emit('delete', developer)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <BasePagination
      v-if="developerStore.pagination.totalPages > 1"
      :page="developerStore.pagination.page"
      :total-pages="developerStore.pagination.totalPages"
      @update:page="
        (p) => developerStore.fetchDevelopers(p, developerStore.pagination.pageSize)
      "
    />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useDeveloperStore } from "@/stores/developerStore";
import SkeletonLoader from "@/components/loaders/SkeletonLoader.vue";
import MeatballMenu from "@/components/ui/MeatballMenu.vue";
import { Icon } from "@iconify/vue";
import BasePagination from "@/components/ui/BasePagination.vue";

const developerStore = useDeveloperStore();

onMounted(() => {
  developerStore.fetchDevelopers();
  developerStore.fetchRoles();
});

defineProps({
  developers: {
    type: Array,
    required: true,
    default: () => [],
  },
});

defineEmits(["edit", "delete"]);
</script>

