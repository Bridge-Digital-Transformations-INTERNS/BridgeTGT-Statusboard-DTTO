import express from "express";
import cors from "cors";
import { createServer } from "http";
import { networkInterfaces } from "os";
import process from "process";

const app = express();
const server = createServer(app);
// Configuration

const PORT = process.env.VITE_SERVER_PORT || 3001;
const HOST = process.env.VITE_SERVER_HOST || "0.0.0.0";
const COMPANY_NETWORK = process.env.VITE_COMPANY_NETWORK_RANGE || "10.0.0.0/24";

// Middleware
app.use(
  cors({
    origin: [
      //ALLOWED CORS TO COMMUNICATE BACK AND FORTH
      "http://localhost:10000",
      "http://localhost:3001",
      "http://bridgetgt.statusboard:10000",
      "http://bridgetgt.statusboard:3001",

      /^http:\/\/10\.0\.0\.\d+:10000$/,
      /^http:\/\/10\.0\.0\.\d+:3001$/,
      /^http:\/\/.*\.bridge\.digital\.statusboard:10000$/,
      /^http:\/\/.*\.bridge\.digital\.statusboard:3001$/,
    ],
    credentials: true,
  }),
);
app.use(express.json());

// Network validation function
function isCompanyNetwork(clientIP) {
  const [networkAddr, cidr] = COMPANY_NETWORK.split("/");
  const networkParts = networkAddr.split(".").map(Number);
  const clientParts = clientIP.split(".").map(Number);

  if (cidr === "24") {
    return (
      networkParts[0] === clientParts[0] &&
      networkParts[1] === clientParts[1] &&
      networkParts[2] === clientParts[2]
    );
  }

  return false;
}

// Get client IP helper
function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null)
  );
}

// Routes
app.get("/api/network-check", (req, res) => {
  try {
    const clientIP = getClientIP(req);
    console.log(`Network check request from IP: ${clientIP}`);

    // Clean IPv6 mapped IPv4 addresses
    const cleanIP = clientIP?.replace(/^::ffff:/, "") || "127.0.0.1";

    // Check if it's localhost (for development)
    const isLocalhost = cleanIP === "127.0.0.1" || cleanIP === "localhost";

    // Check if it's company network
    const isCompanyNet = isCompanyNetwork(cleanIP);

    // Allow access for localhost (development) and company network
    const isAllowed = isLocalhost || isCompanyNet;

    const response = {
      isCompanyNetwork: isAllowed,
      clientIP: cleanIP,
      message: isAllowed
        ? "Access granted: Connected to authorized network"
        : "Access denied: Company network required",
      networkInfo: {
        allowedRange: COMPANY_NETWORK,
        isLocalhost,
        isCompanyNetwork: isCompanyNet,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error("Network check error:", error);
    res.status(500).json({
      isCompanyNetwork: false,
      message: "Network validation service error",
      error: error.message,
    });
  }
});
// Health check endpoint
app.get("/api/health", (_, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    serverInfo: {
      host: HOST,
      port: PORT,
      companyNetwork: COMPANY_NETWORK,
    },
  });
});

// Get server network info
app.get("/api/server-info", (_, res) => {
  const interfaces = networkInterfaces();
  const serverIPs = [];

  Object.keys(interfaces).forEach((name) => {
    interfaces[name].forEach((iface) => {
      if (iface.family === "IPv4" && !iface.internal) {
        serverIPs.push({
          interface: name,
          address: iface.address,
          netmask: iface.netmask,
        });
      }
    });
  });

  res.json({
    serverIPs,
    companyNetwork: COMPANY_NETWORK,
    allowedOrigins: ["http://localhost:10000", "http://localhost:3001", "http://192.168.1.18:3001"],
  });
});

// Start server
server.listen(PORT, HOST, () => {
  console.log(` Bridge TGT Network Server running on http://${HOST}:${PORT}`);
  console.log(` Company Network Range: ${COMPANY_NETWORK}`);
  console.log(` Network validation enabled`);

  // Display server IPs
  const interfaces = networkInterfaces();
  console.log("\n Server accessible on:");
  Object.keys(interfaces).forEach((name) => {
    interfaces[name].forEach((iface) => {
      if (iface.family === "IPv4" && !iface.internal) {
        console.log(`   http://${iface.address}:${PORT}`);
      }
    });
  });
  console.log(`   http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Please stop the existing server or use a different port.`,
    );
    process.exit(1);
  } else {
    console.error("Server error:", err);
    process.exit(1);
  }
});

export default app;
