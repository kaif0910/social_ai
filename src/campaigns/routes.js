const express = require("express");
const pool = require("../db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken);

/**
 * GET /campaigns
 * List campaigns for logged-in user, optionally filtered by projectId (?projectId=...)
 */
router.get("/", async (req, res) => {
  const { projectId } = req.query;

  try {
    let query = `
      SELECT c.*, p.name AS project_name
      FROM campaigns c
      LEFT JOIN projects p ON c.project_id = p.id
      WHERE c.user_id = $1
    `;
    const params = [req.user.id];

    if (projectId) {
      query += ` AND c.project_id = $2`;
      params.push(projectId);
    }

    query += ` ORDER BY c.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Get campaigns error:", err);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

/**
 * POST /campaigns
 * Create a new campaign tied to a project workspace
 */
router.post("/", async (req, res) => {
  const { project_id, name, brand_voice, tone, niche } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Campaign name is required" });
  }

  const numericProjectId = parseInt(project_id, 10);
  if (!project_id || isNaN(numericProjectId)) {
    return res.status(400).json({ error: "Valid project_id is required" });
  }

  try {
    // Verify project belongs to user
    const projectCheck = await pool.query(
      "SELECT id, name FROM projects WHERE id = $1 AND user_id = $2",
      [numericProjectId, req.user.id]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: "Selected project not found or unauthorized access" });
    }

    const result = await pool.query(
      `INSERT INTO campaigns (user_id, project_id, name, brand_voice, tone, niche)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, numericProjectId, name.trim(), brand_voice || null, tone || null, niche || null]
    );

    const newCampaign = {
      ...result.rows[0],
      project_name: projectCheck.rows[0].name,
    };

    res.status(201).json(newCampaign);
  } catch (err) {
    console.error("Create campaign error:", err);
    res.status(500).json({ error: "Failed to create campaign. " + err.message });
  }
});

/**
 * DELETE /campaigns/:id
 * Delete a campaign owned by the user
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query(
      "SELECT id FROM campaigns WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Campaign not found or unauthorized access" });
    }

    const result = await pool.query(
      "DELETE FROM campaigns WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    res.json({ message: "Campaign deleted", campaign: result.rows[0] });
  } catch (err) {
    console.error("Delete campaign error:", err);
    res.status(500).json({ error: "Failed to delete campaign" });
  }
});

module.exports = router;
