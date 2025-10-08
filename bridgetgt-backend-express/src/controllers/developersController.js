import { validationResult } from "express-validator";
import * as Developer from "../models/developersModel.js";
import { logChangeMiddleware } from "../middlewares/logChange.js";
import { io } from "../app.js";


//GET
export const getDevelopers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const { rows, total } = await Developer.getDevelopersPaginated(page, pageSize);
    res.json({
      data: rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//GET
export const getDeveloperById = async (req, res) => {
  try {
    const developer = await Developer.getDeveloperById(req.params.id);
    if (!developer)
      return res.status(404).json({ error: "Developer not found" });
    res.json(developer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//POST
export const createDeveloper = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, color, profile_picture } = req.body;
    const developer = await Developer.createDeveloper(name, color, profile_picture || null);
    if (res.locals) res.locals.createdId = developer.id;
    io.emit("developer:created", developer);
    res.status(201).json(developer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//PUT
export const updateDeveloper = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, color, profile_picture } = req.body;
    const affectedRows = await Developer.updateDeveloper(
      req.params.id,
      name,
      color,
      profile_picture || null,
    );
    if (!affectedRows)
      return res.status(404).json({ error: "Developer not found" });
    const updatedDeveloper = { id: Number(req.params.id), name, color, profile_picture: profile_picture || null };
    io.emit("developer:updated", updatedDeveloper);
    res.json(updatedDeveloper);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//DELETE 
export const deleteDeveloper = async (req, res) => {
  try {
    const developer = await Developer.getDeveloperById(req.params.id);
    if (!developer)
      return res.status(404).json({ error: "Developer not found" });
    if (res.locals) res.locals.deletedDetails = developer;
    const affectedRows = await Developer.deleteDeveloper(req.params.id);
    io.emit("developer:deleted", { id: Number(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//LOG WRAPPERS
export const createDeveloperWithLog = [
  logChangeMiddleware("create", "developer"),
  createDeveloper,
];
export const updateDeveloperWithLog = [
  logChangeMiddleware("update", "developer"),
  updateDeveloper,
];
export const deleteDeveloperWithLog = [
  logChangeMiddleware("delete", "developer"),
  deleteDeveloper,
];
