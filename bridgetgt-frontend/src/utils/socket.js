import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
  path: "/socket.io",
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Connection event handlers
socket.on("connect", () => {
  console.log("[Socket.IO] Connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("[Socket.IO] Connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("[Socket.IO] Disconnected:", reason);
});

socket.on("reconnect", (attemptNumber) => {
  console.log("[Socket.IO] Reconnected after", attemptNumber, "attempts");
});

export default socket;
