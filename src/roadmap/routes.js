const express = require("express");
const generateRoadmap = require("../ai/generateRoadmap");

const router = express.Router();

/**
 * POST /roadmap
 * Body: clustered feature JSON
 */
router.post("/", async (req, res) => {
  const clusteredData = req.body;

  if (!clusteredData || !clusteredData.features) {
    return res.status(400).json({ error: "clustered feature data required" });
  }

  try {
    const result = await generateRoadmap(clusteredData);
    res.json(result);
  } catch (err) {
    console.error("Roadmap error:", err);
    res.status(500).json({ error: "Failed to generate roadmap" });
  }
});

module.exports = router;
