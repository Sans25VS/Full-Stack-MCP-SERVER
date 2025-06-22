# Ressel Assignment

This is a full-stack application that allows you to interact with the file system using natural language. The server has been refactored to follow the MVC (Model-View-Controller) architecture for better organization and maintainability.

## Project Structure

```
Ressel Assignment/
├── client/           # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/           # Node.js backend (MVC architecture)
│   ├── config/       # Configuration files
│   ├── controllers/  # Business logic controllers
│   ├── models/       # Data models and business logic
│   ├── routes/       # Route definitions
│   ├── middleware/   # Custom middleware
│   ├── utils/        # Utility functions
│   ├── uploads/      # Uploaded files directory
│   ├── app.js        # Express app configuration
│   ├── server.js     # Server entry point
│   └── package.json
└── package.json      # Root package.json for scripts
```

## How to run the application

1.  **Install dependencies:**
    *   Run `npm install` in the root directory to install the dependencies for the server.
    *   Run `npm run install-client` to install the dependencies for the client.

2.  **Set up environment variables:**
    *   Create a `.env` file in the `server` directory.
    *   Add your OpenAI API key to the `.env` file: `OPENAI_API_KEY=your_api_key`. You can get an API key from the [OpenAI website](https://openai.com).

3.  **Start the application:**
    *   Run `npm start` in the root directory. This will start both the client and the server.

4.  **Open the application:**
    *   Open your browser and navigate to `http://localhost:3000`.

## Server Architecture

The server follows the MVC pattern:

- **Models**: Handle data operations (File.js, OpenAI.js)
- **Controllers**: Handle business logic (fileController.js)
- **Routes**: Define API endpoints (fileRoutes.js)
- **Middleware**: Handle validation and error processing
- **Config**: Centralized configuration management
- **Utils**: Helper functions and logging

## How to use the application

1.  **Upload a folder:**
    *   Click on the "Choose Files" button in the "Upload Folder" section.
    *   Select a folder from your local machine.

2.  **View files:**
    *   The files in the uploaded folder will be displayed in the "Files" section.

3.  **Use the command prompt:**
    *   Enter a natural language command in the command prompt.
    *   For example:
        *   `create a new file called test.txt`
        *   `edit the file index.html`
        *   `delete the file style.css`
        *   `add '<h1>Hello World</h1>' to index.html`
    *   Click on the "Execute" button.
    *   The file system will be updated and the file list will be refreshed.

## API Endpoints

- `POST /upload` - Upload files
- `GET /files` - Get all files
- `GET /files/:filename` - Get file content
- `POST /command` - Process natural language commands
- `GET /health` - Health check endpoint

## Error Handling

The application includes comprehensive error handling for:
- OpenAI API quota exceeded
- Invalid API keys
- File system errors
- Validation errors
- Network errors 