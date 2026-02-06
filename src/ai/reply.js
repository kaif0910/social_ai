const axios = require("axios");

async function generateReply(comment, campaign) {
  const prompt = `
You are a social media manager AI.

Brand voice: ${campaign.brand_voice}
Tone: ${campaign.tone}
Niche: ${campaign.niche}

Reply to this user comment in one short sentence:

"${comment}"
`;

  const res = await axios.post("http://localhost:11434/api/generate", {
    model: "phi3:mini",
    prompt,
    stream: false,
  });

  return res.data.response.trim();
}

module.exports = generateReply;
