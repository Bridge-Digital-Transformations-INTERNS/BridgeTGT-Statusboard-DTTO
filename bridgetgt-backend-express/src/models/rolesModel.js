import pool from "../config/db.js";

export const getAllRoles = async () => {
  const [rows] = await pool.query("SELECT * FROM roles");
  return rows;
};

export const getRoleById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM roles WHERE id = ?", [id]);
  return rows[0];
};

export const createRole = async (name) => {
  const [result] = await pool.query("INSERT INTO roles (name) VALUES (?)", [
    name,
  ]);
  return { id: result.insertId, name };
};

export const updateRole = async (id, name) => {
  const [result] = await pool.query("UPDATE roles SET name = ? WHERE id = ?", [
    name,
    id,
  ]);
  return result.affectedRows;
};

export const deleteRole = async (id) => {
  const [result] = await pool.query("DELETE FROM roles WHERE id = ?", [id]);
  return result.affectedRows;
};
