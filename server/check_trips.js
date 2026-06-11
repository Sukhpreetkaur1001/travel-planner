const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const Trip = require('./models/Trip');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    const trips = await Trip.find({}).sort({ createdAt: -1 }).limit(5);
    console.log("Latest Trips:");
    trips.forEach(t => {
      console.log(`\nID: ${t._id}`);
      console.log(`Destination: ${t.destination}`);
      console.log(`Created At: ${t.createdAt}`);
      console.log(`Hotels:`, t.hotelOptions.map(h => h.name));
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();
