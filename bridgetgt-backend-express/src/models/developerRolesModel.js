import pool from "../config/db.js";

export const assignRole = async (developer_id, role_id) => {
  const [result] = await pool.query(
    "INSERT INTO developer_roles (developer_id, role_id) VALUES (?, ?)",
    [developer_id, role_id],
  );
  return result.affectedRows;
};

export const removeRole = async (developer_id, role_id) => {
  const [result] = await pool.query(
    "DELETE FROM developer_roles WHERE developer_id = ? AND role_id = ?",
    [developer_id, role_id],
  );
  return result.affectedRows;
};

export const getRolesByDeveloper = async (developer_id) => {
  const [rows] = await pool.query(
    "SELECT r.* FROM roles r JOIN developer_roles dr ON r.id = dr.role_id WHERE dr.developer_id = ?",
    [developer_id],
  );
  return rows;
};

export const getAllDevelopersWithRoles = async () => {
  const [developers] = await pool.query("SELECT * FROM developers");
  for (const dev of developers) {
    const [roles] = await pool.query(
      "SELECT r.* FROM roles r JOIN developer_roles dr ON r.id = dr.role_id WHERE dr.developer_id = ?",
      [dev.id],
    );
    dev.roles = roles.map((r) => r.name);
  }
  return developers;
};
