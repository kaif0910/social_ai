const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function analyzeFeedback(productIdea, comments) {
  try {
    // keep prompt small for speed
    const joinedComments = comments
      .slice(0, 20)
      .map((c) => c.slice(0, 200))
      .join("\n- ");

    const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  temperature: 0.3,
  messages: [
    {
      role: "system",
      content:
        "You are an expert startup analyst. Always return VALID JSON only.",
    },
    {
      role: "user",
      content: `
A founder is building this product:
"${productIdea}"

Here are real user discussions:
- ${joinedComments}

Return STRICT JSON in this format:

{
  "sentiment": {
    "positive": number,
    "neutral": number,
    "negative": number
  },
  "top_features": [
    { "feature": "string", "mentions": number }
  ],
  "insights": "short clear paragraph of key learnings"
}

Rules:
- Numbers must be realistic counts
- Max 5 features
- No extra text outside JSON
`,
    },
  ],
});


    const text = completion.choices[0].message.content.trim();

// remove possible ```json ``` wrappers
const clean = text.replace(/```json|```/g, "");

return JSON.parse(clean);

  } catch (error) {
    console.error("Groq analysis error:", error);
    throw error;
  }
}

module.exports = analyzeFeedback;
