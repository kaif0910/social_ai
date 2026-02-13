const Groq = require("groq-sdk");
const safeParseJSON = require("./safeParseJSON");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function analyzeFeedback(productIdea, comments) {
  try {
    // Support both (productIdea, comments) and (comments) signatures
    if (Array.isArray(productIdea) && !comments) {
      comments = productIdea;
      productIdea = null;
    }

    if (!Array.isArray(comments) || comments.length === 0) {
      throw new Error("No comments provided to analyzeFeedback");
    }

    const sample = comments.slice(0, 50).join("\n");

    const prompt = `
You are a startup advisor AI.${productIdea ? `\n\nProduct idea being analyzed: "${productIdea}"` : ''}

Analyze these real user comments and return STRICT JSON with:
{
  "summary": "...",
  "sentiment": {
    "positive": number,
    "neutral": number,
    "negative": number
  },
  "top_features": ["feature1", "feature2", "feature3"],
  "insights": "key takeaway paragraph"
}

Rules:
- sentiment numbers must reflect comment distribution
- top_features should be max 5 most-mentioned features
- insights should be a concise strategic summary
- No text outside JSON

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

    return safeParseJSON(text);
  } catch (err) {
    console.error("Groq analysis error:", err);
    throw err;
  }
}

module.exports = analyzeFeedback;
