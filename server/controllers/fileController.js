const FileModel = require('../models/File');
const OpenAIService = require('../models/OpenAI');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/database');

class FileController {
  async uploadFiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const uploadedFiles = [];
      
      for (const file of req.files) {
        try {
          // Use the File model to handle the upload
          const result = await FileModel.addUploadedFile(file.originalname, file.buffer, file.mimetype);
          
          uploadedFiles.push({
            name: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            ...(result.fileInfo && { 
              fileName: result.fileInfo.fileName,
              url: result.fileInfo.url 
            })
          });
          
          console.log(`File uploaded: ${file.originalname}`);
        } catch (fileError) {
          console.error(`Error saving file ${file.originalname}:`, fileError);
          // Continue with other files even if one fails
        }
      }

      if (uploadedFiles.length === 0) {
        return res.status(500).json({ error: 'Failed to upload any files' });
      }

      res.status(200).json({ 
        message: `${uploadedFiles.length} file(s) uploaded successfully`,
        files: uploadedFiles
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getAllFiles(req, res) {
    try {
      const files = await FileModel.getAllFiles();
      res.status(200).json(files);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getFileContent(req, res) {
    try {
      const { filename } = req.params;
      const content = await FileModel.getFileContent(filename);
      res.status(200).send(content);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async processCommand(req, res) {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // Get current file structure
      const fileStructure = await FileModel.getFileStructure();
      
      // Process command with OpenAI
      const result = await OpenAIService.processCommand(prompt, fileStructure);
      const { command, args } = result;

      if (!command || !args || !args[0]) {
        return res.status(400).json({ error: 'Invalid command structure' });
      }

      let response;
      switch (command) {
        case 'create':
          response = await FileModel.createFile(args[0], args[1] || '');
          break;
        case 'edit':
          if (!args[1]) {
            return res.status(400).json({ error: 'Content is required for edit command' });
          }
          response = await FileModel.updateFile(args[0], args[1]);
          break;
        case 'delete':
          response = await FileModel.deleteFile(args[0]);
          break;
        default:
          return res.status(400).json({ error: 'Invalid command' });
      }

      res.status(200).json(response);
    } catch (error) {
      console.error('Command processing error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new FileController(); 