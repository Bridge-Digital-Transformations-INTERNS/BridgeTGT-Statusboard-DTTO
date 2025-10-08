import { createApp } from "vue";
import { createPinia } from "pinia";
import "./assets/css/main.css";
import "@/assets/css/fonts.css";
import App from "@/App.vue";
import router from "@/router";
import PrimeVue from "primevue/config";
import Material from "@primeuix/themes/material";
import ToastService from "primevue/toastservice";
import socket from "@/utils/socket";
import("@/utils/socketTest.js");

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Material,
  },
});
app.use(ToastService);
console.log("[Main] Initializing Socket.IO connection...");

app.mount("#app");

//AYAW HILABTI HA
console.info(
  "\x1b[32m██████╗ ██████╗ ██╗██████╗  ██████╗ ███████╗████████╗ ██████╗ ████████╗\n██╔══██╗██╔══██╗██║██╔══██╗██╔════╝ ██╔════╝╚══██╔══╝██╔════╝ ╚══██╔══╝\n██████╔╝██████╔╝██║██║  ██║██║  ███╗█████╗     ██║   ██║  ███╗   ██║   \n██╔══██╗██╔══██╗██║██║  ██║██║   ██║██╔══╝     ██║   ██║   ██║   ██║   \n██████╔╝██║  ██║██║██████╔╝╚██████╔╝███████╗   ██║   ╚██████╔╝   ██║   \n╚═════╝ ╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝ ╚══════╝   ╚═╝    ╚═════╝    ╚═╝   \x1b[0m",
);
