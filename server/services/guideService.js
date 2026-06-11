const axios = require("axios");

const getTravelGuides = async (destination, travelerType) => {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/textsearch/json",
      {
        params: {
          query: `tour guide in ${destination}`,
          key: process.env.GOOGLE_PLACES_API_KEY,
        },
      }
    );

    let guides = response.data.results || [];

    return guides.slice(0, 5).map((guide) => ({
      name: guide.name,
      address: guide.formatted_address,
      rating: guide.rating || 4.0,
      gender:
        travelerType === "girls"
          ? "Female"
          : travelerType === "boys"
          ? "Male"
          : "Any",
    }));
  } catch (error) {
    console.error("Guide API Error:", error.message);
    return [];
  }
};

module.exports = { getTravelGuides };