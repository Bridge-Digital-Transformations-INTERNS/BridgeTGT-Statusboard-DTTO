import { validationResult } from "express-validator";
import * as TaskAssignee from "../models/taskAssigneesModel.js";
import { io } from "../app.js";
import { logChangeMiddleware } from "../middlewares/logChange.js";


//ASSIGN
export const assignDeveloper = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { task_id, developer_id } = req.body;
    await TaskAssignee.assignDeveloperToTask(task_id, developer_id);
    io.emit("taskAssignee:added", { task_id, developer_id });
    
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("[assignDeveloper]", err);
    res.status(500).json({ error: err.message });
  }
};


//DELETE
export const removeDeveloper = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { task_id, developer_id } = req.params; 
    const affectedRows = await TaskAssignee.removeDeveloperFromTask(task_id, developer_id);
    
    if (!affectedRows) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    
    io.emit("taskAssignee:removed", { task_id: Number(task_id), developer_id: Number(developer_id) });
    
    res.json({ success: true });
  } catch (err) {
    console.error("[removeDeveloper]", err);
    res.status(500).json({ error: err.message });
  }
};

//GET
export const getDevelopersByTask = async (req, res) => {
  try {
    const developers = await TaskAssignee.getDevelopersByTask(req.params.task_id);
    res.json(developers);
  } catch (err) {
    console.error("[getDevelopersByTask]", err);
    res.status(500).json({ error: err.message });
  }
};

//MGA ACTIVITY LOG NA NAKA ATTACHED NA ANG MISMONG REQ
export const assignDeveloperWithLog = [
  logChangeMiddleware("create", "task_assignee"),
  assignDeveloper,
];
export const removeDeveloperWithLog = [
  logChangeMiddleware("delete", "task_assignee"),
  removeDeveloper,
];