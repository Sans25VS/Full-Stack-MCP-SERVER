import React, { useState, useEffect } from 'react';
import './App.css';
import API_BASE_URL from './config';

function App() {
  const [files, setFiles] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchFiles = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/files`);
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Error fetching files.');
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e) => {
    const uploadedFiles = e.target.files;
    const formData = new FormData();
    for (let i = 0; i < uploadedFiles.length; i++) {
      formData.append('files', uploadedFiles[i]);
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const result = await response.json();
      setSuccess(result.message);
      fetchFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
      setError(error.message);
    }
    setLoading(false);
  };

  const handleFileClick = async (file) => {
    if (selectedFile && selectedFile.name === file.name) {
      setSelectedFile(null);
      setFileContent('');
      return;
    }
    setSelectedFile(file);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/files/${file.name}`);
      const data = await response.text();
      setFileContent(data);
    } catch (error) {
      console.error('Error fetching file content:', error);
      setError('Error fetching file content.');
    }
    setLoading(false);
  };

  const handleDeleteFile = async (filename, e) => {
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: `delete the file ${filename}` }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error deleting file.');
      }
      
      const successData = await response.json();
      setSuccess(successData.message);
      
      if (selectedFile && selectedFile.name === filename) {
        setSelectedFile(null);
        setFileContent('');
      }
      
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      setError(error.message);
    }
    setLoading(false);
  };

  const handleCommand = async () => {
    if (!prompt.trim()) {
      setError('Please enter a command.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error executing command.');
      }
      const successData = await response.json();
      setSuccess(successData.message);
      fetchFiles();
      setPrompt('');
    } catch (error) {
      console.error('Error executing command:', error);
      setError(error.message);
    }
    setLoading(false);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFileContent('');
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>📁 File Change</h1>
          <p>Natural Language File Management with MCP Server</p>
        </div>
      </header>

      {loading && (
        <div className="loading-overlay">
          <div className="loader"></div>
          <p>Processing...</p>
        </div>
      )}

      {(error || success) && (
        <div className="message-container">
          {error && (
            <div className="error-message" onClick={clearMessages}>
              <span>❌ {error}</span>
              <button className="close-btn">×</button>
            </div>
          )}
          {success && (
            <div className="success-message" onClick={clearMessages}>
              <span>✅ {success}</span>
              <button className="close-btn">×</button>
            </div>
          )}
        </div>
      )}

      <main className="main-content">
        <div className="top-row">
          <div className="upload-section">
            <h2>📤 Upload Files</h2>
            <div className="upload-area">
              <input 
                type="file" 
                webkitdirectory="" 
                directory="" 
                multiple 
                onChange={handleUpload}
                id="file-upload"
                className="file-input"
              />
              <label htmlFor="file-upload" className="upload-label">
                <span>📁 Choose Folder or Files</span>
                <small>Click to select files or folders to upload</small>
              </label>
            </div>
          </div>

          <div className="files-section">
            <div className="section-header">
              <h2>📋 Files ({files.length})</h2>
              <button 
                onClick={fetchFiles} 
                className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
                disabled={loading || refreshing}
                title="Refresh files"
                aria-label="Refresh file list"
              >
                🔄
              </button>
            </div>
            
            {files.length > 0 ? (
              <div className="files-grid">
                {files.map((file, index) => (
                  <div
                    key={index}
                    onClick={() => handleFileClick(file)}
                    className={`file-card ${selectedFile && selectedFile.name === file.name ? 'selected' : ''}`}
                  >
                    <div className="file-icon">
                      {file.isDirectory ? '📁' : '📄'}
                    </div>
                    <div className="file-info">
                      <h3 className="file-name">{file.name}</h3>
                      <p className="file-details">
                        {file.isDirectory ? 'Folder' : `${formatFileSize(file.size)} • ${new Date(file.mtime).toLocaleDateString()}`}
                      </p>
                    </div>
                    {!file.isDirectory && (
                      <button 
                        onClick={(e) => handleDeleteFile(file.name, e)}
                        className="delete-btn"
                        title="Delete file"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>📂 No files uploaded yet</p>
                <p>Upload some files to get started!</p>
              </div>
            )}
          </div>
        </div>

        {selectedFile && (
          <div className="file-content-section">
            <div className="content-header">
              <h2>📄 {selectedFile.name}</h2>
              <div className="content-actions">
                <button onClick={clearSelectedFile} className="close-btn">
                  ✕ Close
                </button>
                {!selectedFile.isDirectory && (
                  <button 
                    onClick={() => handleDeleteFile(selectedFile.name, { stopPropagation: () => {} })}
                    className="delete-btn"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
            <div className="content-viewer">
              <pre>{fileContent}</pre>
            </div>
          </div>
        )}

        <div className="command-section">
          <h2>🤖 Natural Language Commands</h2>
          <div className="command-input">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCommand()}
              placeholder="e.g., create a new file called test.txt with content 'Hello World'"
              className="command-field"
            />
            <div className="command-actions">
              <button onClick={handleCommand} className="execute-btn" disabled={loading || !prompt.trim()}>
                🚀 Execute
              </button>
              <button onClick={() => setPrompt('')} className="clear-btn">
                🗑️ Clear
              </button>
            </div>
          </div>
          <div className="command-examples">
            <h4>💡 Example Commands:</h4>
            <ul>
              <li>"create a file called notes.txt"</li>
              <li>"edit file.txt and add 'new content'"</li>
              <li>"delete the file old.txt"</li>
              <li>create a file called config.json with content {'{"key": "value"}'}</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
