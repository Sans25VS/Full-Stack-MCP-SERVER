require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config/database');
const fileRoutes = require('./routes/fileRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
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