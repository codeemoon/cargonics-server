const express = require('express');
const cors = require('cors');
const trackingRoutes = require('./routes/tracking');

const app = express();

// ── CORS Configuration ───────────────────────────────────────────────────
// Allowed origins: local Vite dev server + any deployed frontend
const ALLOWED_ORIGINS = [
  'http://localhost:5173',   // Vite local dev
  'http://localhost:4173',   // Vite preview
  process.env.FRONTEND_URL,  // Set this in Render dashboard to your Vercel URL
].filter(Boolean); // Remove undefined entries if FRONTEND_URL is not set

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
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
