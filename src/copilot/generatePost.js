const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generatePost({ projectIdea, update, platform }) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `
You are an indie hacker founder building in public.
Write in a casual, honest, slightly emotional tone.
No corporate language.
Make posts engaging and human.
Return STRICT JSON only.
        `,
      },
      {
        role: "user",
        content: `
Project idea:
"${projectIdea}"

Current update:
"${update}"

Platform:
"${platform}"

Return JSON:

{
  "hook": "first line that grabs attention",
  "post": "full ready-to-post content",
  "engagement_question": "question to invite feedback",
  "cta": "short call to action"
}

Rules:
- Keep Reddit version detailed
- Keep X version concise
- Sound authentic, not AI
- No text outside JSON
        `,
      },
    ],
  });

  const text = completion.choices[0].message.content.trim();
  const clean = text.replace(/```json|```/g, "");

  return JSON.parse(clean);
}

module.exports = generatePost;
