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
    insights.sentiment.positive,
    insights.sentiment.neutral,
    insights.sentiment.negative,
    JSON.stringify(insights.top_features),
    insights.insights,
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

module.exports = router;
