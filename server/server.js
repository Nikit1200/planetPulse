const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Load environment variables
dotenv.config();

const app = express();

// CORS Configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  clientUrl
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PlanetPulse API is running'
  });
});

// API Routes
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/target', require('./routes/targetRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Root Informational Helper
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PlanetPulse API Service',
    endpoints: {
      health: '/api/health',
      activities: '/api/activities',
      target: '/api/target',
      dashboard: '/api/dashboard'
    }
  });
});

// Centralized 404 handler for unknown routes
app.use(notFound);

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server if run directly
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[PlanetPulse Server] Running on http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error('[PlanetPulse Server] Failed to connect to database:', err.message);
    process.exit(1);
  });
}

module.exports = app;
