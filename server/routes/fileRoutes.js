const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const upload = require('../config/multer');
const { validateCommand, validateFilename } = require('../middleware/validation');

// Upload files
router.post('/upload', upload.array('files'), fileController.uploadFiles);

// Get all files
router.get('/files', fileController.getAllFiles);

// Get file content
router.get('/files/:filename', validateFilename, fileController.getFileContent);

// Process natural language command
router.post('/command', validateCommand, fileController.processCommand);

module.exports = router; 