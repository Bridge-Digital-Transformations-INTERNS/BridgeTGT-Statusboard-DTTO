import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";

//SOCKET
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

// dotenv.config({ path: path.resolve(".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
const app = express();
app.use(cors());
// Increase payload limit to handle base64 images (compressed to ~500KB)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Routes
import developerRoutes from "./routes/developers.js";
import projectRoutes from "./routes/projects.js";
import roleRoutes from "./routes/roles.js";
import taskRoutes from "./routes/tasks.js";
import devRoleRoutes from "./routes/developerRoles.js";
import taskAssigneeRoutes from "./routes/taskAssignees.js";
import authRoutes from "./routes/auth.js";
import changeLogsRoutes from "./routes/changeLogs.js";

app.use("/api/projects", projectRoutes);
app.use("/api/developers", developerRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/developer-roles", devRoleRoutes);
app.use("/api/task-assignees", taskAssigneeRoutes);
app.use("/api/change-logs", changeLogsRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend is running " });
});

// Create HTTP server from express app
const server = createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: [process.env.FRONTEND_URL, process.env.LOCAL_FRONTEND_URL],
    methods: ["GET", "POST"],
  },
});

//CONNECTIONS FOR SOCKET IO MAMEEEN
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("cursor:move", (data) => {
    socket.broadcast.emit("cursor:update", data);
  });
  socket.on("focus:task", (data) => {
    socket.broadcast.emit("task:focus", data);
  });
  socket.on("blur:task", (data) => {
    socket.broadcast.emit("task:blur", data);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Server + Socket.IO running on ${HOST}:${PORT}`);
  console.log(`Accessible at http://localhost:${PORT}`);
  if (HOST === '0.0.0.0') {
    console.log(`Also accessible from network via your machine's IP address`);
  }
});

export { io };
