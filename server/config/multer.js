const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('./database');

// Use memory storage for Vercel deployment
// Vercel's filesystem is read-only, so we need to handle files in memory
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 100 // Maximum 100 files
  }
});

module.exports = upload; 