import dotenv from "dotenv";
dotenv.config(); 
import mysql from "mysql2/promise";

// ENV TESTER
// console.log("Loaded ENV:", {
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   pass: process.env.DB_PASS ? "(hidden)" : "(empty)",
//   db: process.env.DB_NAME,
// });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00', // Use UTC to avoid timezone inconsistencies
});

export default pool;
