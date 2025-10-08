import { validationResult } from "express-validator";
import * as Project from "../models/projectsModel.js";
import { logChangeMiddleware } from "../middlewares/logChange.js";
import { io } from "../app.js";


//GET
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.getAllProjects();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//GET
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//POST
export const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name } = req.body;
    const project = await Project.createProject(name);
    if (res.locals) res.locals.createdId = project.id;
    io.emit("project:created", project);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//PUT
export const updateProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name } = req.body;
    const affectedRows = await Project.updateProject(req.params.id, name);
    if (!affectedRows)
      return res.status(404).json({ error: "Project not found" });
    // Fetch updated project for logging
    const updatedProject = await Project.getProjectById(req.params.id);
    if (res.locals) res.locals.updatedDetails = updatedProject;

    res.json({ id: Number(req.params.id), name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//DELETE
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (res.locals) res.locals.deletedDetails = project;
    const affectedRows = await Project.deleteProject(req.params.id);
    io.emit("project:deleted", { id: Number(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//MGA ACTIVITY LOG NA NAKA ATTACHED NA ANG MISMONG REQ
export const createProjectWithLog = [
  logChangeMiddleware("create", "project"),
  createProject,
];
export const updateProjectWithLog = [
  logChangeMiddleware("update", "project"),
  updateProject,
];

export const deleteProjectWithLog = [
  logChangeMiddleware("delete", "project"),
  deleteProject,
];
