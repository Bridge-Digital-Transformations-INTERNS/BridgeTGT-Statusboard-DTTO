import { validationResult } from "express-validator";
import * as Task from "../models/tasksModel.js";
import { logChangeMiddleware } from "../middlewares/logChange.js";
import { io } from "../app.js";

//GET
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.getAllTasks();
    res.json(tasks);
  } catch (err) {
    console.error("[getTasks]", err);
    res.status(500).json({ error: err.message });
  }
};

//GET
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    console.error("[getTaskById]", err);
    res.status(500).json({ error: err.message });
  }
};

//POST
export const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("VALIDATION ERRORS:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const task = await Task.createTask(req.body);
    if (res.locals) res.locals.createdId = task.id;
    io.emit("task:created", task);
    res.status(201).json(task);
  } catch (err) {
    console.error("[createTask]", err);
    res.status(500).json({ error: err.message });
  }
};

//PUT
export const updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("VALIDATION ERRORS:", errors.array());
    console.log("REQUEST BODY:", req.body);
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const body = req.body;

    const updatedData = {
      ...body,
      startDate: formatForMySQL(body.startDate),
      targetDate: formatForMySQL(body.targetDate),
      endDate: formatForMySQL(body.endDate),
    };

    const affectedRows = await Task.updateTask(req.params.id, updatedData);
    if (!affectedRows) return res.status(404).json({ error: "Task not found" });

    const updatedTask = { id: Number(req.params.id), ...updatedData };
    io.emit("task:updated", updatedTask);

    res.json(updatedTask);
  } catch (err) {
    console.error("[updateTask]", err);
    res.status(500).json({ error: err.message });
  }
};

//DELETE
export const deleteTask = async (req, res) => {
  try {
    const affectedRows = await Task.deleteTask(req.params.id);
    if (!affectedRows) return res.status(404).json({ error: "Task not found" });
    io.emit("task:deleted", { id: Number(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    console.error("[deleteTask]", err);
    res.status(500).json({ error: err.message });
  }
};

//GET
export const getTasksByProject = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { projectId } = req.params;

    const result = await Task.getTasksByProjectId(
      projectId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );

    res.json(result);
  } catch (err) {
    console.error("[getTasksByProject]", err);
    res.status(500).json({ error: err.message });
  }
};

function formatForMySQL(dateStr) {
  if (!dateStr || dateStr === '') return null;
  
  // If already in YYYY-MM-DD format, just append time for MySQL
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return `${dateStr} 00:00:00`;
  }
  
  // Parse date and format without timezone conversion
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  
  // Use local date components to avoid timezone shift
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day} 00:00:00`;
}

export const bulkUpdateTasks = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { tasks } = req.body;
    const updatedTasks = [];

    for (const taskUpdate of tasks) {
      const { id, ...updateData } = taskUpdate;

      const formattedData = {
        ...updateData,
        startDate: formatForMySQL(updateData.startDate),
        targetDate: formatForMySQL(updateData.targetDate),
        endDate: formatForMySQL(updateData.endDate),
      };

      const affectedRows = await Task.updateTask(id, formattedData);
      if (affectedRows) {
        const updatedTask = { id: Number(id), ...formattedData };
        updatedTasks.push(updatedTask);
        io.emit("task:updated", updatedTask);
      }
    }

    res.json({
      success: true,
      updated: updatedTasks.length,
      tasks: updatedTasks,
    });
  } catch (err) {
    console.error("[bulkUpdateTasks]", err);
    res.status(500).json({ error: err.message });
  }
};
//MGA ACTIVITY LOG NA NAKA ATTACHED NA ANG MISMONG REQ
export const createTaskWithLog = [
  logChangeMiddleware("create", "task"),
  createTask,
];
export const updateTaskWithLog = [
  logChangeMiddleware("update", "task"),
  updateTask,
];

export const deleteTaskWithLog = [
  logChangeMiddleware("delete", "task"),
  deleteTask,
];

export const getTasksWithAssigneesByProject = async (req, res) => {
  try {
    const tasks = await Task.getTasksWithAssigneesByProjectId(
      req.params.projectId,
    );
    res.json(tasks);
  } catch (err) {
    console.error("[getTasksWithAssigneesByProject]", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllTasksWithAssignees = async (req, res) => {
  try {
    const tasks = await Task.getAllTasksWithAssignees();
    res.json(tasks);
  } catch (err) {
    console.error("[getAllTasksWithAssignees]", err);
    res.status(500).json({ error: err.message });
  }
};

// Bulk update tasks (for Gantt timeline drag & drop)
export const bulkUpdateTasksController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: "Updates array is required" });
    }
    
    const results = await Task.bulkUpdateTasks(updates);
    
    // Emit socket event for real-time updates
    updates.forEach(update => {
      io.emit("task:updated", { id: update.id, ...update });
    });
    
    res.json({ 
      success: true, 
      updated: results.length,
      results 
    });
  } catch (err) {
    console.error("[bulkUpdateTasks]", err);
    res.status(500).json({ error: err.message });
  }
};

// Get structured Gantt data by project
export const getStructuredGanttData = async (req, res) => {
  try {
    const data = await Task.getStructuredGanttDataByProject(req.params.projectId);
    res.json(data);
  } catch (err) {
    console.error("[getStructuredGanttData]", err);
    res.status(500).json({ error: err.message });
  }
};

// Update task timeline (for Gantt drag & drop)
export const updateTaskTimeline = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { startDate, targetDate, endDate } = req.body;
    const taskId = req.params.id;
    
    const affectedRows = await Task.updateTask(taskId, {
      startDate,
      targetDate,
      endDate
    });
    
    if (!affectedRows) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    const updatedTask = await Task.getTaskById(taskId);
    io.emit("task:updated", updatedTask);
    
    res.json(updatedTask);
  } catch (err) {
    console.error("[updateTaskTimeline]", err);
    res.status(500).json({ error: err.message });
  }
};

export const bulkUpdateTasksWithLog = [
  logChangeMiddleware("bulk-update", "task"),
  bulkUpdateTasksController,
];
