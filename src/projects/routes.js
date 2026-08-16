const express = require("express");
const pool = require("../db");
const runFullAnalysis = require("../ai/runFullAnalysis");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Enforce authentication on all project routes
router.use(authenticateToken);

/**
 * GET /projects
 * List all projects for the logged-in user
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, created_at FROM projects WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get projects error:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

/**
 * POST /projects
 * Create a new project for the logged-in user
 */
router.post("/", async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO projects (user_id, name, description) VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, name, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

/**
 * GET /projects/:id
 * Get a single project by ID (scoped to owner)
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found or unauthorized access" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get project error:", err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

/**
 * PUT /projects/:id
 * Update a project (scoped to owner)
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  try {
    const result = await pool.query(
      `UPDATE projects SET name = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *`,
      [name, description || null, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found or unauthorized access" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update project error:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

/**
 * DELETE /projects/:id
 * Delete a project and its related data (scoped to owner)
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Verify ownership first
    const check = await pool.query("SELECT id FROM projects WHERE id = $1 AND user_id = $2", [id, req.user.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Project not found or unauthorized access" });
    }

    // Delete related data first
    await pool.query("DELETE FROM post_feedback WHERE project_id = $1", [id]);
    await pool.query("DELETE FROM analyses WHERE project_id = $1", [id]);

    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    res.json({ message: "Project deleted", project: result.rows[0] });
  } catch (err) {
    console.error("Delete project error:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

/**
 * GET /projects/:id/feedback
 * List all post feedback for a project (scoped to owner)
 */
router.get("/:id/feedback", async (req, res) => {
  const { id } = req.params;

  try {
    // Verify project ownership
    const check = await pool.query("SELECT id FROM projects WHERE id = $1 AND user_id = $2", [id, req.user.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Project not found or unauthorized access" });
    }

    const result = await pool.query(
      `SELECT * FROM post_feedback WHERE project_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get project feedback error:", err);
    res.status(500).json({ error: "Failed to fetch project feedback" });
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
    const check = await pool.query("SELECT id FROM projects WHERE id = $1 AND user_id = $2", [id, req.user.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Project not found or unauthorized access" });
    }

    const result = await runFullAnalysis(id, redditPostUrl);
    res.json(result);
  } catch (err) {
    console.error("❌ Full analysis error:", err);
    res.status(500).json({
      error: "Failed to run full analysis",
      realError: err.message,
    });
  }
});

/**
 * GET /projects/:id/analysis
 * Returns saved AI results
 */
router.get("/:id/analysis", async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query("SELECT id FROM projects WHERE id = $1 AND user_id = $2", [id, req.user.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Project not found or unauthorized access" });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM analyses
      WHERE project_id = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.json({ last_roadmap: null });
    }

    const analysis = result.rows[0];

    return res.json({
      last_roadmap: analysis.roadmap ? JSON.parse(analysis.roadmap) : null,
    });
  } catch (err) {
    console.error("Get analysis error:", err);
    return res.status(500).json({
      error: "Failed to fetch analysis",
      realError: err.message,
    });
  }
});

/**
 * GET /projects/:id/summary
 * Dashboard overview stats
 */
router.get("/:id/summary", async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query("SELECT id FROM projects WHERE id = $1 AND user_id = $2", [id, req.user.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Project not found or unauthorized access" });
    }

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
    const check = await pool.query("SELECT id FROM projects WHERE id = $1 AND user_id = $2", [id, req.user.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Project not found or unauthorized access" });
    }

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
