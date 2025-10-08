<template>
  <Transition name="toast-slide">
    <div
      v-if="visible"
      class="fixed bottom-4 right-4 z-50 bg-white shadow-md rounded-lg border border-gray-200 p-3 min-w-[250px]"
    >
      <div class="flex items-center gap-2.5">
        <!-- User Avatar -->
        <img
          v-if="user?.avatar_url"
          :src="user.avatar_url"
          :alt="user.username"
          class="w-8 h-8 rounded-full object-cover"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-black flex items-center text-white justify-center flex-shrink-0"
        >
          A
        </div>
        <!-- Message -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ user?.username || 'User' }} is <span class="text-[var(--color-palm)]">online</span></p>
        </div>

        <!-- Close button -->
        <button
          @click="close"
          class="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <Icon icon="mdi:close" class="text-lg" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  user: {
    type: Object,
    default: null
  },
  duration: {
    type: Number,
    default: 3000
  },
  audioSrc: {
    type: String,
    default: '/online-tone-olala.mp3' 
  },
  enableAudio: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close']);

const visible = ref(false);
const audio = ref(null);
let timeout = null;

onMounted(() => {
  // Initialize audio element
  if (props.audioSrc && props.enableAudio) {
    audio.value = new Audio(props.audioSrc);
    audio.value.volume = 0.5; 
  }
});

watch(() => props.user, (newUser) => {
  if (newUser) {
    show();
  }
}, { immediate: true });

function show() {
  visible.value = true;
  
  // Play audio notification when user comes online
  playAudio();
  
  if (timeout) {
    clearTimeout(timeout);
  }
  
  timeout = setTimeout(() => {
    close();
  }, props.duration);
}

function playAudio() {
  if (audio.value && props.enableAudio) {
    audio.value.currentTime = 0;
    audio.value.play().catch((error) => {
      console.warn('Failed to play notification sound:', error);
    });
  }
}

function close() {
  visible.value = false;
  if (timeout) {
    clearTimeout(timeout);
  }
  emit('close');
}
</script>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
