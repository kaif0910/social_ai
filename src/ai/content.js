const axios = require("axios");

async function generatePost(campaign) {
  const prompt = `
You are a social media manager AI.

Brand voice: ${campaign.brand_voice}
Tone: ${campaign.tone}
Niche: ${campaign.niche}

Generate:
1 catchy post caption
5 relevant hashtags
Keep it short.
`;

  const res = await axios.post("http://localhost:11434/api/generate", {
    model: "phi3:mini",
    prompt,
    stream: false,
  });

  return res.data.response.trim();
}

module.exports = generatePost;
