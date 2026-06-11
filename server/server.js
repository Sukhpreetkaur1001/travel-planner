const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const transportRoutes = require("./routes/transportRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '6mb' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes.js'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/payments', require('./routes/paymentsRoutes'));
app.use("/api/transport", transportRoutes);

// Weather route
const { protect } = require('./middleware/authMiddleware');
const { getWeather } = require('./services/weatherService');
app.get('/api/weather/:destination', protect, async (req, res) => {
  const data = await getWeather(req.params.destination);
  if (!data) return res.status(404).json({ message: 'Weather not available' });
  res.json(data);
});

const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
