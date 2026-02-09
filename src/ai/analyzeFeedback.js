const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function analyzeFeedback(comments) {
  try {
    if (!Array.isArray(comments) || comments.length === 0) {
      throw new Error("No comments provided to analyzeFeedback");
    }

    const sample = comments.slice(0, 50).join("\n");

    const prompt = `
You are a startup advisor AI.

Analyze these real user comments and return STRICT JSON with:
{
  "summary": "...",
  "agreement": number,
  "neutral": number,
  "disagreement": number,
  "top_requested_change": "...",
  "recommended_next_feature": "..."
}

Comments:
${sample}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // fast & free on Groq
      messages: [
        { role: "system", content: "You are a precise JSON generator." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    const text = completion.choices[0].message.content;

    // 🛡️ Safe JSON parse
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");

    const cleanJson = text.slice(jsonStart, jsonEnd + 1);

    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("Groq analysis error:", err);
    throw err;
  }
}

module.exports = analyzeFeedback;
