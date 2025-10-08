import express from "express";
import { body, param } from "express-validator";
import * as Tasks from "../controllers/tasksController.js";
import { sessionAuth } from "../middlewares/sessionAuth.js";

const router = express.Router();

// GET all tasks
router.get("/", Tasks.getTasks);

router.get(
  "/:id",
  [param("id").isInt().withMessage("Task ID must be an integer")],
  Tasks.getTaskById,
);

// Tasks with assignees (for Gantt and other views)
router.get("/with-assignees", sessionAuth, Tasks.getAllTasksWithAssignees);

router.get("/project/:projectId/with-assignees", 
  sessionAuth,
  [param("projectId").isInt().withMessage("Project ID must be an integer")],
  Tasks.getTasksWithAssigneesByProject
);

// Gantt-specific routes (legacy - keeping for backwards compatibility)
router.get("/gantt/all", sessionAuth, Tasks.getAllTasksWithAssignees);

router.get("/gantt/project/:projectId", 
  sessionAuth,
  [param("projectId").isInt().withMessage("Project ID must be an integer")],
  Tasks.getTasksWithAssigneesByProject
);

router.get("/gantt/structured/:projectId",
  sessionAuth,
  [param("projectId").isInt().withMessage("Project ID must be an integer")],
  Tasks.getStructuredGanttData
);

// Bulk update tasks (for Gantt drag & drop)
router.put("/bulk",
  sessionAuth,
  [body("updates").isArray().withMessage("Updates must be an array")],
  ...Tasks.bulkUpdateTasksWithLog
);

// Update task timeline
router.put("/:id/timeline",
  sessionAuth,
  [
    param("id").isInt().withMessage("Task ID must be an integer"),
    body("startDate").optional().isDate().withMessage("Start date must be valid"),
    body("targetDate").optional().isDate().withMessage("Target date must be valid"),
    body("endDate").optional().isDate().withMessage("End date must be valid")
  ],
  Tasks.updateTaskTimeline
);
router.get(
  "/:id",
  [param("id").isInt().withMessage("Task ID must be an integer")],
  Tasks.getTaskById,
);

router.get(
  "/project/:projectId",
  [param("projectId").isInt().withMessage("Project ID must be an integer")],
  Tasks.getTasksByProject,
);

router.post(
  "/",
  sessionAuth,
  [
    body("project_id").isInt().withMessage("Project ID must be an integer"),
    body("title").isString().notEmpty().withMessage("Title is required"),
    body("phase").isString().notEmpty().withMessage("Phase is required"),
    body("weight")
      .isIn(["light", "medium", "heavy"])
      .withMessage("Weight must be 'light', 'medium', or 'heavy'"),
    body("status").isString().notEmpty().withMessage("Status is required"),
    body("startDate")
      .isDate()
      .withMessage("Start date must be a valid date"),
    body("targetDate")
      .isDate()
      .withMessage("Target date must be a valid date"),
    body("endDate")
      .optional({ values: "falsy" })
      .isDate()
      .withMessage("End date must be a valid date"),
    body("assigneeIds")
      .optional()
      .isArray({ min: 0 })
      .withMessage("Assignee IDs must be an array"),
    body("assigneeIds.*")
      .isInt()
      .withMessage("Each assignee ID must be an integer"),
  ],
  ...Tasks.createTaskWithLog,
);

router.put(
  "/:id",
  sessionAuth,
  [
    param("id").isInt().withMessage("Task ID must be an integer"),
    body("project_id")
      .optional()
      .isInt()
      .withMessage("Project ID must be an integer"),
    body("title")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Title must be a non-empty string"),
    body("phase")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Phase must be a non-empty string"),
    body("weight")
      .optional()
      .isIn(["light", "medium", "heavy"])
      .withMessage("Weight must be 'light', 'medium', or 'heavy'"),
    body("status")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Status must be a non-empty string"),
    body("startDate")
      .isDate()
      .withMessage("Start date must be a valid date"),
    body("targetDate")
      .isDate()
      .withMessage("Target date must be a valid date"),
    body("endDate")
      .optional({ values: "falsy" })
      .isDate()
      .withMessage("End date must be a valid date"),
      
  ],
  ...Tasks.updateTaskWithLog,
);

router.put(
  "/bulk/update",
  sessionAuth,
  [
    body("tasks").isArray({ min: 1 }).withMessage("Tasks array is required"),
    body("tasks.*.id").isInt().withMessage("Each task must have a valid ID"),
    body("tasks.*.title")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Title must be a non-empty string"),
    body("tasks.*.startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid date"),
    body("tasks.*.targetDate")
      .optional()
      .isISO8601()
      .withMessage("Target date must be a valid date"),
    body("tasks.*.endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid date"),
    body("tasks.*.status")
      .optional()
      .isString()
      .withMessage("Status must be a string"),
  ],
  ...Tasks.bulkUpdateTasksWithLog,
);

router.delete(
  "/:id",
  sessionAuth,
  [param("id").isInt().withMessage("Task ID must be an integer")],
  ...Tasks.deleteTaskWithLog,
);


export default router;
