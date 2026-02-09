const axios = require("axios");

/**
 * Fetch ALL top-level comments from a Reddit post using pagination
 */
async function fetchPostComments(postUrl, maxComments = 200) {
  try {
    const cleanUrl = postUrl.split("?")[0];
    const baseJsonUrl = cleanUrl.replace(/\/$/, "") + ".json";

    let after = null;
    let allComments = [];

    while (allComments.length < maxComments) {
      const url = after ? `${baseJsonUrl}?after=${after}` : baseJsonUrl;

      const res = await axios.get(url, {
        headers: { "User-Agent": "founder-feedback-engine" },
      });

      if (
        !res.data ||
        !Array.isArray(res.data) ||
        !res.data[1]?.data?.children
      ) {
        break;
      }

      const children = res.data[1].data.children;

      const newComments = children
        .map((c) => c.data?.body)
        .filter(Boolean);

      allComments.push(...newComments);

      // pagination cursor
      after = res.data[1].data.after;

      // stop if no more pages
      if (!after) break;
    }

    return allComments.slice(0, maxComments);
  } catch (err) {
    console.error("Fetch post comments error:", err.message);
    return [];
  }
}

module.exports = fetchPostComments;
