import pool from "../config/db.js";

export const getSessionByToken = async (session_token) => {
  const [rows] = await pool.query(
    `SELECT *, 
     TIMESTAMPDIFF(SECOND, created_at, UTC_TIMESTAMP()) as seconds_since_login 
     FROM auth_sessions 
     WHERE session_token = ? 
     AND is_authenticated = TRUE 
     AND TIMESTAMPDIFF(SECOND, created_at, UTC_TIMESTAMP()) < 3600`,
    [session_token],
  );
  return rows[0] || null;
};

export const insertAuthSession = async ({
  username,
  account_type,
  avatar_url,
  access_token,
  session_token,
}) => {
  // First, deactivate any existing active sessions for this user
  await pool.query(
    `UPDATE auth_sessions SET is_authenticated = 0 WHERE username = ? AND is_authenticated = 1`,
    [username],
  );
  
  // Then insert the new session
  const [result] = await pool.query(
    `INSERT INTO auth_sessions (username, account_type, avatar_url, access_token, session_token) VALUES (?, ?, ?, ?, ?)`,
    [username, account_type, avatar_url, access_token, session_token],
  );
  return result.insertId;
};

// Clean up expired sessions (older than 1 hour from login)
export const cleanupExpiredSessions = async () => {
  await pool.query(
    `UPDATE auth_sessions 
     SET is_authenticated = 0 
     WHERE is_authenticated = 1 
     AND TIMESTAMPDIFF(SECOND, created_at, UTC_TIMESTAMP()) >= 3600`,
  );
};

// Update session activity timestamp
export const updateSessionActivity = async (session_token) => {
  await pool.query(
    `UPDATE auth_sessions SET updated_at = UTC_TIMESTAMP() WHERE session_token = ?`,
    [session_token],
  );
};

// Check if user already has an active session
export const hasActiveSession = async (username) => {
  const [rows] = await pool.query(
    `SELECT * FROM auth_sessions WHERE username = ? AND is_authenticated = 1`,
    [username],
  );
  return rows.length > 0;
};
