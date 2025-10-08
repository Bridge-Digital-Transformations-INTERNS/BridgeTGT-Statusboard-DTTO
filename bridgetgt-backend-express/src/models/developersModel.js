import pool from '../config/db.js'

export const getAllDevelopers = async () => {
  const [rows] = await pool.query("SELECT * FROM developers");
  return rows;
};

export const getDeveloperById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM developers WHERE id = ?", [
    id,
  ]);
  return rows[0];
};

export const createDeveloper = async (name, color, profile_picture = null) => {
  const [result] = await pool.query(
    "INSERT INTO developers (name, color, profile_picture) VALUES (?, ?, ?)",
    [name, color, profile_picture],
  );
  return { id: result.insertId, name, color, profile_picture };
};

export const updateDeveloper = async (id, name, color, profile_picture = null) => {
  const [result] = await pool.query(
    "UPDATE developers SET name = ?, color = ?, profile_picture = ? WHERE id = ?",
    [name, color, profile_picture, id],
  );
  return result.affectedRows;
};

export const deleteDeveloper = async (id) => {
  const [result] = await pool.query("DELETE FROM developers WHERE id = ?", [
    id,
  ]);
  return result.affectedRows;
};

export const getDevelopersPaginated = async (page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;
  const [[{ count }]] = await pool.query("SELECT COUNT(*) as count FROM developers");
  const [rows] = await pool.query(
    "SELECT * FROM developers ORDER BY id DESC LIMIT ? OFFSET ?",
    [pageSize, offset]
  );
  return { rows, total: count };
};
