import express from "express";
import { body, param } from "express-validator";
import * as TaskAssignees from "../controllers/taskAssigneesControllers.js";
import { sessionAuth } from "../middlewares/sessionAuth.js";
const router = express.Router();

// POST
router.post(
  "/",
  sessionAuth,
  [
    body("task_id").isInt().withMessage("Task ID must be an integer"),
    body("developer_id").isInt().withMessage("Developer ID must be an integer"),
  ],
  TaskAssignees.assignDeveloper,
);

// DELETE
router.delete(
  "/:task_id/:developer_id",
  sessionAuth,
  [
    param("task_id").isInt().withMessage("Task ID must be an integer"),
    param("developer_id").isInt().withMessage("Developer ID must be an integer"),
  ],
  TaskAssignees.removeDeveloper,
);



// GET
router.get(
  "/:task_id",
  sessionAuth,
  [param("task_id").isInt().withMessage("Task ID must be an integer")],
  TaskAssignees.getDevelopersByTask,
);

export default router;
