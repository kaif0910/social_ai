const express = require("express");
const generatePost = require("./generatePost");
const fetchPostComments = require("../reddit/fetchPostComments");

const router = express.Router();

/**
 * POST /copilot/post
 */
router.post("/post", async (req, res) => {
  const { projectIdea, update, platform } = req.body;

  if (!projectIdea || !update || !platform) {
    return res.status(400).json({
      error: "projectIdea, update, and platform are required",
    });
  }

  try {
    const result = await generatePost({ projectIdea, update, platform });
    res.json(result);
  } catch (err) {
    console.error("Copilot post generation error:", err);
    res.status(500).json({ error: "Failed to generate post" });
  }
});

const generateReplies = require("./generateReplies");

/**
 * POST /copilot/replies
 */
router.post("/replies", async (req, res) => {
  const { postUrl, featureContext } = req.body;

  if (!postUrl || !featureContext) {
    return res.status(400).json({
      error: "postUrl and featureContext are required",
    });
  }

  try {
    const comments = await fetchPostComments(postUrl);

    if (!comments || comments.length === 0) {
      return res.status(400).json({
        error: "No comments found on this Reddit post",
      });
    }

    const result = await generateReplies({ featureContext, comments });
    res.json(result);
  } catch (err) {
    console.error("Copilot reply generation error:", err);
    res.status(500).json({ error: "Failed to generate replies" });
  }
});


module.exports = router;
