import pool from "../config/db.js";
import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { insertAuthSession, cleanupExpiredSessions, hasActiveSession, getSessionByToken } from "../models/authSessionsModel.js";
const router = express.Router();


// LOGOUT SESSION
router.post("/logout", async (req, res) => {
  const token = req.headers["x-session-token"] || req.body.session_token;
  if (!token) {
    return res.status(400).json({ error: "Session token required" });
  }
  await pool.query(
    "UPDATE auth_sessions SET is_authenticated = 0 WHERE session_token = ?",
    [token],
  );
  res.json({ success: true });
});

// GET ONLINE
router.get("/sessions", async (req, res) => {
  // Clean up expired sessions before fetching
  await cleanupExpiredSessions();
  
  const [rows] = await pool.query(
    "SELECT username, avatar_url FROM auth_sessions WHERE is_authenticated = 1",
  );
  res.json(rows);
});

// VALIDATE SESSION - Check if session exists (1 hour from login)
// Note: Session expiry is now primarily handled on frontend
router.post("/validate-session", async (req, res) => {
  const token = req.headers["x-session-token"] || req.body.session_token;
  if (!token) {
    return res.status(401).json({ error: "Session token required" });
  }
  
  try {
    const session = await getSessionByToken(token);
    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }
    
    res.json({ valid: true, session });
  } catch (err) {
    res.status(500).json({ error: "Failed to validate session" });
  }
});

////////////////////////////// LOGIN AS ADMIN ///////////////////////////////////////////////////////

//PAG MAG SUBMIT OG COMPANY I VALIDATE DNHI
router.post("/company-key", async (req, res) => {
  const { key } = req.body;
  if (!key || key !== process.env.COMPANY_ACCESS_KEY) {
    return res.status(401).json({ error: "Invalid company key" });
  }
  
  // Check if admin is already logged in
  const isAlreadyLoggedIn = await hasActiveSession("admin");
  if (isAlreadyLoggedIn) {
    return res.status(409).json({ error: "Admin account is already logged in on another device" });
  }
  
  //IF VALID I SIGN SYA AS ADMIN
  const token = jwt.sign(
    { role: "admin", type: "company-key" },
    process.env.JWT_SECRET,
    { expiresIn: "12h" },
  );
  // GENERATE SESSION TOKEN
  const session_token =
    Math.random().toString(36).substring(2) + Date.now().toString(36);
  // INSERT SESSION TOKEN TO DB
  await insertAuthSession({
    username: "admin",
    account_type: "admin",
    avatar_url: "",
    access_token: token,
    session_token,
  });
  res.json({ token, session_token });
});


////////////////////////////// LOGIN AS GITHUB ///////////////////////////////////////////////////////

///////UNCOMMENT THIS PAG LOCAL//////////////////
// router.get("/github", (req, res) => {
//   const redirectUri = process.env.GITHUB_CALLBACK_URL;
//   const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20read:org`;
//   res.redirect(githubAuthUrl);
// });

//REFIRECT TO OAUTH PAGE
router.get("/github", (req, res) => {
  const redirectUri = process.env.GITHUB_CALLBACK_URL;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20read:org`;
  res.redirect(githubAuthUrl);
});

///////UNCOMMENT THIS PAG DOCKER//////////////////
// router.get("/github", (req, res) => {
//   const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/github/callback`;
//   const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20read:org`;
//   res.redirect(githubAuthUrl);
// });


// AFTER LOGIN
router.get("/github/callback", (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: "Missing code" });
  const frontendUrl = process.env.FRONTEND_URL + "/auth/callback";
  return res.redirect(`${frontendUrl}?code=${code}`);
});

//I EXCHANGE ANG OAUTH CODE TO GITHUB ACCESS TOKEN
router.get("/github/exchange", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: "Missing code" });
  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } },
    );
    const accessToken = tokenRes.data.access_token;
    if (!accessToken)
      return res.status(401).json({ error: "Invalid access token" });
    // FETCH USER INFO
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    // OG USER ORG
    const orgRes = await axios.get("https://api.github.com/user/orgs", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log("GitHub orgs for", userRes.data.login, ":");
    orgRes.data.forEach((org) => console.log("-", org.login));

    //CHECK IF DEVELOPER BA SYA SA ORG
    const orgName = "Bridge-Digital-Transformations-INTERNS";
    const isDeveloper = orgRes.data.some((org) => org.login === orgName);
    if (!isDeveloper)
      return res
        .status(403)
        .json({ error: "Not a developer of the organization" });

    // Check if this GitHub user is already logged in
    const isAlreadyLoggedIn = await hasActiveSession(userRes.data.login);
    if (isAlreadyLoggedIn) {
      return res.status(409).json({ error: "This GitHub account is already logged in on another device" });
    }

    //IF YES MAG ISSUE TAG JWT AND MARK THIS SESSION AS GITHUB USER
    const token = jwt.sign(
      {
        role: "user",
        type: "github",
        github_id: userRes.data.id,
        github_login: userRes.data.login,
        name: userRes.data.name,
        avatar_url: userRes.data.avatar_url,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );
    const session_token =
      Math.random().toString(36).substring(2) + Date.now().toString(36);

      
    // INSERT SESSION TO DB
    await insertAuthSession({
      username: userRes.data.login,
      account_type: "github",
      avatar_url: userRes.data.avatar_url,
      access_token: accessToken,
      session_token,
    });
    res.json({
      token,
      session_token,
      github_id: userRes.data.id,
      github_login: userRes.data.login,
      name: userRes.data.name,
      avatar_url: userRes.data.avatar_url,
      role: "user",
    });
  } catch (err) {
    console.error("GitHub exchange error:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
