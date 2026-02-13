const Groq = require("groq-sdk");
const safeParseJSON = require("./safeParseJSON");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function clusterFeatures(comments) {
  const joined = comments
    .slice(0, 120)
    .map((c, i) => `${i + 1}. ${c.slice(0, 200)}`)
    .join("\n");

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `
You are a startup product analyst.

Your job:
- Read user comments
- Detect repeated feature requests
- Group similar needs
- Count approximate mentions
- Identify sentiment of each feature

Return STRICT JSON only.
        `,
      },
      {
        role: "user",
        content: `
User comments:
${joined}

Return JSON in this format:

{
  "features": [
    {
      "name": "short feature title",
      "description": "what users want",
      "mentions": number,
      "sentiment": "positive | negative | mixed | confusion"
    }
  ],
  "top_priority": "single most important feature to build next"
}

Rules:
- Max 6 features
- Combine similar ideas
- Be concise
- No text outside JSON
        `,
      },
    ],
  });

  const text = completion.choices[0].message.content.trim();

  return safeParseJSON(text);
}

module.exports = clusterFeatures;
