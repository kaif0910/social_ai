const axios = require("axios");

/**
 * Search Reddit posts by keyword and collect comments
 */
async function searchRedditComments(query, subreddit = "all") {
  try {
    // Search posts
    const searchUrl = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(
      query
    )}&restrict_sr=1&limit=5&sort=relevance&t=year`;

    const searchRes = await axios.get(searchUrl, {
      headers: { "User-Agent": "BuildSense-Feedback-Engine/1.0" },
      timeout: 15000,
    });

    const posts = searchRes.data?.data?.children || [];

    if (posts.length === 0) {
      console.log(`No posts found for query: "${query}" in r/${subreddit}`);
      return [];
    }

    let allComments = [];

    // Fetch comments for each post with rate limiting
    for (const post of posts) {
      try {
        const permalink = post.data.permalink;
        const commentsUrl = `https://www.reddit.com${permalink}.json`;

        const commentsRes = await axios.get(commentsUrl, {
          headers: { "User-Agent": "BuildSense-Feedback-Engine/1.0" },
          timeout: 15000,
        });

        const comments =
          commentsRes.data?.[1]?.data?.children
            ?.map((c) => c.data?.body)
            ?.filter((body) => body && body !== "[deleted]" && body !== "[removed]" && body.length > 5) || [];

        allComments.push(...comments);

        // Rate limiting
        await new Promise((r) => setTimeout(r, 1000));
      } catch (postErr) {
        console.warn(`Failed to fetch comments for post: ${postErr.message}`);
        continue;
      }
    }

    console.log(`Search found ${allComments.length} comments across ${posts.length} posts`);
    return allComments.slice(0, 50); // limit for AI
  } catch (err) {
    console.error("Reddit search error:", err.message);
    return [];
  }
}

module.exports = searchRedditComments;
