const Trip = require('../models/Trip');
const sendMail = require('../services/mailService')
const User = require('../models/User')
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const { geocodeDestination, getRealHotels, getRealAttractions, getGooglePlacePhoto } = require('../services/geoapifyService');
const { getPlacePhoto } = require('../services/pexelsService');
const { getWeather } = require('../services/weatherService');
const { getTravelGuides } = require('../services/guideService');
// Mock hotel data
const mockHotels = [
  {
    name: 'Grand Palace Hotel',
    address: '123 Main Street, City Center',
    rating: 4.8,
    price: 150,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
  },
  {
    name: 'Seaside Resort',
    address: '45 Beach Road',
    rating: 4.5,
    price: 200,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400'
  },
  {
    name: 'Mountain View Lodge',
    address: '789 Hilltop Avenue',
    rating: 4.7,
    price: 180,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400'
  },
  {
    name: 'City Central Hotel',
    address: '100 Business District',
    rating: 4.3,
    price: 120,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400'
  },
  {
    name: 'Luxury Spa Resort',
    address: '200 Wellness Way',
    rating: 4.9,
    price: 350,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'
  }
];

const buildBookingUrl = (destination, startDate, endDate, travelers) => {
  const params = new URLSearchParams({
    ss: destination,
    checkin: startDate,
    checkout: endDate,
    group_adults: String(travelers || 1),
    no_rooms: '1',
    group_children: '0'
  });

  return `https://www.booking.com/searchresults.html?${params.toString()}`;
};

const buildFlightUrl = (originCity, destination, startDate) => {
  const query = encodeURIComponent(`${originCity} to ${destination} flights ${startDate}`);
  return `https://www.google.com/travel/flights?q=${query}`;
};

const buildTrainUrl = (originCity, destination, startDate) => {
  const query = encodeURIComponent(`MakeMyTrip trains ${originCity} to ${destination} ${startDate}`);
  return `https://www.google.com/search?q=${query}`;
};

const generateTransportOptions = ({ originCity, originCountry, destination, country, startDate, budget, travelers }) => {
  const domestic = originCountry.trim().toLowerCase() === country.trim().toLowerCase();
  const perTravelerBudget = Math.max(Math.round((budget * 0.28) / Math.max(travelers || 1, 1)), 40);
  const route = `${originCity} to ${destination}`;

  if (domestic) {
    return [
      {
        type: 'train',
        provider: 'MakeMyTrip Train Search',
        route,
        estimatedPrice: Math.max(Math.round(perTravelerBudget * 0.45), 20),
        duration: 'Budget-friendly',
        bookingUrl: buildTrainUrl(originCity, destination, startDate),
        note: 'Estimated rail fare. Check live availability before booking.'
      },
      {
        type: 'flight',
        provider: 'Google Flights',
        route,
        estimatedPrice: Math.max(Math.round(perTravelerBudget * 0.9), 60),
        duration: 'Fastest option',
        bookingUrl: buildFlightUrl(originCity, destination, startDate),
        note: 'Estimated domestic airfare. Live airline prices may change.'
      }
    ];
  }

  return [
    {
      type: 'flight',
      provider: 'Google Flights',
      route,
      estimatedPrice: Math.max(Math.round(perTravelerBudget * 1.35), 160),
      duration: 'International flight',
      bookingUrl: buildFlightUrl(originCity, destination, startDate),
      note: 'Estimated international airfare. Check visa, baggage and live fare.'
    }
  ];
};

