/**
 * Geocodes a destination name to coordinates (latitude, longitude)
 * @param {string} destination 
 * @returns {Promise<{lat: number, lon: number, country: string}|null>}
 */
async function geocodeDestination(destination) {
  const apiKey = process.env.OPENCAGE_API_KEY;
  
  if (apiKey) {
    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(destination)}&key=${apiKey}&limit=5&no_annotations=1`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`OpenCage failed: ${response.status}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        // Prefer results where components.city or _type is city
        const preferred = data.results.find(r => r.components._type === 'city' || r.components._type === 'town') || data.results[0];
        const lat = preferred.geometry.lat;
        const lon = preferred.geometry.lng;
        const country = preferred.components.country || '';
        console.log(`[OpenCage] "${destination}" -> lat=${lat}, lon=${lon} (${preferred.formatted})`);
        return { lat, lon, country };
      }
    } catch (err) {
      console.error('[OpenCage] Error:', err.message);
    }
  }

  // Fallback to Nominatim
  try {
    const parts = destination.split(',').map(s => s.trim());
    let url;
    if (parts.length >= 2) {
      url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(parts[0])}&country=${encodeURIComponent(parts.slice(1).join(','))}&format=json&limit=5&addressdetails=1`;
    } else {
      url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=5&addressdetails=1`;
    }

    const response = await fetch(url, { headers: { 'User-Agent': 'WanderlustTravelApp/1.0' } });
    if (!response.ok) throw new Error(`Nominatim failed: ${response.status}`);
    const data = await response.json();
    if (!data || data.length === 0) return null;

    const priority = ['city', 'town', 'village', 'administrative'];
    const best = data.sort((a, b) => {
      const ai = priority.indexOf(a.type); 
      const bi = priority.indexOf(b.type);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })[0];

    const lat = parseFloat(best.lat);
    const lon = parseFloat(best.lon);
    const country = best.address?.country || '';
    console.log(`[Nominatim] "${destination}" -> lat=${lat}, lon=${lon}`);
    return { lat, lon, country };
  } catch (error) {
    console.error(`Geocoding error for ${destination}:`, error.message);
    return null;
  }
}


/**
 * Fetches real hotels near the given coordinates
 * @param {number} lat 
 * @param {number} lon 
 * @param {number} limit 
 * @returns {Promise<Array<object>>}
 */
async function getRealHotels(lat, lon, limit = 5) {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  console.log(`[Geoapify] getRealHotels called. apiKey=${apiKey ? 'Loaded' : 'MISSING'}, lat=${lat}, lon=${lon}`);
  if (!apiKey) {
    console.warn('[Geoapify] API key missing - returning empty hotels');
    return [];
  }

  try {
    const radius = 25000; // 25 km search radius
    const url = `https://api.geoapify.com/v2/places?categories=accommodation.hotel&filter=circle:${lon},${lat},${radius}&limit=${limit}&apiKey=${apiKey}`;
    const response = await fetch(url);

console.log("HOTEL API URL:", url);
console.log("HOTEL STATUS:", response.status);

if (!response.ok) {
  throw new Error(`Places API request failed with status ${response.status}`);
}

const data = await response.json();

console.log("HOTEL RESPONSE:", JSON.stringify(data, null, 2));
    if (data && data.features) {
      const hotels = data.features
        .map(f => f.properties)
        .filter(prop => prop.name);
      console.log(`[Geoapify] Found ${hotels.length} real hotels near (${lat},${lon})`);
      return hotels;
    }

    return [];
  } catch (error) {
    console.error("Error fetching real hotels from Geoapify:", error.message);
    return [];
  }
}

/**
 * Fetches real tourist attractions near the given coordinates
 * @param {number} lat 
 * @param {number} lon 
 * @param {number} limit 
 * @returns {Promise<Array<string>>}
 */
async function getRealAttractions(lat, lon, limit = 20) {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    console.warn('[Geoapify] API key missing - returning empty attractions');
    return [];
  }

  try {
    const radius = 20000; // 20 km search radius
    const url = `https://api.geoapify.com/v2/places?categories=tourism.sights,tourism.attraction,leisure.park,catering.restaurant&filter=circle:${lon},${lat},${radius}&limit=${limit}&apiKey=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Places API request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (data && data.features) {
      const attractions = data.features
        .map(f => f.properties.name)
        .filter(Boolean);

      const unique = [...new Set(attractions)];
      console.log(`[Geoapify] Found ${unique.length} real attractions near (${lat},${lon})`);
      return unique;
    }

    return [];
  } catch (error) {
    console.error("Error fetching attractions from Geoapify:", error.message);
    return [];
  }
}

/**
 * Fetches a real hotel photo from Pexels API
 * @param {string} hotelName
 * @param {string} destination
 * @returns {Promise<string|null>}
 */
async function getPexelsHotelPhoto(hotelName, destination) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  try {
    const query = encodeURIComponent(`${hotelName} ${destination} hotel`);
    const res = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=1`, {
      headers: { Authorization: apiKey }
    });
    const data = await res.json();
    return data?.photos?.[0]?.src?.large || null;
  } catch (err) {
    console.error('[Pexels] Photo fetch failed:', err.message);
    return null;
  }
}

module.exports = {
  geocodeDestination,
  getRealHotels,
  getRealAttractions,
  getPexelsHotelPhoto
};
