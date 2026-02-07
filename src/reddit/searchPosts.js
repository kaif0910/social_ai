const axios = require("axios");

/**
 * Search Reddit posts by keyword and collect comments
 */
async function searchRedditComments(query, subreddit = "all") {
  try {
    // Search posts
    const searchUrl = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(
      query
    )}&restrict_sr=1&limit=5`;

    const searchRes = await axios.get(searchUrl, {
      headers: { "User-Agent": "founder-feedback-analyzer" },
    });

    const posts = searchRes.data.data.children;

    let allComments = [];

    // Fetch comments for each post
    for (const post of posts) {
      const permalink = post.data.permalink;
      const commentsUrl = `https://www.reddit.com${permalink}.json`;

      const commentsRes = await axios.get(commentsUrl, {
        headers: { "User-Agent": "founder-feedback-analyzer" },
      });

      const comments =
        commentsRes.data[1].data.children
          .map((c) => c.data?.body)
          .filter(Boolean) || [];

      allComments.push(...comments);
    }

    return allComments.slice(0, 50); // limit for AI
  } catch (err) {
    console.error("Reddit search error:", err.message);
    return [];
  }
}

module.exports = searchRedditComments;
