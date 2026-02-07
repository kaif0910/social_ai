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
            "You are an expert startup advisor who extracts clear product insights from user discussions.",
        },
        {
          role: "user",
          content: `
A founder is building this product:
"${productIdea}"

Here are real user discussions from Reddit:
- ${joinedComments}

Analyze and return:

1. Top user pain points
2. Most requested features
3. Common objections or doubts
4. Opportunities for differentiation
5. Suggested next feature to build first

Keep the answer clear, structured, and concise.
`,
        },
      ],
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Groq analysis error:", error);
    throw error;
  }
}

module.exports = analyzeFeedback;
