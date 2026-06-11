const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateActivities(destination, days) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

  const prompt = `
Generate a ${days}-day travel itinerary for ${destination}.

Return ONLY JSON format:

[
 {
   "day": 1,
   "activities": ["activity1","activity2","activity3","activity4","activity5"]
 }
]
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = generateActivities;