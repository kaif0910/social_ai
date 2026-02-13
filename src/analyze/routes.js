const express = require("express");
const searchRedditComments = require("../reddit/searchPosts");
const analyzeFeedback = require("../ai/analyzeFeedback");

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("➡️ /analyze route hit");

  const { productIdea, subreddit } = req.body;

  if (!productIdea) {
    console.log("❌ No productIdea provided");
    return res.status(400).json({ error: "productIdea is required" });
  }

  try {
    console.log("🔎 Fetching Reddit comments...");

    const comments = await searchRedditComments(
      productIdea,
      subreddit || "all"
    );

    console.log("📝 Comments fetched:", comments.length);

    if (!comments.length) {
      return res.json({
        message: "No Reddit discussions found for this idea yet.",
      });
    }

    console.log("🤖 Sending to AI for analysis...");

    const insights = await analyzeFeedback(productIdea, comments);

    console.log("✅ AI analysis done");

    const pool = require("../db");

// save to DB
await pool.query(
  `INSERT INTO analyses 
  (product_idea, subreddit, sentiment_positive, sentiment_neutral, sentiment_negative, feature_clusters, insights)
  VALUES ($1,$2,$3,$4,$5,$6,$7)`,
  [
    productIdea,
    subreddit || "all",
    insights.sentiment?.positive ?? 0,
    insights.sentiment?.neutral ?? 0,
    insights.sentiment?.negative ?? 0,
    JSON.stringify(insights.top_features || []),
    insights.insights || insights.summary || "",
  ]
);


    res.json({
      totalCommentsAnalyzed: comments.length,
      insights,
    });
  } catch (err) {
    console.error("🔥 Analyze error:", err);
    res.status(500).json({ error: "Analysis failed" });
  }
});


router.get("/", async (req, res) => {
  const pool = require("../db");
  try {
    const result = await pool.query(
        "SELECT * FROM analyses ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("🔥 Fetch analyses error:", err);
    res.status(500).json({ error: "Failed to fetch analyses" });
  }
});

router.get("/:id", async (req, res) => {
  const pool = require("../db");
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM analyses WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Analysis not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("🔥 Fetch analysis error:", err);
    res.status(500).json({ error: "Failed to fetch analysis" });
  }
});

module.exports = router;