const getUnsplashHotelImage = (index) => {
  const hotelImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400',
    'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=400'
  ];
  return hotelImages[index % hotelImages.length];
};
const generateHotelOptions = async ({ destination, startDate, endDate, budget, travelers, lat, lon }) => {

  console.log("LAT:", lat);
  console.log("LON:", lon);

  const start = new Date(startDate);
  const end = new Date(endDate);

  const days = Math.max(
    Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1,
    1
  );

  const nights = Math.max(days - 1, 1);

  const nightlyTarget = Math.max(
    Math.round((budget * 0.42) / nights),
    45
  );

  let hotels = [];

  if (lat && lon) {

    const realHotels = await getRealHotels(lat, lon, 8);

    console.log("REAL HOTELS:", realHotels);
    console.log("REAL HOTELS COUNT:", realHotels.length);

    hotels = await Promise.all(realHotels.map(async (h, index) => {
      const photo = await getPlacePhoto(`${h.name} ${destination}`);
      return {
        name: h.name,
        address: h.formatted || h.address_line2 || `${destination}, Center`,
        rating: parseFloat((4.0 + (index % 10) * 0.1).toFixed(1)),
        price: Math.max(Math.round(nightlyTarget * (0.75 + index * 0.08)), 35),
        image: photo || getUnsplashHotelImage(index),
        bookingUrl: buildBookingUrl(destination, startDate, endDate, travelers)
      };
    }));
  }

  if (hotels.length === 0) {
    hotels = mockHotels.map((hotel, index) => ({
      ...hotel,
      name: `${destination} ${hotel.name}`,
      price: Math.max(Math.round(nightlyTarget * (0.75 + index * 0.12)), 35),
      bookingUrl: buildBookingUrl(destination, startDate, endDate, travelers)
    }));
  }

  return hotels.sort((a, b) => a.price - b.price).slice(0, 3);
};

const fallbackActivityThemes = [
  (destination) => [
    `Explore the historic heart of ${destination}`,
    `Visit a famous landmark in ${destination}`,
    `Try a well-rated local breakfast cafe`,
    `Walk through an old neighborhood with traditional streets`,
    `Stop by a local craft or food market`,
    `Take photos from a popular city viewpoint`,
    `Enjoy a regional lunch at a neighborhood restaurant`,
    `Visit a museum focused on local history`,
    `Relax in a public garden or waterfront area`,
    `Have dinner in a lively dining district`
  ],
  (destination) => [
    `Tour a major art gallery or design museum in ${destination}`,
    `Visit an architecturally important building`,
    `Browse independent shops and small boutiques`,
    `Try a local dessert or tea specialty`,
    `Walk through a creative arts district`,
    `Visit a cultural performance venue or theater area`,
    `Have lunch near a popular shopping street`,
    `Explore a library, bookstore or cultural center`,
    `Watch sunset from a scenic public spot`,
    `Try a recommended street-food lane in the evening`
  ],
  (destination) => [
    `Take a morning trip to a temple, shrine or heritage site near ${destination}`,
    `Join a guided cultural walking route`,
    `Visit a traditional market before it gets crowded`,
    `Try a local cooking class or food tasting`,
    `Explore a quiet residential neighborhood`,
    `Visit a small specialty museum`,
    `Spend time at a riverside, lakefront or city park`,
    `Look for handmade souvenirs from local sellers`,
    `Have dinner at a family-style restaurant`,
    `End with a relaxed walk through illuminated streets`
  ],
  (destination) => [
    `Start with a scenic nature walk near ${destination}`,
    `Visit a botanical garden or landscaped park`,
    `Stop at a cafe known for local flavors`,
    `Explore a nearby hill, viewpoint or observation deck`,
    `Visit a wildlife, aquarium or nature education center`,
    `Have lunch in a quieter local district`,
    `Take a short ferry, tram or scenic transit ride if available`,
    `Photograph city views during golden hour`,
    `Try a seasonal dish popular in ${destination}`,
    `Spend the evening in a calm promenade area`
  ],
  (destination) => [
    `Visit a modern landmark or observation tower in ${destination}`,
    `Explore a technology, science or innovation museum`,
    `Try brunch in a trendy cafe district`,
    `Walk through a modern shopping boulevard`,
    `Visit a public plaza known for events or performances`,
    `Explore a contemporary art space`,
    `Have lunch at a popular local chain or food hall`,
    `Check out a rooftop or skyline-view spot`,
    `Find a night market or evening shopping street`,
    `Enjoy dinner in a modern entertainment district`
  ],
  (destination) => [
    `Take a half-day excursion to a nearby scenic area from ${destination}`,
    `Visit a regional heritage village or old town`,
    `Try a local breakfast before leaving the city center`,
    `Explore a castle, fort, palace or historic complex if nearby`,
    `Stop at a viewpoint outside the busiest tourist zone`,
    `Have lunch featuring regional specialties`,
    `Visit a local workshop, studio or artisan area`,
    `Return for a relaxed cafe break in ${destination}`,
    `Walk through a different neighborhood after sunset`,
    `Book dinner near your hotel for an easy finish`
  ],
  (destination) => [
    `Explore a food-focused neighborhood in ${destination}`,
    `Try a guided tasting tour or self-guided snack crawl`,
    `Visit a spice, seafood, produce or specialty market`,
    `Learn about local cuisine at a cooking studio or demo`,
    `Stop for coffee, tea or a local drink experience`,
    `Have lunch at a restaurant known for regional classics`,
    `Browse shops selling kitchenware or edible souvenirs`,
    `Visit a small cultural site between food stops`,
    `Try an evening street-food route`,
    `End with dessert at a popular local spot`
  ],
  (destination) => [
    `Keep the morning slow with a relaxed cafe stop in ${destination}`,
    `Visit a peaceful garden, temple or quiet public space`,
    `Browse a calm shopping arcade or local lane`,
    `Spend time at a spa, bathhouse or wellness center if available`,
    `Have lunch in a scenic or low-crowd area`,
    `Visit a small museum or gallery at an easy pace`,
    `Take a short scenic walk near your stay`,
    `Stop for a sunset drink or viewpoint`,
    `Choose a comfortable dinner spot with local dishes`,
    `Prepare for departure with light souvenir shopping`
  ]
];

