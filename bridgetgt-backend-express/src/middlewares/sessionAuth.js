import { getSessionByToken } from "../models/authSessionsModel.js";

export const sessionAuth = async (req, res, next) => {
  const token =
    req.headers["x-session-token"] || (req.body && req.body.session_token);
  if (!token) {
    return res.status(401).json({ error: "Session token required" });
  }
  const session = await getSessionByToken(token);
  if (!session) {
    return res.status(401).json({ error: "Invalid or expired session token" });
  }

  req.session = session;
  next();
};
