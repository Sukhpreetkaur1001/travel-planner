const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: String,
    required: [true, 'Please provide a destination']
  },
  originCity: {
    type: String,
    required: [true, 'Please provide your starting city']
  },
  originCountry: {
    type: String,
    required: [true, 'Please provide your starting country']
  },
  country: {
    type: String,
    required: [true, 'Please provide a country']
  },
  weather: [{
    date: String,
    temp: Number,
    feels_like: Number,
    description: String,
    icon: String,
    humidity: Number,
    wind: Number
  }],
  coordinates: {
    lat: Number,
    lon: Number
  },
  originCoordinates: {
    lat: Number,
    lon: Number
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date']
  },
  budget: {
    type: Number,
    required: [true, 'Please provide a budget']
  },
  travelers: {
    type: Number,
    default: 1
  },
  itinerary: [
    {
      day: Number,
      date: Date,
      activities: [String],
      hotel: {
        name: String,
        address: String,
        rating: Number,
        price: Number,
        image: String
      }
    }
  ],
  transportOptions: [
    {
      type: {
        type: String,
        enum: ['train', 'flight']
      },
      provider: String,
      route: String,
      estimatedPrice: Number,
      duration: String,
      bookingUrl: String,
      note: String
    }
  ],
  hotelOptions: [
    {
      name: String,
      address: String,
      rating: Number,
      price: Number,
      image: String,
      bookingUrl: String
    }
  ],

 guides: [
  {
    name: String,
    address: String,
    gender: String,
    rating: Number,
    phone: String,
    experience: String,
    languages: [String],
    price: Number,
    image: String
  }
],
  travelerType: {
    type: String,
    enum: ['girls', 'boys', 'mixed', 'family'],
    default: 'mixed'
  },
  notes: {
    type: String,
    default: ''
  },
  activityCategories: [String],
  selectedHotel: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['planning', 'booked', 'completed', 'cancelled'],
    default: 'planning'
  },
  selectedHotels: [
    {
      name: String,
      booked: {
        type: Boolean,
        default: false
      }
    }
  ],
  selectedActivities: {
    type: Object,
    default: {}
  },

  totalCost: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Trip', tripSchema);
