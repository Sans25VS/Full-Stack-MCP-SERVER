const path = require('path');

const config = {
  uploadsDir: path.join(__dirname, '..', 'uploads'),
  port: process.env.PORT || 3001,
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo'
  }
};

module.exports = config; 