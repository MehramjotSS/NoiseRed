import React, { useState, useRef } from 'react';
import './styles.css';

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [denoisedAudio, setDenoisedAudio] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.includes('audio')) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setDenoisedAudio(null);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.includes('audio')) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setDenoisedAudio(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const processAudio = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('audio', file);
    
    try {
      const response = await fetch('http://localhost:8000/api/denoise', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setDenoisedAudio(url);
      } else {
        alert('Failed to process audio. Please try again.');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadDenoised = () => {
    if (!denoisedAudio) return;
    
    const a = document.createElement('a');
    a.href = denoisedAudio;
    a.download = `denoised_${fileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="app-container">
      <h1>AI Audio Noise Reduction</h1>
      <p>Upload an audio file to remove background noise using AI technology</p>
      
      <div 
        className={`upload-container ${isDragActive ? 'active' : ''}`}
        onClick={handleUploadClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="upload-icon">📁</div>
        <p className="upload-text">
          {fileName ? fileName : 'Drag & drop your audio file here or click to browse'}
        </p>
        <input 
          type="file" 
          className="file-input" 
          ref={fileInputRef}
          accept="audio/*" 
          onChange={handleFileChange} 
        />
      </div>
      
      <button 
        className="process-btn" 
        onClick={processAudio} 
        disabled={!file || isProcessing}
      >
        {isProcessing ? (
          <>
            <span className="loading"></span>
            Processing...
          </>
        ) : 'Remove Noise'}
      </button>
      
      {denoisedAudio && (
        <div className="audio-container">
          <p className="audio-title">Denoised Audio:</p>
          <audio className="audio-player" controls src={denoisedAudio}></audio>
          <button className="download-btn" onClick={downloadDenoised}>
            Download Denoised Audio
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
