require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config/database');
const fileRoutes = require('./routes/fileRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow Vercel domains
    if (origin.includes('vercel.app') || origin.includes('netlify.app')) {
      return callback(null, true);
    }
    
    // Allow your specific frontend domain
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    origin: req.get('Origin')
  });
  next();
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'File Management API Server',
    version: '1.0.0',
    endpoints: {
      upload: 'POST /upload',
      files: 'GET /files',
      read: 'GET /files/:filename',
      delete: 'DELETE /files/:filename',
      command: 'POST /command'
    }
  });
});

// Routes
app.use('/', fileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Export for Vercel
module.exports = app; 