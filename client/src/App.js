import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/files');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Error fetching files.');
    }
    setLoading(false);
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
    try {
      await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });
      fetchFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Error uploading files.');
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
      const response = await fetch(`http://localhost:3001/files/${file.name}`);
      const data = await response.text();
      setFileContent(data);
    } catch (error) {
      console.error('Error fetching file content:', error);
      setError('Error fetching file content.');
    }
    setLoading(false);
  };

  const handleDeleteFile = async (filename, e) => {
    e.stopPropagation(); // Prevent file selection when clicking delete
    
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('http://localhost:3001/command', {
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
      
      // Clear selected file if it was the deleted one
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
    if (!prompt) {
      alert('Please enter a command.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:3001/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Natural Language File System</h1>
      </header>
      {loading && <div className="loader"></div>}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <main>
        <div className="upload-section">
          <h2>Upload Folder</h2>
          <input type="file" webkitdirectory="" directory="" multiple onChange={handleUpload} />
        </div>
        <div className="files-section">
          <h2>Files</h2>
          {files.length > 0 ? (
            <ul>
              {files.map((file, index) => (
                <li
                  key={index}
                  onClick={() => handleFileClick(file)}
                  className={selectedFile && selectedFile.name === file.name ? 'selected' : ''}
                >
                  <span className="file-name">
                    {file.isDirectory ? (
                      <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffca28"><path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                    ) : (
                      <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#90a4ae"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>
                    )}
                    {file.name}
                  </span>
                  <div className="file-actions">
                    <span className="file-info">
                      {file.isDirectory ? 'Folder' : `${formatFileSize(file.size)} - ${new Date(file.mtime).toLocaleString()}`}
                    </span>
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
                </li>
              ))}
            </ul>
          ) : (
            <p>No files uploaded yet.</p>
          )}
        </div>
        {selectedFile && (
          <div className="file-content-section">
            <div className="file-content-header">
              <h2>{selectedFile.name}</h2>
              <div className="file-content-actions">
                <button onClick={clearSelectedFile} className="close-btn">Close</button>
                {!selectedFile.isDirectory && (
                  <button 
                    onClick={() => handleDeleteFile(selectedFile.name, { stopPropagation: () => {} })}
                    className="delete-btn"
                  >
                    Delete File
                  </button>
                )}
              </div>
            </div>
            <pre>{fileContent}</pre>
          </div>
        )}
        <div className="command-section">
          <h2>Command Prompt</h2>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCommand()}
            placeholder="e.g., create a new file called test.txt"
          />
          <button onClick={handleCommand}>Execute</button>
          <button onClick={() => setPrompt('')} className="clear-btn">Clear</button>
        </div>
      </main>
    </div>
  );
}

export default App;
