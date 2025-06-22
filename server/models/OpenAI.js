const { OpenAI } = require('openai');
const config = require('../config/database');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.model = config.openai.model;
  }

  async processCommand(prompt, fileStructure) {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [{
          role: 'system',
          content: `You are a helpful assistant that translates natural language prompts into file system commands.
          The user wants to perform an operation in the uploads directory.
          The current file structure is:
          ${JSON.stringify(fileStructure, null, 2)}

          Translate the following prompt into a single file system command (e.g., 'create', 'edit', 'delete').
          The output should be a JSON object with "command" and "args" properties.
          For example:
          - "create a new file called test.txt" => { "command": "create", "args": ["test.txt"] }
          - "edit the file index.html" => { "command": "edit", "args": ["index.html", "new content"] }
          - "delete the file style.css" => { "command": "delete", "args": ["style.css"] }
          - "add '<h1>Hello World</h1>' to index.html" => { "command": "edit", "args": ["index.html", "<h1>Hello World</h1>"] }`
        }, {
          role: 'user',
          content: prompt
        }],
        model: this.model,
      });

      const result = JSON.parse(completion.choices[0].message.content);
      return result;
    } catch (error) {
      if (error.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your billing details.');
      }
      if (error.code === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      }
      if (error.code === 'rate_limit_exceeded') {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
}

module.exports = new OpenAIService(); 