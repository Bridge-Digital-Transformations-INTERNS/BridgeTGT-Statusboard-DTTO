import { defineStore } from "pinia";
import { ref } from "vue";
import echo from "@/utils/reverb";

export const useCursorStore = defineStore("cursor", () => {
  const cursors = ref({});
  const taskFocus = ref({});

  function initListeners() {
    // Listen to presence channel for cursor and focus events
    echo.join('presence-workspace')
      .here((users) => {
        console.log('[CursorStore] Current users:', users);
      })
      .joining((user) => {
        console.log('[CursorStore] User joining:', user);
      })
      .leaving((user) => {
        console.log('[CursorStore] User leaving:', user);
        // Remove cursor when user leaves
        delete cursors.value[user.session_id];
      })
      .listen('.cursor.update', (data) => {
        cursors.value[data.session_id] = data;
      })
      .listen('.task.focus', (data) => {
        taskFocus.value[data.task_id] = data;
      })
      .listen('.task.blur', (data) => {
        if (taskFocus.value[data.task_id]?.session_id === data.session_id) {
          delete taskFocus.value[data.task_id];
        }
      });
  }

  function sendCursorMove(x, y, user) {
    echo.join('presence-workspace')
      .whisper('cursor-move', {
        x,
        y,
        session_id: user.session_id,
        username: user.username,
        avatar_url: user.avatar_url,
      });
  }

  function focusTask(task_id, user) {
    echo.join('presence-workspace')
      .whisper('focus-task', {
        task_id,
        session_id: user.session_id,
        username: user.username,
        avatar_url: user.avatar_url,
      });
  }

  function blurTask(task_id, session_id) {
    echo.join('presence-workspace')
      .whisper('blur-task', { task_id, session_id });
  }

  return { cursors, taskFocus, initListeners, sendCursorMove, focusTask, blurTask };
});
