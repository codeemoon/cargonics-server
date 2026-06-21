const express = require('express');
const cors = require('cors');
const trackingRoutes = require('./routes/tracking');

const app = express();

// Apply Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount Routes
app.use('/api/tracking', trackingRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Cargonics Express Logistics API is online and healthy.',
    timestamp: new Date()
  });
});

module.exports = app;
