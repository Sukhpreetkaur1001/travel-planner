const express = require("express");
const router = express.Router();

router.get("/:city", async (req, res) => {
  try {
    const city = req.params.city;
    const encodedCity = encodeURIComponent(city);

    const transportData = [
      {
        name: 'Ola Cabs',
        type: 'Cab',
        description: 'Book AC & Non-AC cabs, outstation rides',
        icon: '🚕',
        price: 'Starts ₹80',
        bookingUrl: `https://www.olacabs.com/?lat=0&lng=0&locName=${encodedCity}`,
        rating: 4.5,
      },
      {
        name: 'Uber',
        type: 'Cab',
        description: 'Ride with comfort, airport & city transfers',
        icon: '🚖',
        price: 'Starts ₹90',
        rating: 4.7,
        bookingUrl: `https://m.uber.com/looking?pickup=my_location&drop[0][addressLine1]=${encodedCity}`
      },
      {
        name: 'Rapido',
        type: 'Bike & Auto',
        description: 'Affordable bike taxis and auto rickshaws',
        icon: '🏍️',
        price: 'Starts ₹25',
        rating: 4.4,
        bookingUrl: `https://rapido.bike/`
      },
      {
        name: 'Royal Brothers',
        type: 'Bike Rental',
        description: `Self-drive bikes & scooters in ${city}`,
        icon: '🛵',
        price: 'Starts ₹300/day',
        rating:4.6,
        bookingUrl: `https://www.royalbrothers.com/bikes-on-rent/${encodedCity.toLowerCase()}`
      },
      {
        name: 'Zoomcar',
        type: 'Car Rental',
        description: `Self-drive cars available in ${city}`,
        icon: '🚗',
        price: 'Starts ₹500/day',
        rating: 4.3,
        bookingUrl: `https://www.zoomcar.com/search?city=${encodedCity}`
      },
      {
        name: 'InDrive',
        type: 'Cab',
        description: 'Negotiate fare, intercity & local rides',
        icon: '🚙',
        price: 'Negotiable',
        rating: 4.5,
        bookingUrl: `https://indrive.com/en/cities/${encodedCity.toLowerCase()}/`
      }
    ];

    res.json(transportData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch transport data" });
  }
});

module.exports = router;