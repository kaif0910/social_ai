const express = require("express");
const pool = require("../db");

const router = express.Router();

/**
 * GET /projects/:id/summary
 */
router.get("/:id/summary", async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ total counts
    const analysesCount = await pool.query(
      "SELECT COUNT(*) FROM analyses WHERE project_id = $1",
      [id]
    );

    const feedbackCount = await pool.query(
      "SELECT COUNT(*) FROM post_feedback WHERE project_id = $1",
      [id]
    );

    // 2️⃣ overall sentiment from post_feedback
    const sentiment = await pool.query(
      `
      SELECT
        COALESCE(SUM(agreement),0) AS agreement,
        COALESCE(SUM(neutral),0) AS neutral,
        COALESCE(SUM(disagreement),0) AS disagreement
      FROM post_feedback
      WHERE project_id = $1
      `,
      [id]
    );

    // 3️⃣ most requested change
    const topChange = await pool.query(
      `
      SELECT top_requested_change, COUNT(*) as count
      FROM post_feedback
      WHERE project_id = $1
      GROUP BY top_requested_change
      ORDER BY count DESC
      LIMIT 1
      `,
      [id]
    );

    // 4️⃣ latest recommendation
    const latestRecommendation = await pool.query(
      `
      SELECT recommended_next_feature
      FROM post_feedback
      WHERE project_id = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [id]
    );

    res.json({
      totalAnalyses: Number(analysesCount.rows[0].count),
      totalFeedbackPosts: Number(feedbackCount.rows[0].count),

      sentiment: sentiment.rows[0],

      mostRequestedChange: topChange.rows[0] || null,
      latestRecommendation: latestRecommendation.rows[0] || null,
    });
  } catch (err) {
    console.error("Project summary error:", err);
    res.status(500).json({ error: "Failed to fetch project summary" });
  }
});

module.exports = router;
