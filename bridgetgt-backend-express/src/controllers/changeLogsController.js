import { logChange, getAllChangeLogsWithSession } from "../models/changeLogsModel.js";
import { getPaginatedChangeLogs } from "../models/changeLogsModel.js";

// CHANGE LOGGER
export const createChangeLog = async (req, res) => {
  try {
    const { action, entity, entity_id, details } = req.body;
    // sessionAuth middleware attaches session info to req.session
    console.log("Session in controller:", req.session);
    console.log("Session keys:", Object.keys(req.session));
    //HHAHAHAHAHAHAHAHAHAHHA
    const session_id = req.session.id || req.session.ID || req.session.Id;
    console.log("Session ID used:", session_id);
    const insertId = await logChange({
      session_id,
      action,
      entity,
      entity_id,
      details,
    });
    res.status(201).json({ id: insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// // GET ALL CHANGE LOGS WITH SESSION INFO
// export const getChangeLogs = async (req, res) => {
//   try {
//     const logs = await getAllChangeLogsWithSession();
//     res.status(200).json(logs);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



// GET SESSION but naaay pagination 
export const getChangeLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const { data, total } = await getPaginatedChangeLogs(page, pageSize);
    res.status(200).json({
      logs: data,
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
