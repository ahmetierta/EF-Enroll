const express = require("express");
const cors = require("cors");

const AppDataSource = require("./data-source");
const config = require("./config/env");
const routes = require("./routes");

const app = express();

app.use(cors(config.cors.options));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    name: "EF Enroll API",
    status: "running",
    health: "/health",
  });
});

app.get("/health", async (req, res) => {
  try {
    await AppDataSource.query("SELECT 1");
    res.json({
      status: "ok",
      database: "connected",
      uptime_seconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: "degraded",
      database: "disconnected",
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.use(routes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

AppDataSource.initialize()
  .then(() => {
    console.log("TypeORM connected");

    app.listen(config.server.port, () => {
      console.log(`Serveri po punon ne portin ${config.server.port}`);
    });
  })
  .catch((err) => {
    console.log("Gabim ne lidhje me TypeORM:", err);
  });
