const express = require("express");
const pool = require("../db");
const fetchPostComments = require("../reddit/fetchPostComments");
const analyzePostFeedback = require("../ai/analyzePostFeedback");

const router = express.Router();

/**
 * POST /analyze/post
 */
router.post("/", async (req, res) => {
  const { projectId, postUrl, featureContext } = req.body;

  if (!projectId || !postUrl || !featureContext) {
    return res.status(400).json({
      error: "projectId, postUrl, and featureContext are required",
    });
  }

  try {
    // 1️⃣ fetch comments
    const comments = await fetchPostComments(postUrl);

    if (!comments.length) {
      return res.json({ message: "No comments found on this post." });
    }

    // 2️⃣ AI analysis
    const result = await analyzePostFeedback(featureContext, comments);

    // 3️⃣ save to DB
    await pool.query(
      `INSERT INTO post_feedback
      (project_id, post_url, feature_context,
       agreement, neutral, disagreement,
       top_requested_change, confusions, recommended_next_feature)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        projectId,
        postUrl,
        featureContext,
        result.sentiment.agreement,
        result.sentiment.neutral,
        result.sentiment.disagreement,
        result.top_requested_change,
        JSON.stringify(result.confusions),
        result.recommended_next_feature,
      ]
    );

    res.json(result);
  } catch (err) {
    console.error("Post feedback analyze error:", err);
    res.status(500).json({ error: "Post feedback analysis failed" });
  }
});

module.exports = router;
