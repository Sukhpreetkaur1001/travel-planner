const dotenv = require('dotenv');
dotenv.config();

const { geocodeDestination, getRealHotels } = require('./services/geoapifyService');
const Trip = require('./models/Trip');

// mock generation functions
const mockHotels = [
  { name: 'Grand Palace Hotel' },
  { name: 'Seaside Resort' },
  { name: 'Mountain View Lodge' }
];

const getUnsplashHotelImage = (index) => {
  return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';
};

const buildBookingUrl = (destination, startDate, endDate, travelers) => {
  return 'https://www.booking.com';
};

const generateHotelOptions = async ({ destination, startDate, endDate, budget, travelers, lat, lon }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1, 1);
  const nights = Math.max(days - 1, 1);
  const nightlyTarget = Math.max(Math.round((budget * 0.42) / nights), 45);

  let hotels = [];

  if (lat && lon) {
    console.log(`Querying hotels for lat=${lat}, lon=${lon}...`);
    const realHotels = await getRealHotels(lat, lon, 8);
    console.log(`Found ${realHotels.length} hotels.`);
    hotels = realHotels.map((h, index) => ({
      name: h.name,
      address: h.formatted || h.address_line2 || `${destination}, Center`,
      rating: parseFloat((4.0 + (index % 10) * 0.1).toFixed(1)),
      price: Math.max(Math.round(nightlyTarget * (0.75 + index * 0.08)), 35),
      image: getUnsplashHotelImage(index),
      bookingUrl: buildBookingUrl(destination, startDate, endDate, travelers)
    }));
  } else {
    console.log("lat/lon not provided!");
  }

  if (hotels.length === 0) {
    console.log("No hotels fetched, falling back to mock hotels.");
    hotels = mockHotels.map((hotel, index) => ({
      ...hotel,
      name: `${destination} ${hotel.name}`,
      price: Math.max(Math.round(nightlyTarget * (0.75 + index * 0.12)), 35),
      bookingUrl: buildBookingUrl(destination, startDate, endDate, travelers)
    }));
  }

  return hotels.sort((a, b) => a.price - b.price).slice(0, 3);
};

async function run() {
  const destination = "paris";
  const geo = await geocodeDestination(destination);
  console.log("Geocoding result:", geo);
  const hotelOptions = await generateHotelOptions({
    destination,
    startDate: "2026-06-10",
    endDate: "2026-06-15",
    budget: 1000,
    travelers: 1,
    lat: geo?.lat,
    lon: geo?.lon
  });
  console.log("Final hotelOptions:", hotelOptions);
}

run();
