import express from "express";
import {
  createChangeLog,
  getChangeLogs,
} from "../controllers/changeLogsController.js";
import { sessionAuth } from "../middlewares/sessionAuth.js";

const router = express.Router();

// POST /change-logs (requires session)
router.post("/", sessionAuth, createChangeLog);

// GET /change-logs
router.get("/", getChangeLogs);

export default router;
