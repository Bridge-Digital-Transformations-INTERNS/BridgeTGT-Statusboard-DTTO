import { defineStore } from "pinia";
import { ref } from "vue";
import socket from "@/utils/socket";

export const useCursorStore = defineStore("cursor", () => {
  const cursors = ref({});
  const taskFocus = ref({});

  function initListeners() {
    // Cursor updates
    socket.on("cursor:update", (data) => {
      cursors.value[data.session_id] = data;
    });

    // Task focus
    socket.on("task:focus", (data) => {
      taskFocus.value[data.task_id] = data;
    });

    // Task blur
    socket.on("task:blur", (data) => {
      if (taskFocus.value[data.task_id]?.session_id === data.session_id) {
        delete taskFocus.value[data.task_id];
      }
    });
  }

  function sendCursorMove(x, y, user) {
    socket.emit("cursor:move", {
      x,
      y,
      session_id: user.session_id,
      username: user.username,
      avatar_url: user.avatar_url,
    });
  }

  function focusTask(task_id, user) {
    socket.emit("focus:task", {
      task_id,
      session_id: user.session_id,
      username: user.username,
      avatar_url: user.avatar_url,
    });
  }

  function blurTask(task_id, session_id) {
    socket.emit("blur:task", { task_id, session_id });
  }

  return { cursors, taskFocus, initListeners, sendCursorMove, focusTask, blurTask };
});
