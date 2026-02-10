const express = require("express");
const clusterFeatures = require("../ai/clusterFeatures");
const fetchPostComments = require("../reddit/fetchPostComments");

const router = express.Router();

/**
 * POST /cluster
 * Body: { comments: [] }
 */
router.post("/", async (req, res) => {
  const { comments } = req.body;

  if (!comments || !Array.isArray(comments)) {
    return res.status(400).json({ error: "comments array required" });
  }

  try {
    const result = await clusterFeatures(comments);
    res.json(result);
  } catch (err) {
    console.error("Cluster error:", err);
    res.status(500).json({ error: "Failed to cluster features" });
  }
});

/**
 * POST /cluster/url
 * Body: { postUrl: string }
 * Fetches comments from a Reddit post URL, then clusters them
 */
router.post("/url", async (req, res) => {
  const { postUrl } = req.body;

  if (!postUrl) {
    return res.status(400).json({ error: "postUrl is required" });
  }

  try {
    const comments = await fetchPostComments(postUrl, 150);

    if (!comments || comments.length === 0) {
      return res
        .status(400)
        .json({ error: "No comments found for this post URL" });
    }

    const result = await clusterFeatures(comments);
    res.json({
      ...result,
      totalCommentsFetched: comments.length,
      sourceUrl: postUrl,
    });
  } catch (err) {
    console.error("Cluster from URL error:", err);
    res.status(500).json({ error: "Failed to fetch and cluster comments" });
  }
});

module.exports = router;
