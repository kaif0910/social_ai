const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generatePost(campaign) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "You are a social media content creator. Return STRICT JSON only.",
        },
        {
          role: "user",
          content: `
Brand voice: ${campaign.brand_voice || "friendly"}
Tone: ${campaign.tone || "casual"}
Niche: ${campaign.niche || "tech"}

Generate a social media post. Return JSON:

{
  "content": "full post text",
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Rules:
- Keep it engaging and authentic
- Max 5 hashtags
- No text outside JSON
          `,
        },
      ],
    });

    const text = completion.choices[0].message.content.trim();
    const clean = text.replace(/```json|```/g, "");
    const parsed = JSON.parse(clean);

    // Return the content string for backward compatibility
    return parsed.content + "\n\n" + (parsed.hashtags || []).map(h => `#${h.replace(/^#/, "")}`).join(" ");
  } catch (err) {
    console.error("Content generation error:", err);
    throw err;
  }
}

module.exports = generatePost;
