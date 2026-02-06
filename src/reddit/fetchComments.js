const snoowrap = require("snoowrap");
require("dotenv").config();

const reddit = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

/**
 * Fetch comments from a Reddit post URL
 */
async function fetchCommentsFromPost(postUrl) {
  const submission = await reddit.getSubmission(postUrl).expandReplies({
    limit: 20,
    depth: 2,
  });

  const comments = submission.comments.map((c) => ({
    username: c.author?.name || "unknown",
    content: c.body,
    comment_id: c.id,
  }));

  return comments;
}

module.exports = fetchCommentsFromPost;
