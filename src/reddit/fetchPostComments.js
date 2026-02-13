const axios = require("axios");

/**
 * Fetch ALL top-level comments from a Reddit post using pagination
 */
async function fetchPostComments(postUrl, maxComments = 200) {
  try {
    // Validate URL
    if (!postUrl || typeof postUrl !== "string") {
      throw new Error("Invalid post URL provided");
    }

    const cleanUrl = postUrl.split("?")[0];
    const baseJsonUrl = cleanUrl.replace(/\/$/, "") + ".json";

    let after = null;
    let allComments = [];
    let retries = 0;
    const maxRetries = 3;

    while (allComments.length < maxComments) {
      const url = after ? `${baseJsonUrl}?after=${after}` : baseJsonUrl;

      try {
        const res = await axios.get(url, {
          headers: { "User-Agent": "BuildSense-Feedback-Engine/1.0" },
          timeout: 15000,
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
          .filter((body) => body && body !== "[deleted]" && body !== "[removed]" && body.length > 5);

        allComments.push(...newComments);

        // pagination cursor
        after = res.data[1].data.after;

        // stop if no more pages
        if (!after) break;

        // Rate limit: small delay between requests
        await new Promise((r) => setTimeout(r, 1000));
      } catch (reqErr) {
        if (reqErr.response?.status === 429 && retries < maxRetries) {
          retries++;
          console.warn(`Rate limited, retrying (${retries}/${maxRetries})...`);
          await new Promise((r) => setTimeout(r, 2000 * retries));
          continue;
        }
        throw reqErr;
      }
    }

    console.log(`Fetched ${allComments.length} comments from Reddit`);
    return allComments.slice(0, maxComments);
  } catch (err) {
    console.error("Fetch post comments error:", err.message);
    if (err.response?.status === 404) {
      throw new Error("Reddit post not found. Check the URL and try again.");
    }
    if (err.response?.status === 403) {
      throw new Error("Reddit post is private or inaccessible.");
    }
    return [];
  }
}

module.exports = fetchPostComments;
