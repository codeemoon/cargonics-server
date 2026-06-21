const express = require('express');
const cors = require('cors');
const trackingRoutes = require('./routes/tracking');

const app = express();

// ── CORS Configuration ───────────────────────────────────────────────────
// Build allowed origins list from env vars (comma-separated) + local dev
const getEnvOrigins = () => {
  const origins = [];
  if (process.env.ALLOWED_ORIGINS) {
    origins.push(...process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()));
  }
  if (process.env.FRONTEND_URL) {
    origins.push(...process.env.FRONTEND_URL.split(',').map(o => o.trim()));
  }
  return origins;
};

const ALLOWED_ORIGINS = [
  'http://localhost:5173',   // Vite local dev
  'http://localhost:4173',   // Vite preview
  'http://localhost:3000',   // Fallback local port
  ...getEnvOrigins(),        // Production domains from env vars
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`CORS blocked origin: ${origin}`);
    // Return false instead of an Error object so CORS fails gracefully
    // in the browser without crashing the server with a 500 error
    callback(null, false);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Apply Middleware
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
