const Groq = require("groq-sdk");
const safeParseJSON = require("../ai/safeParseJSON");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateReplies({ featureContext, comments }) {
  const joinedComments = comments
    .slice(0, 10)
    .map((c, i) => `${i + 1}. ${c.slice(0, 200)}`)
    .join("\n");

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.6,
    messages: [
      {
        role: "system",
        content: `
You are an indie hacker founder replying to users building in public.
Tone:
- human
- grateful
- curious
- honest
Never sound like corporate AI.
Return STRICT JSON only.
        `,
      },
      {
        role: "user",
        content: `
Feature being discussed:
"${featureContext}"

Here are real user comments:
${joinedComments}

Return JSON:

{
  "replies": [
    {
      "comment_summary": "short summary of the user's point",
      "reply": "natural human-like reply"
    }
  ]
}

Rules:
- Max 5 replies
- Replies should feel conversational
- Encourage further feedback
- No text outside JSON
        `,
      },
    ],
  });

  const text = completion.choices[0].message.content.trim();

  return safeParseJSON(text);
}

module.exports = generateReplies;
