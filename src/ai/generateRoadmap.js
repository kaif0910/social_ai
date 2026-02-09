const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateRoadmap(clusteredData) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
You are a senior startup product strategist.

Given structured feature insights from users:
- Decide priority order
- Explain why each step matters
- Keep roadmap realistic for an early-stage startup

Return STRICT JSON only.
        `,
      },
      {
        role: "user",
        content: `
Clustered feature insights:

${JSON.stringify(clusteredData, null, 2)}

Return JSON in this format:

{
  "roadmap": [
    {
      "step": 1,
      "feature": "feature name",
      "reason": "why this should be built now",
      "expected_impact": "user or business impact"
    }
  ],
  "summary": "short strategic explanation"
}

Rules:
- Exactly 3 roadmap steps
- Focus on highest user value first
- Be concise
- No text outside JSON
        `,
      },
    ],
  });

  const text = completion.choices[0].message.content.trim();
  const clean = text.replace(/```json|```/g, "");

  return JSON.parse(clean);
}

module.exports = generateRoadmap;
