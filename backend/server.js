const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const dataRoutes = require("./routes/data");
const adminRoutes = require("./routes/admin");
const publicRoutes = require("./routes/public");
const { testConnection } = require("./db/mysql");

const app = express();
const port = Number(process.env.PORT || 3000);
const frontendUrl = process.env.FRONTEND_URL || true;

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json({ limit: "25mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);

app.get("/api/health", async (_req, res, next) => {
  try {
    await testConnection();
    res.json({ ok: true, service: "VASMA System API" });
  } catch (error) {
    next(error);
  }
});

const frontendPath = path.resolve(__dirname, "../frontend");
app.use(express.static(frontendPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

function friendlyError(error) {
  if (error.code === "ECONNREFUSED") {
    return "MySQL database is not running or not reachable. Start/install MySQL and import backend/schema.sql.";
  }
  if (error.code === "ER_BAD_DB_ERROR") {
    return `Database '${process.env.DB_NAME || "vasma_db"}' does not exist. Import backend/schema.sql.`;
  }
  if (error.code === "ER_NO_SUCH_TABLE") {
    return "Required database table is missing. Import backend/schema.sql.";
  }
  if (error.code === "ER_ACCESS_DENIED_ERROR") {
    return "MySQL username or password is wrong. Check backend/.env.";
  }
  return error.message || "Server error";
}

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.statusCode || 500).json({ success: false, error: friendlyError(error), code: error.code || "SERVER_ERROR" });
});

app.listen(port, () => {
  console.log(`VASMA System API running on http://localhost:${port}`);
  console.log(`Frontend served from ${frontendPath}`);
});
