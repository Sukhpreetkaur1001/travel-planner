const dotenv = require('dotenv');
dotenv.config();

const { geocodeDestination, getRealHotels } = require('./services/geoapifyService');

async function test() {
  console.log("API Key loaded:", process.env.GEOAPIFY_API_KEY ? "Yes (length " + process.env.GEOAPIFY_API_KEY.length + ")" : "No");
  const geo = await geocodeDestination("paris");
  console.log("Geocoding result for 'paris':", geo);
  if (geo) {
    const hotels = await getRealHotels(geo.lat, geo.lon, 3);
    console.log("Hotels result:", hotels);
  }
}

test();