const getFallbackActivitiesForDay = (destination, dayNumber) => {
  const theme = fallbackActivityThemes[(dayNumber - 1) % fallbackActivityThemes.length];

  return theme(destination);
};

const buildFallbackItinerary = (destination, days) => ({
  days: Array.from({ length: days }, (_, index) => ({
    activities: getFallbackActivitiesForDay(destination, index + 1).slice(0, 10)
  }))
});

const normalizeItineraryActivities = (aiData, destination, days) => {
  const usedActivities = new Set();

  return {
    days: Array.from({ length: days }, (_, index) => {
      const dayNumber = index + 1;
      const sourceActivities = Array.isArray(aiData?.days?.[index]?.activities)
        ? aiData.days[index].activities
        : [];
      const fallbackActivities = getFallbackActivitiesForDay(destination, dayNumber);
      const activities = [];

      [...sourceActivities, ...fallbackActivities].forEach((activity) => {
        if (typeof activity !== 'string') return;

        const cleanActivity = activity.trim();
        const key = cleanActivity.toLowerCase();

        if (!cleanActivity || usedActivities.has(key) || activities.length >= 10) {
          return;
        }

        usedActivities.add(key);
        activities.push(cleanActivity);
      });

      return {
        activities: activities.slice(0, 10)
      };
    })
  };
};

const parseGeminiJson = (text) => {
  const cleanedText = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  const jsonStart = cleanedText.indexOf('{');
  const jsonEnd = cleanedText.lastIndexOf('}');

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('Gemini response did not contain a JSON object');
  }

  return JSON.parse(cleanedText.slice(jsonStart, jsonEnd + 1));
};

const getTripDurationDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1, 1);
};

const buildItinerary = ({ startDate, days, hotelOptions, aiData, destination }) => {
  const start = new Date(startDate);
  const normalizedAiData = normalizeItineraryActivities(aiData, destination, days);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      day: index + 1,
      date,
      activities: normalizedAiData.days[index].activities,
      hotel: hotelOptions[index % hotelOptions.length]
    };
  });
};

const hasRepeatedOrShortActivities = (itinerary = []) => {
  const daySignatures = new Set();
  const activityCounts = new Map();
  const fallbackTemplatePattern = /\bday\s+\d+\b/i;

  for (const day of itinerary) {
    const activities = Array.isArray(day.activities) ? day.activities : [];

    if (activities.length < 10) {
      return true;
    }

    if (activities.some((activity) => fallbackTemplatePattern.test(String(activity)))) {
      return true;
    }

    const signature = activities
      .map((activity) => String(activity).trim().toLowerCase())
      .sort()
      .join('|');

    if (daySignatures.has(signature)) {
      return true;
    }

    daySignatures.add(signature);

    activities.forEach((activity) => {
      const key = String(activity).trim().toLowerCase();
      activityCounts.set(key, (activityCounts.get(key) || 0) + 1);
    });
  }

  return [...activityCounts.values()].some((count) => count > 1);
};

