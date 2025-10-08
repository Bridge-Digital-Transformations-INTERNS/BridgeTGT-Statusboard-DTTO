import { validationResult } from "express-validator";
import * as Role from "../models/rolesModel.js";

//GET
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.getRoleById(req.params.id);
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//GET
export const getRoles = async (req, res) => {
  try {
    const roles = await Role.getAllRoles();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//POST
export const createRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name } = req.body;
    const role = await Role.createRole(name);
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//PUT
export const updateRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name } = req.body;
    const affectedRows = await Role.updateRole(req.params.id, name);
    if (!affectedRows) return res.status(404).json({ error: "Role not found" });
    res.json({ id: req.params.id, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//DELETE
export const deleteRole = async (req, res) => {
  try {
    const affectedRows = await Role.deleteRole(req.params.id);
    if (!affectedRows) return res.status(404).json({ error: "Role not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
