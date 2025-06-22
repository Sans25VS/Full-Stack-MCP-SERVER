# Server - MVC Architecture

This server has been refactored to follow the MVC (Model-View-Controller) pattern for better organization and maintainability.

## Project Structure

```
server/
├── config/           # Configuration files
│   ├── database.js   # Database and app configuration
│   └── multer.js     # File upload configuration
├── controllers/      # Business logic controllers
│   └── fileController.js
├── models/          # Data models and business logic
│   ├── File.js      # File system operations
│   └── OpenAI.js    # OpenAI API interactions
├── routes/          # Route definitions
│   └── fileRoutes.js
├── middleware/      # Custom middleware
│   ├── errorHandler.js
│   └── validation.js
├── utils/           # Utility functions
│   └── logger.js
├── uploads/         # Uploaded files directory
├── app.js           # Express app configuration
├── server.js        # Server entry point
└── package.json
```

## Features

- **MVC Architecture**: Clean separation of concerns
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Validation**: Request validation middleware
- **Logging**: Structured logging with different levels
- **Configuration**: Centralized configuration management
- **File Operations**: Async file system operations with proper error handling
- **OpenAI Integration**: Robust OpenAI API integration with error handling

## API Endpoints

- `POST /upload` - Upload files
- `GET /files` - Get all files
- `GET /files/:filename` - Get file content
- `POST /command` - Process natural language commands
- `GET /health` - Health check endpoint

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file with:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PORT=3001 (optional, defaults to 3001)
   NODE_ENV=development (optional)
   ```

3. Run the server:
   ```bash
   # Production
   npm start
   
   # Development (with auto-restart)
   npm run dev
   ```

## Error Handling

The application includes comprehensive error handling:

- **Validation Errors**: 400 Bad Request
- **Not Found**: 404 Not Found
- **OpenAI API Errors**: Proper error messages for quota exceeded, invalid keys, etc.
- **File System Errors**: Graceful handling of file operations
- **Uncaught Exceptions**: Process termination with logging

## Logging

The application uses structured logging with different levels:
- `INFO`: General information
- `ERROR`: Error messages
- `WARN`: Warning messages
- `DEBUG`: Debug information (only in development)

## Security Features

- Directory traversal protection
- Input validation
- CORS configuration
- File upload restrictions 