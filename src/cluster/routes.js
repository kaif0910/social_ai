const express = require("express");
const clusterFeatures = require("../ai/clusterFeatures");

const router = express.Router();

/**
 * POST /cluster
 * Body: { comments: [] }
 */
router.post("/", async (req, res) => {
  const { comments } = req.body;

  if (!comments || !Array.isArray(comments)) {
    return res.status(400).json({ error: "comments array required" });
  }

  try {
    const result = await clusterFeatures(comments);
    res.json(result);
  } catch (err) {
    console.error("Cluster error:", err);
    res.status(500).json({ error: "Failed to cluster features" });
  }
});

module.exports = router;
