const express = require("express");
const pool = require("../db");
const runFullAnalysis = require("./fullAnalysis");

const router = express.Router();

/**
 * GET /projects
 * List all projects
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, created_at FROM projects ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get projects error:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

/**
 * POST /projects/:id/full-analysis
 * Runs full AI pipeline
 */
router.post("/:id/full-analysis", async (req, res) => {
  const { id } = req.params;
  const { redditPostUrl } = req.body;

  if (!redditPostUrl) {
    return res.status(400).json({ error: "redditPostUrl required" });
  }

  try {
    const result = await runFullAnalysis(id, redditPostUrl);
    res.json(result);
  } catch (err) {
    console.error("Full analysis error:", err);
    res.status(500).json({ error: "Failed to run full analysis" });
  }
});

/**
 * GET /projects/:id/analysis
 * Returns saved AI results
 */
router.get("/:id/analysis", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT last_analysis, last_clusters, last_roadmap
       FROM projects
       WHERE id = $1`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get analysis error:", err);
    res.status(500).json({ error: "Failed to fetch analysis" });
  }
});

/**
 * GET /projects/:id/summary
 * Dashboard overview stats
 */
router.get("/:id/summary", async (req, res) => {
  const { id } = req.params;

  try {
    const analysesCount = await pool.query(
      "SELECT COUNT(*) FROM analyses WHERE project_id = $1",
      [id]
    );

    const feedbackCount = await pool.query(
      "SELECT COUNT(*) FROM post_feedback WHERE project_id = $1",
      [id]
    );

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

/**
 * GET /projects/:id/sentiment-trend
 * For chart visualization
 */
router.get("/:id/sentiment-trend", async (req, res) => {
  const { id } = req.params;

  try {
    const trend = await pool.query(
      `
      SELECT
        DATE(created_at) as date,
        SUM(agreement) as agreement,
        SUM(neutral) as neutral,
        SUM(disagreement) as disagreement
      FROM post_feedback
      WHERE project_id = $1
      GROUP BY DATE(created_at)
      ORDER BY date ASC
      `,
      [id]
    );

    res.json(trend.rows);
  } catch (err) {
    console.error("Sentiment trend error:", err);
    res.status(500).json({ error: "Failed to fetch sentiment trend" });
  }
});

module.exports = router;
