const fs = require('fs').promises;
const path = require('path');
const config = require('../config/database');
const GoogleCloudStorage = require('../services/googleCloudStorage');

// In-memory file storage for fallback (not used with GCS)
const fileStorage = new Map();

class File {
  constructor() {
    this.uploadsDir = config.uploadsDir;
  }

  async getAllFiles() {
    try {
      // For production, use Google Cloud Storage
      if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_CLOUD_BUCKET_NAME) {
        const files = await GoogleCloudStorage.listFiles();
        return files.map(file => ({
          name: file.name,
          fileName: file.fileName, // GCS filename
          path: file.url,
          isDirectory: false,
          size: file.size,
          birthtime: new Date(file.uploadedAt),
          mtime: new Date(file.uploadedAt),
          url: file.url
        }));
      }

      // For local development, use filesystem
      const files = await fs.readdir(this.uploadsDir);
      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(this.uploadsDir, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
            fileName: file,
            path: filePath,
            isDirectory: stats.isDirectory(),
            size: stats.size,
            birthtime: stats.birthtime,
            mtime: stats.mtime
          };
        })
      );
      return fileDetails;
    } catch (error) {
      throw new Error(`Unable to scan directory: ${error.message}`);
    }
  }

  async getFileContent(filename) {
    try {
      // For production, use Google Cloud Storage
      if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_CLOUD_BUCKET_NAME) {
        // Find the GCS filename by original name
        const files = await GoogleCloudStorage.listFiles();
        const file = files.find(f => f.name === filename);
        if (!file) {
          throw new Error('File not found');
        }
        return await GoogleCloudStorage.getFileContent(file.fileName);
      }

      // For local development, use filesystem
      const filePath = path.join(this.uploadsDir, filename);
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      throw new Error(`Unable to read file: ${error.message}`);
    }
  }

  async createFile(filename, content = '') {
    try {
      // For production, use Google Cloud Storage
      if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_CLOUD_BUCKET_NAME) {
        await GoogleCloudStorage.createFile(filename, content);
        return { message: `File ${filename} created.` };
      }

      // For local development, use filesystem
      const filePath = path.join(this.uploadsDir, filename);
      await fs.writeFile(filePath, content);
      return { message: `File ${filename} created.` };
    } catch (error) {
      throw new Error(`Unable to create file: ${error.message}`);
    }
  }

  async updateFile(filename, content) {
    try {
      // For production, use Google Cloud Storage
      if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_CLOUD_BUCKET_NAME) {
        // Find the GCS filename by original name
        const files = await GoogleCloudStorage.listFiles();
        const file = files.find(f => f.name === filename);
        if (!file) {
          throw new Error('File not found');
        }
        await GoogleCloudStorage.updateFile(file.fileName, content);
        return { message: `File ${filename} edited.` };
      }

      // For local development, use filesystem
      const filePath = path.join(this.uploadsDir, filename);
      await fs.writeFile(filePath, content);
      return { message: `File ${filename} edited.` };
    } catch (error) {
      throw new Error(`Unable to edit file: ${error.message}`);
    }
  }

  async deleteFile(filename) {
    try {
      // For production, use Google Cloud Storage
      if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_CLOUD_BUCKET_NAME) {
        // Find the GCS filename by original name
        const files = await GoogleCloudStorage.listFiles();
        const file = files.find(f => f.name === filename);
        if (!file) {
          throw new Error('File not found');
        }
        await GoogleCloudStorage.deleteFile(file.fileName);
        return { message: `File ${filename} deleted.` };
      }

      // For local development, use filesystem
      const filePath = path.join(this.uploadsDir, filename);
      await fs.unlink(filePath);
      return { message: `File ${filename} deleted.` };
    } catch (error) {
      throw new Error(`Unable to delete file: ${error.message}`);
    }
  }

  async getFileStructure() {
    try {
      // For production, use Google Cloud Storage
      if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_CLOUD_BUCKET_NAME) {
        const files = await GoogleCloudStorage.listFiles();
        return files.map(f => f.name);
      }

      // For local development, use filesystem
      const files = await fs.readdir(this.uploadsDir);
      return files;
    } catch (error) {
      throw new Error(`Unable to get file structure: ${error.message}`);
    }
  }

  // Method to add files from upload
  async addUploadedFile(filename, buffer, mimetype) {
    try {
      // For production, use Google Cloud Storage
      if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_CLOUD_BUCKET_NAME) {
        const result = await GoogleCloudStorage.uploadFile(buffer, filename, mimetype);
        return { message: `File ${filename} uploaded successfully.`, fileInfo: result };
      }

      // For local development, use filesystem
      const filePath = path.join(this.uploadsDir, filename);
      await fs.writeFile(filePath, buffer);
      return { message: `File ${filename} uploaded successfully.` };
    } catch (error) {
      throw new Error(`Unable to add uploaded file: ${error.message}`);
    }
  }
}

module.exports = new File(); 