const regenerateTripItinerary = async (trip) => {
  const days = getTripDurationDays(trip.startDate, trip.endDate);

  const geo = await geocodeDestination(trip.destination);
  const lat = geo?.lat;
  const lon = geo?.lon;

  const originGeo = await geocodeDestination(`${trip.originCity}, ${trip.originCountry}`);
  const originLat = originGeo?.lat;
  const originLon = originGeo?.lon;

  if (lat && lon) {
    trip.coordinates = { lat, lon };
  }
  if (originLat && originLon) {
    trip.originCoordinates = { lat: originLat, lon: originLon };
  }

  const hotelOptions = await generateHotelOptions({
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.endDate,
    budget: trip.budget,
    travelers: trip.travelers,
    lat,
    lon
  });

  let realPlaces = [];
  if (lat && lon) {
    realPlaces = await getRealAttractions(lat, lon, 25);
  }

  const aiData = await generateAIItinerary(
    trip.destination,
    days,
    trip.notes,
    trip.activityCategories || [],
    realPlaces
  );
  const itinerary = buildItinerary({
    startDate: trip.startDate,
    days,
    hotelOptions,
    aiData,
    destination: trip.destination
  });

  trip.itinerary = itinerary;
  trip.hotelOptions = hotelOptions;
  trip.selectedActivities = {};
  trip.totalCost = itinerary.reduce((total, day) => total + (day.hotel?.price || 0), 0)
    + ((trip.transportOptions?.[0]?.estimatedPrice || 0) * (trip.travelers || 1));

  await trip.save();
  return trip;
};

