const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ── Route imports ──
const projectRoutes = require("./src/projects/routes");
const analyzeRoutes = require("./src/analyze/routes");
const postFeedbackRoutes = require("./src/postFeedback/routes");
const copilotRoutes = require("./src/copilot/routes");
const clusterRoutes = require("./src/cluster/routes");
const roadmapRoutes = require("./src/roadmap/routes");
const campaignRoutes = require("./src/campaigns/routes");
const postRoutes = require("./src/posts/routes");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// ── Health check ──
app.get("/", (req, res) => {
  res.json({
    status: "running",
    name: "Social AI Manager",
    version: "1.0.0",
    uptime: process.uptime(),
  });
});

// ── API routes ──
app.use("/projects", projectRoutes);
app.use("/analyze/post", postFeedbackRoutes); // must be before /analyze
app.use("/analyze", analyzeRoutes);
app.use("/copilot", copilotRoutes);
app.use("/cluster", clusterRoutes);
app.use("/roadmap", roadmapRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/posts", postRoutes);

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
