const fs = require('fs').promises;
const path = require('path');
const config = require('../config/database');

class File {
  constructor() {
    this.uploadsDir = config.uploadsDir;
  }

  async getAllFiles() {
    try {
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
      const filePath = path.join(this.uploadsDir, filename);
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      throw new Error(`Unable to read file: ${error.message}`);
    }
  }

  async createFile(filename, content = '') {
    try {
      const filePath = path.join(this.uploadsDir, filename);
      await fs.writeFile(filePath, content);
      return { message: `File ${filename} created.` };
    } catch (error) {
      throw new Error(`Unable to create file: ${error.message}`);
    }
  }

  async updateFile(filename, content) {
    try {
      const filePath = path.join(this.uploadsDir, filename);
      await fs.writeFile(filePath, content);
      return { message: `File ${filename} edited.` };
    } catch (error) {
      throw new Error(`Unable to edit file: ${error.message}`);
    }
  }

  async deleteFile(filename) {
    try {
      const filePath = path.join(this.uploadsDir, filename);
      await fs.unlink(filePath);
      return { message: `File ${filename} deleted.` };
    } catch (error) {
      throw new Error(`Unable to delete file: ${error.message}`);
    }
  }

  async getFileStructure() {
    try {
      const files = await fs.readdir(this.uploadsDir);
      return files;
    } catch (error) {
      throw new Error(`Unable to get file structure: ${error.message}`);
    }
  }
}

module.exports = new File(); 