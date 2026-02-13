const Groq = require("groq-sdk");
const safeParseJSON = require("./safeParseJSON");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function analyzePostFeedback(featureContext, comments) {
  const joinedComments = comments
    .slice(0, 20)
    .map((c) => c.slice(0, 200))
    .join("\n- ");

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are a product feedback analyst. Always return STRICT JSON only.",
      },
      {
        role: "user",
        content: `
A founder proposed this feature:
"${featureContext}"

Here are user comments on the post:
- ${joinedComments}

Return JSON in this format:

{
  "sentiment": {
    "agreement": number,
    "neutral": number,
    "disagreement": number
  },
  "top_requested_change": "string",
  "confusions": ["string"],
  "recommended_next_feature": "string"
}

Rules:
- Numbers must reflect comment distribution
- Max 3 confusions
- No text outside JSON
`,
      },
    ],
  });

  const text = completion.choices[0].message.content.trim();

  return safeParseJSON(text);
}

module.exports = analyzePostFeedback;
