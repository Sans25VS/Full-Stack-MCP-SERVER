const fs = require('fs').promises;
const path = require('path');
const config = require('../config/database');

// In-memory file storage for Vercel deployment
const fileStorage = new Map();

class File {
  constructor() {
    this.uploadsDir = config.uploadsDir;
  }

  async getAllFiles() {
    try {
      // For Vercel deployment, use in-memory storage
      if (process.env.NODE_ENV === 'production') {
        const files = Array.from(fileStorage.keys()).map(filename => {
          const fileData = fileStorage.get(filename);
          return {
            name: filename,
            path: `/uploads/${filename}`,
            isDirectory: false,
            size: fileData.size,
            birthtime: fileData.birthtime,
            mtime: fileData.mtime
          };
        });
        return files;
      }

      // For local development, use filesystem
      const files = await fs.readdir(this.uploadsDir);
      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(this.uploadsDir, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
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
      // For Vercel deployment, use in-memory storage
      if (process.env.NODE_ENV === 'production') {
        const fileData = fileStorage.get(filename);
        if (!fileData) {
          throw new Error('File not found');
        }
        return fileData.content;
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
      // For Vercel deployment, use in-memory storage
      if (process.env.NODE_ENV === 'production') {
        fileStorage.set(filename, {
          content,
          size: Buffer.byteLength(content, 'utf8'),
          birthtime: new Date(),
          mtime: new Date()
        });
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
      // For Vercel deployment, use in-memory storage
      if (process.env.NODE_ENV === 'production') {
        const existingFile = fileStorage.get(filename);
        if (!existingFile) {
          throw new Error('File not found');
        }
        fileStorage.set(filename, {
          content,
          size: Buffer.byteLength(content, 'utf8'),
          birthtime: existingFile.birthtime,
          mtime: new Date()
        });
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
      // For Vercel deployment, use in-memory storage
      if (process.env.NODE_ENV === 'production') {
        const deleted = fileStorage.delete(filename);
        if (!deleted) {
          throw new Error('File not found');
        }
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
      // For Vercel deployment, use in-memory storage
      if (process.env.NODE_ENV === 'production') {
        return Array.from(fileStorage.keys());
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
      const content = buffer.toString('utf8');
      const now = new Date();
      
      fileStorage.set(filename, {
        content,
        size: buffer.length,
        mimetype,
        birthtime: now,
        mtime: now
      });
      
      return { message: `File ${filename} uploaded successfully.` };
    } catch (error) {
      throw new Error(`Unable to add uploaded file: ${error.message}`);
    }
  }
}

module.exports = new File(); 