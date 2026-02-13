const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateReply(comment, campaign) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: "You are a social media manager. Reply naturally and concisely. Return only the reply text, no JSON.",
        },
        {
          role: "user",
          content: `
Brand voice: ${campaign.brand_voice || "friendly"}
Tone: ${campaign.tone || "casual"}
Niche: ${campaign.niche || "tech"}

Reply to this comment in one short, engaging sentence:

"${comment}"
          `,
        },
      ],
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error("Reply generation error:", err);
    throw err;
  }
}

module.exports = generateReply;
