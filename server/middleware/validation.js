const validateCommand = (req, res, next) => {
  const { prompt } = req.body;
  
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({
      error: 'Prompt is required and must be a non-empty string'
    });
  }
  
  next();
};

const validateFilename = (req, res, next) => {
  const { filename } = req.params;
  
  if (!filename || typeof filename !== 'string' || filename.trim().length === 0) {
    return res.status(400).json({
      error: 'Filename is required and must be a non-empty string'
    });
  }
  
  // Basic security check - prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({
      error: 'Invalid filename'
    });
  }
  
  next();
};

module.exports = {
  validateCommand,
  validateFilename
}; 