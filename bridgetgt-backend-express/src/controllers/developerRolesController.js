import * as DevRole from "../models/developerRolesModel.js";
import * as Role from "../models/rolesModel.js";
import { io } from "../app.js";
import { logChangeMiddleware } from "../middlewares/logChange.js";

//ASSIGN ROLE TO DEV
export const assignRole = [ 
  async (req, res) => {
    const { developer_id, role_id } = req.body;
    await DevRole.assignRole(developer_id, role_id);
    const role = await Role.getRoleById(role_id);
    res.locals.updatedId = developer_id;
    res.locals.updatedDetails = {
      developer_id,
      role_id,
      role_name: role?.name,
      action: "assigned"
    };

    io.emit("developer:roleAssigned", { developer_id, role_id, role_name: role?.name });
    res.status(201).json({ success: true, developer_id, role_id, role_name: role?.name });
  }
];

//REMOVE ROLE
export const removeRole = [ 
  async (req, res) => {
    const { developer_id, role_id } = req.body;
    const role = await Role.getRoleById(role_id);
    res.locals.updatedId = developer_id;
    res.locals.updatedDetails = {
      developer_id,
      role_id,
      role_name: role?.name,
      action: "removed"
    };

    await DevRole.removeRole(developer_id, role_id);

    io.emit("developer:roleRemoved", { developer_id, role_id, role_name: role?.name });
    res.status(200).json({ success: true, developer_id, role_id, role_name: role?.name });
  }
];

//DELETE ROLE
export const deleteRole = [
  logChangeMiddleware("update", "developer"),
  async (req, res) => {
    const { developer_id } = req.params;
    const roles = await DevRole.getRolesByDeveloperId(developer_id);
    res.locals.deletedDetails = { developer_id, roles };
    await DevRole.deleteRole(developer_id);
    io.emit("developer:rolesCleared", { developer_id, roles });
    res.status(200).json({ success: true, developer_id, roles });
  }
];

//GET 
export const getRolesByDeveloper = async (req, res) => {
  try {
    const roles = await DevRole.getRolesByDeveloper(req.params.developer_id);
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET *
export const getDevelopers = async (req, res) => {
  try {
    const developers = await DevRole.getAllDevelopersWithRoles();
    res.json(developers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//POST
export const createRole = async (req, res) => {
  try {
    const role = await Role.createRole(req.body);
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//PUT
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.updateRole(id, req.body);
    res.json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// export const deleteRole = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Role.deleteRole(id);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

//MGA ACTIVITY LOG NA NAKA ATTACHED NA ANG MISMONG REQ
// export const updateRoleWithLog = [
//   logChangeMiddleware("update", "role"),
//   updateRole,
// ];