async function generateAIItinerary(destination, days, notes = '', activityCategories = [], realPlaces = []) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const placesPrompt = realPlaces.length > 0
    ? `Here are some real places, landmarks and points of interest in ${destination}: ${realPlaces.join(', ')}. Incorporate these real places/attractions in the activities for the daily itineraries.`
    : `Activities must be realistic for ${destination}.`;

  const prompt = `
Create a ${days}-day travel itinerary for ${destination}.

Preferences: ${notes}
Activity categories: ${activityCategories.length ? activityCategories.join(', ') : 'balanced mix of culture, food, nature, history and relaxation'}

Rules:
- Give exactly ${days} days.
- Each day should contain exactly 10 unique activities.
- Do not repeat an activity on another day.
- ${placesPrompt}
- Return ONLY valid JSON.

Format:
{
  "days":[
    {
      "activities":[
        "Activity 1",
        "Activity 2",
        "Activity 3",
        "Activity 4",
        "Activity 5",
        "Activity 6",
        "Activity 7",
        "Activity 8",
        "Activity 9",
        "Activity 10"
      ]
    }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return parseGeminiJson(response);
  } catch (error) {
    console.error('AI itinerary generation failed:', error.message);
    return buildFallbackItinerary(destination, days);
  }
}


// @route   GET /api/trips
// @access  Private
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (hasRepeatedOrShortActivities(trip.itinerary)) {
      await regenerateTripItinerary(trip);
    }

    res.json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    console.log("CREATE TRIP API HIT");
    const { originCity, originCountry, destination, country, startDate, endDate, budget, travelers, notes, activityCategories, travelerType } = req.body;
    const cleanActivityCategories = Array.isArray(activityCategories)
      ? activityCategories.map((category) => String(category).trim()).filter(Boolean)
      : [];

    const geo = await geocodeDestination(destination);
    const lat = geo?.lat;
    const lon = geo?.lon;

    const originGeo = await geocodeDestination(`${originCity}, ${originCountry}`);
    const originLat = originGeo?.lat;
    const originLon = originGeo?.lon;
    console.log(`[Origin Geo] ${originCity}, ${originCountry} -> lat=${originLat}, lon=${originLon}`);
    console.log(`[Dest Geo] ${destination} -> lat=${lat}, lon=${lon}`);

    const weather = await getWeather(destination);
    console.log('[Weather] fetched:', weather ? weather.length + ' entries' : 'null');


    require('fs').appendFileSync('d:/Project/server/api_debug.log', `[DEBUG] ${new Date().toISOString()} - destination=${destination}, lat=${lat}, lon=${lon}, apiKey=${process.env.GEOAPIFY_API_KEY ? 'Loaded' : 'Missing'}\n`);

    const hotelOptions = await generateHotelOptions({
      destination,
      startDate,
      endDate,
      budget,
      travelers,
      lat,
      lon
    });
    const transportOptions = generateTransportOptions({ originCity, originCountry, destination, country, startDate, budget, travelers });
    const guides = await getTravelGuides(
  destination,
  travelerType
);
console.log("GUIDES GENERATED:", guides);
    const days = getTripDurationDays(startDate, endDate);

    let realPlaces = [];
    if (lat && lon) {
      realPlaces = await getRealAttractions(lat, lon, 25);
    }

    const aiData = await generateAIItinerary(
      destination,
      days,
      notes,
      cleanActivityCategories,
      realPlaces
    );
    const itinerary = buildItinerary({
      startDate,
      days,
      hotelOptions,
      aiData,
      destination
    });
    const stayAndActivityCost = itinerary.reduce((total, day) => total + (day.hotel?.price || 0), 0);

    const transportCost = transportOptions[0]?.estimatedPrice ? transportOptions[0].estimatedPrice * (travelers || 1) : 0;

    const trip = await Trip.create({
      user: req.user._id,
      originCity,
      originCountry,
      destination,
      country,
      weather,
      coordinates: lat && lon ? { lat, lon } : undefined,
      originCoordinates: originLat && originLon ? { lat: originLat, lon: originLon } : undefined,
      travelerType: travelerType || 'mixed',
      guides,
      startDate,
      endDate,
      budget,
      travelers: travelers || 1,
      itinerary,
      transportOptions,
      hotelOptions,
      notes: notes || '',
      activityCategories: cleanActivityCategories,
      totalCost: stayAndActivityCost + transportCost
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const planFields = [
      'originCity',
      'originCountry',
      'destination',
      'country',
      'startDate',
      'endDate',
      'budget',
      'travelers',
      'notes'
    ];
    const shouldRegeneratePlan = planFields.some((field) =>
      Object.prototype.hasOwnProperty.call(req.body, field)
    );

    let updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (shouldRegeneratePlan) {
      const transportOptions = generateTransportOptions({
        originCity: updatedTrip.originCity,
        originCountry: updatedTrip.originCountry,
        destination: updatedTrip.destination,
        country: updatedTrip.country,
        startDate: updatedTrip.startDate,
        budget: updatedTrip.budget,
        travelers: updatedTrip.travelers
      });

      updatedTrip.transportOptions = transportOptions;
      updatedTrip = await regenerateTripItinerary(updatedTrip);
    }

    res.json(updatedTrip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await trip.deleteOne();

    res.json({
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};


// SEND ACTIVITY MAIL
const sendActivityMail = async (req, res) => {

  try {

    const trip = await Trip.findById(req.params.id)

    if (!trip) {
      return res.status(404).json({
        message: 'Trip not found'
      })
    }

    // LOGIN USER
    const user = await User.findById(trip.user)

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const {
      activity,
      day,
      hotel
    } = req.body

    // SEND MAIL
    await sendMail({

      to: user.email,

      subject: `Welcome To Wanderlust ✈️`,

      html: `
        <div style="
          font-family: Arial;
          padding: 20px;
        ">

          <h1 style="
            color: #ff5a47;
          ">
            Welcome ${user.name} ❤️
          </h1>

          <p>
            Thank you for choosing
            <strong>Wanderlust</strong>
          </p>

          <p>
            Your activity has been selected successfully.
          </p>

          <div style="
            background:#f5f5f5;
            padding:20px;
            border-radius:10px;
            margin-top:20px;
          ">

            <h3>Trip Details</h3>

            <p>
              <strong>Destination:</strong>
              ${trip.destination}
            </p>

            <p>
              <strong>Day:</strong>
              ${day}
            </p>

            <p>
              <strong>Activity:</strong>
              ${activity}
            </p>

            <p>
              <strong>Selected Hotel:</strong>
              ${hotel || 'No hotel selected'}
            </p>

          </div>

          <p style="
            margin-top:20px;
          ">
            Have a wonderful journey 🌍✈️
          </p>

        </div>
      `
    })

    res.json({
      success: true
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: 'Mail failed'
    })
  }
}

module.exports = {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  sendActivityMail
};
