const axios = require("axios");

/**
 * Fetch comments from a specific Reddit post URL (safe version)
 */
async function fetchPostComments(postUrl) {
  try {
    // 1️⃣ remove query params like ?utm_source=...
    const cleanUrl = postUrl.split("?")[0];

    // 2️⃣ ensure .json endpoint
    const jsonUrl = cleanUrl.replace(/\/$/, "") + ".json";

    const res = await axios.get(jsonUrl, {
      headers: { "User-Agent": "founder-feedback-engine" },
    });

    // 3️⃣ validate structure safely
    if (
      !res.data ||
      !Array.isArray(res.data) ||
      !res.data[1] ||
      !res.data[1].data ||
      !res.data[1].data.children
    ) {
      return [];
    }

    // 4️⃣ extract comment bodies
    const comments = res.data[1].data.children
      .map((c) => c.data?.body)
      .filter(Boolean);

    return comments.slice(0, 50);
  } catch (err) {
    console.error("Fetch post comments error:", err.message);
    return [];
  }
}

module.exports = fetchPostComments;
