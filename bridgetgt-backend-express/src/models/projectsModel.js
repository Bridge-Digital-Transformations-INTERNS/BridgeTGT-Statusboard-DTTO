import pool from "../config/db.js";

export const getAllProjects = async () => {
  const [rows] = await pool.query("SELECT * FROM projects");
  return rows;
};

export const getProjectById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM projects WHERE id = ?", [id]);
  return rows[0];
};

export const createProject = async (name) => {
  const [result] = await pool.query("INSERT INTO projects (name) VALUES (?)", [
    name,
  ]);
  return { id: result.insertId, name };
};

export const updateProject = async (id, name) => {
  const [result] = await pool.query(
    "UPDATE projects SET name = ? WHERE id = ?",
    [name, id],
  );
  return result.affectedRows;
};

export const deleteProject = async (id) => {
  const [result] = await pool.query("DELETE FROM projects WHERE id = ?", [id]);
  return result.affectedRows;
};
