const fetchPostComments = require("../reddit/fetchPostComments");
const analyzeFeedback = require("../ai/analyzeFeedback");
const clusterFeedback = require("../ai/clusterFeatures");
const generateRoadmap = require("../ai/generateRoadmap");
const pool = require("../db");

async function runFullAnalysis(projectId, redditPostUrl) {
  try {
    console.log("🚀 Running full analysis for project:", projectId);

    // 1️⃣ Fetch Reddit comments
    const comments = await fetchPostComments(redditPostUrl);

    if (!comments.length) {
      throw new Error("No comments fetched from Reddit");
    }

    console.log("💬 Comments fetched:", comments.length);

    // 2️⃣ AI sentiment + insight analysis
    const analysis = await analyzeFeedback(comments);

    console.log("🧠 AI analysis done");

    // 3️⃣ Cluster feedback themes
    const clusters = await clusterFeedback(comments);

    console.log("🧩 Clustering done");

    // 4️⃣ Generate roadmap from clusters
    const roadmap = await generateRoadmap(clusters);

    console.log("🗺️ Roadmap generated");

    // 5️⃣ Save analysis record
    const analysisInsert = await pool.query(
      `
      INSERT INTO analyses (project_id, summary, created_at)
      VALUES ($1, $2, NOW())
      RETURNING id
      `,
      [projectId, analysis.summary || "AI analysis"]
    );

    const analysisId = analysisInsert.rows[0].id;

    // 6️⃣ Save roadmap JSON
    await pool.query(
      `
      UPDATE analyses
      SET roadmap = $1
      WHERE id = $2
      `,
      [JSON.stringify(roadmap), analysisId]
    );

    console.log("💾 Saved to database");

    return {
      success: true,
      commentsFetched: comments.length,
      analysis,
      clusters,
      roadmap,
    };
  } catch (err) {
    console.error("❌ Full analysis failed:", err.message);
    throw err;
  }
}

module.exports = runFullAnalysis;
