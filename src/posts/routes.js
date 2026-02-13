const express = require("express");
const pool = require("../db");
const generatePost = require("../ai/content");

const router = express.Router();

/* Generate AI post */
router.post("/:campaignId/generate", async (req, res) => {
  const { campaignId } = req.params;

  try {
    const campaign = await pool.query(
      "SELECT * FROM campaigns WHERE id=$1",
      [campaignId]
    );

    if (!campaign.rows.length) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const content = await generatePost(campaign.rows[0]);

    const post = await pool.query(
      "INSERT INTO posts (campaign_id, content, platform, status) VALUES ($1,$2,$3,$4) RETURNING *",
      [campaignId, content, "reddit", "draft"]
    );

    res.json(post.rows[0]);
  } catch (err) {
    console.error("Generate post error:", err);
    res.status(500).json({ error: "Failed to generate post" });
  }
});

module.exports = router;
