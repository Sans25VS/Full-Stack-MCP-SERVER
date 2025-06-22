const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class GoogleCloudStorageService {
  constructor() {
    this.storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
      // For Vercel deployment, use service account key from environment variable
      credentials: process.env.GOOGLE_CLOUD_CREDENTIALS ? 
        JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS) : undefined
    });
    
    this.bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
    this.bucket = this.storage.bucket(this.bucketName);
  }

  async uploadFile(fileBuffer, originalName, mimetype) {
    try {
      const fileName = `${uuidv4()}-${originalName}`;
      const file = this.bucket.file(fileName);
      
      const metadata = {
        contentType: mimetype,
        metadata: {
          originalName: originalName,
          uploadedAt: new Date().toISOString()
        }
      };

      await file.save(fileBuffer, {
        metadata: metadata,
        resumable: false
      });

      return {
        fileName: fileName,
        originalName: originalName,
        size: fileBuffer.length,
        mimetype: mimetype,
        url: `https://storage.googleapis.com/${this.bucketName}/${fileName}`
      };
    } catch (error) {
      console.error('Error uploading to Google Cloud Storage:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async downloadFile(fileName) {
    try {
      const file = this.bucket.file(fileName);
      const [buffer] = await file.download();
      return buffer;
    } catch (error) {
      console.error('Error downloading from Google Cloud Storage:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  async deleteFile(fileName) {
    try {
      const file = this.bucket.file(fileName);
      await file.delete();
      return true;
    } catch (error) {
      console.error('Error deleting from Google Cloud Storage:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async listFiles() {
    try {
      const [files] = await this.bucket.getFiles();
      return files.map(file => {
        const metadata = file.metadata;
        return {
          name: metadata.originalName || file.name,
          fileName: file.name,
          size: parseInt(metadata.size) || 0,
          mimetype: metadata.contentType,
          uploadedAt: metadata.uploadedAt,
          url: `https://storage.googleapis.com/${this.bucketName}/${file.name}`
        };
      });
    } catch (error) {
      console.error('Error listing files from Google Cloud Storage:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  async getFileContent(fileName) {
    try {
      const buffer = await this.downloadFile(fileName);
      return buffer.toString('utf8');
    } catch (error) {
      console.error('Error getting file content from Google Cloud Storage:', error);
      throw new Error(`Failed to get file content: ${error.message}`);
    }
  }

  async updateFile(fileName, content) {
    try {
      const file = this.bucket.file(fileName);
      const buffer = Buffer.from(content, 'utf8');
      
      await file.save(buffer, {
        metadata: {
          contentType: 'text/plain',
          updatedAt: new Date().toISOString()
        },
        resumable: false
      });

      return true;
    } catch (error) {
      console.error('Error updating file in Google Cloud Storage:', error);
      throw new Error(`Failed to update file: ${error.message}`);
    }
  }

  async createFile(fileName, content) {
    try {
      const buffer = Buffer.from(content, 'utf8');
      const file = this.bucket.file(fileName);
      
      await file.save(buffer, {
        metadata: {
          contentType: 'text/plain',
          originalName: fileName,
          uploadedAt: new Date().toISOString()
        },
        resumable: false
      });

      return {
        fileName: fileName,
        originalName: fileName,
        size: buffer.length,
        url: `https://storage.googleapis.com/${this.bucketName}/${fileName}`
      };
    } catch (error) {
      console.error('Error creating file in Google Cloud Storage:', error);
      throw new Error(`Failed to create file: ${error.message}`);
    }
  }
}

module.exports = new GoogleCloudStorageService(); 