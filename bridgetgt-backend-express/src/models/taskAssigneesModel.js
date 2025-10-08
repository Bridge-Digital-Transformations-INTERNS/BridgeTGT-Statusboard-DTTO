import pool from "../config/db.js";

export const assignDeveloperToTask = async (task_id, developer_id) => {
  const [result] = await pool.query(
    "INSERT INTO task_assignees (task_id, developer_id) VALUES (?, ?)",
    [task_id, developer_id],
  );
  return result.affectedRows;
};

export const removeDeveloperFromTask = async (task_id, developer_id) => {
  const [result] = await pool.query(
    "DELETE FROM task_assignees WHERE task_id = ? AND developer_id = ?",
    [task_id, developer_id],
  );
  return result.affectedRows;
};

export const getDevelopersByTask = async (task_id) => {
  const [rows] = await pool.query(
    "SELECT d.* FROM developers d JOIN task_assignees ta ON d.id = ta.developer_id WHERE ta.task_id = ?",
    [task_id],
  );
  return rows;
};
