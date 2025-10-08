<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <div class="relative">
      <HeaderBar class="bg-white" />
      <main class="p-6 max-w-7xl mx-auto w-full">
        <ProgressOverview />
        <TasksTable />


      </main>
      <!-- <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div
          v-for="cursor in Object.values(cursorStore.cursors)"
          :key="cursor.session_id"
          class="absolute flex flex-col items-center"
          :style="{ left: cursor.x + 'px', top: cursor.y + 'px' }"
        >
          <img
            :src="cursor.avatar_url"
            class="w-5 h-5 rounded-full border-2 border-white"
          />
          <span class="text-[10px] bg-black/60 text-white px-1 rounded">
            {{ cursor.username }}
          </span>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import HeaderBar from "@/components/header/HeaderBar.vue";
import ProgressOverview from "@/components/ProgressOverview.vue";
import TasksTable from "@/components/tables/TaskTable.vue";

// import { onMounted, onUnmounted } from "vue";
// import { useCursorStore } from "@/stores/cursorStore";
// import { useSessionStore } from "@/stores/sessionStore";

// const cursorStore = useCursorStore();
// const sessionStore = useSessionStore();

// onMounted(() => {
//   cursorStore.initListeners();

//   // throttle mouse move to ~30fps
//   let last = 0;
//   function handleMouseMove(e) {
//     const now = Date.now();
//     if (now - last > 30) {
//       cursorStore.sendCursorMove(
//         e.clientX,
//         e.clientY,
//         sessionStore.onlineUsers[0] || {},
//       );
//       last = now;
//     }
//   }
//   window.addEventListener("mousemove", handleMouseMove);

//   onUnmounted(() => {
//     window.removeEventListener("mousemove", handleMouseMove);
//   });
// });
</script>
