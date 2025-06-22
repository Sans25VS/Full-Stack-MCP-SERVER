# Google Cloud Storage Setup Guide

## Prerequisites

1. Google Cloud Platform account
2. A Google Cloud project
3. Google Cloud Storage bucket

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your Project ID

### 2. Enable Google Cloud Storage API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Cloud Storage"
3. Enable the "Cloud Storage API"

### 3. Create a Storage Bucket

1. Go to "Cloud Storage" > "Buckets"
2. Click "Create Bucket"
3. Choose a unique name for your bucket
4. Configure settings as needed (public/private)
5. Note down your bucket name

### 4. Create a Service Account

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name (e.g., "file-management-service")
4. Add the "Storage Object Admin" role
5. Create and download the JSON key file

### 5. Environment Variables

Add these environment variables to your `.env` file:

```env
# Google Cloud Storage Configuration
GOOGLE_CLOUD_PROJECT_ID=your_project_id_here
GOOGLE_CLOUD_BUCKET_NAME=your_bucket_name_here
GOOGLE_CLOUD_KEY_FILE=path/to/your/service-account-key.json
```

### 6. For Vercel Deployment

For Vercel deployment, you need to set the service account credentials as an environment variable:

1. Convert your service account JSON key to a single line
2. Add this environment variable in Vercel:
   ```
   GOOGLE_CLOUD_CREDENTIALS={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
   ```

### 7. Install Dependencies

```bash
npm install
```

## Features

With Google Cloud Storage integration, your application can:

- ✅ Upload files to cloud storage
- ✅ Download files from cloud storage
- ✅ List all files in the bucket
- ✅ Delete files from cloud storage
- ✅ Update file content
- ✅ Create new files
- ✅ Perform natural language operations on files

## File Operations

The system now supports:

1. **File Upload**: Files are uploaded to Google Cloud Storage with unique IDs
2. **File Listing**: Lists all files with metadata
3. **File Reading**: Downloads and displays file content
4. **File Deletion**: Removes files from cloud storage
5. **File Creation**: Creates new files via natural language commands
6. **File Editing**: Updates file content via natural language commands

## Security

- Files are stored with unique UUIDs to prevent conflicts
- Original filenames are preserved in metadata
- Service account has minimal required permissions
- All operations are logged for audit purposes

## Local Development

For local development, the system falls back to local filesystem storage when Google Cloud Storage is not configured. 