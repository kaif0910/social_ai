const express = require("express");
const pool = require("../db");
const generateReply = require("../ai/reply");

const router = express.Router();

/* Create campaign */
router.post("/", async (req, res) => {
  const { name, brand_voice, tone, niche } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO campaigns (name, brand_voice, tone, niche) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, brand_voice || null, tone || null, niche || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create campaign error:", err);
    res.status(500).json({ error: "Failed to create campaign" });
  }
});

/* Generate reply using campaign */
router.post("/:id/reply", async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({ error: "comment is required" });
  }

  try {
    const campaign = await pool.query("SELECT * FROM campaigns WHERE id=$1", [id]);

    if (campaign.rows.length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const reply = await generateReply(comment, campaign.rows[0]);
    res.json({ reply });
  } catch (err) {
    console.error("Campaign reply error:", err);
    res.status(500).json({ error: "Failed to generate reply" });
  }
});

module.exports = router;
