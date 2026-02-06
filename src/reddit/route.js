const express = require("express");
const pool = require("../db");
const fetchCommentsFromPost = require("./fetchComments");
const generateReply = require("../ai/reply");

const router = express.Router();

/**
 * Fetch comments from a Reddit post and generate AI replies
 */
router.post("/import", async (req, res) => {
  const { campaignId, postUrl } = req.body;

  try {
    // 1️⃣ Get campaign
    const campaignRes = await pool.query(
      "SELECT * FROM campaigns WHERE id=$1",
      [campaignId]
    );

    if (!campaignRes.rows.length) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const campaign = campaignRes.rows[0];

    // 2️⃣ Fetch Reddit comments
    const comments = await fetchCommentsFromPost(postUrl);

    const saved = [];

    // 3️⃣ Generate replies + store
    for (const c of comments) {
      const aiReply = await generateReply(c.content, campaign);

      const replyStatus =
        campaign.mode === "auto" ? "auto-replied" : "pending";

      const dbRes = await pool.query(
        `INSERT INTO comments 
        (campaign_id, username, content, ai_reply, reply_status)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *`,
        [campaignId, c.username, c.content, aiReply, replyStatus]
      );

      saved.push(dbRes.rows[0]);
    }

    res.json({
      imported: saved.length,
      comments: saved,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Reddit import failed" });
  }
});

module.exports = router;
