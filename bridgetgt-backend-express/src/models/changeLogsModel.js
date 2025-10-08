import pool from "../config/db.js";

// Insert a new change log
export const logChange = async ({
  session_id,
  action,
  entity,
  entity_id,
  details,
}) => {
  const [result] = await pool.query(
    "INSERT INTO change_logs (session_id, action, entity, entity_id, details, timestamp) VALUES (?, ?, ?, ?, ?, NOW())",
    [session_id, action, entity, entity_id, details],
  );
  return result.insertId;
};

// Get all raw change logs
export const getAllChangeLogs = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM change_logs ORDER BY timestamp DESC",
  );
  return rows;
};

//GET WITH SESSION INFO
export const getAllChangeLogsWithSession = async () => {
  const [rows] = await pool.query(`
    SELECT 
      cl.*,
      CAST(JSON_OBJECT(
        'id', s.id,
        'username', s.username,
        'account_type', s.account_type,
        'avatar_url', s.avatar_url
      ) AS JSON) as session
    FROM change_logs cl
    LEFT JOIN auth_sessions s ON cl.session_id = s.id
    ORDER BY cl.timestamp DESC
  `);

  return rows.map(row => ({
    ...row,
    session: row.session || null,
  }));
};
// changeLogsModel.js
export const getPaginatedChangeLogs = async (page = 1, pageSize = 20) => {
  const offset = (page - 1) * pageSize;

  const [rows] = await pool.query(`
    SELECT 
      cl.*,
      CAST(JSON_OBJECT(
        'id', s.id,
        'username', s.username,
        'account_type', s.account_type,
        'avatar_url', s.avatar_url
      ) AS JSON) as session
    FROM change_logs cl
    LEFT JOIN auth_sessions s ON cl.session_id = s.id
    ORDER BY cl.timestamp DESC
    LIMIT ? OFFSET ?
  `, [pageSize, offset]);

  // Count total logs for pagination metadata
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM change_logs`);

  return {
    data: rows.map(row => ({ ...row, session: row.session || null })),
    total
  };
};
