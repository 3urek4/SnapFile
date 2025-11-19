'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function Home() {
  const [mode, setMode] = useState<'upload' | 'retrieve'>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [retrievalCode, setRetrievalCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [retrieving, setRetrieving] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setRetrievalCode(data.code);
      setFiles([]);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRetrieve = async () => {
    if (!inputCode.trim()) return;

    setRetrieving(true);
    setError('');

    try {
      const response = await fetch(`/api/retrieve?code=${inputCode}`);

      if (!response.ok) {
        throw new Error('Invalid or expired code');
      }

      const data = await response.json();

      // Download each file
      for (const file of data.files) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      setError('Invalid or expired code. Please check and try again.');
    } finally {
      setRetrieving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-thin text-gray-900 mb-2">Transfer</h1>
          <p className="text-gray-500 font-light">Simple. Secure. Temporary.</p>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1 shadow-sm">
          <button
            onClick={() => {
              setMode('upload');
              setRetrievalCode('');
              setError('');
            }}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              mode === 'upload'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => {
              setMode('retrieve');
              setError('');
            }}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              mode === 'retrieve'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Retrieve
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 backdrop-blur-lg">
          {mode === 'upload' ? (
            <>
              {!retrievalCode ? (
                <>
                  {/* Drop Zone */}
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    {isDragActive ? (
                      <p className="text-lg text-blue-600 font-light">Drop files here</p>
                    ) : (
                      <>
                        <p className="text-lg text-gray-700 font-light mb-2">
                          Drop files here or click to browse
                        </p>
                        <p className="text-sm text-gray-500">Files will be available for 24 hours</p>
                      </>
                    )}
                  </div>

                  {/* Selected Files */}
                  {files.length > 0 && (
                    <div className="mt-6 space-y-2">
                      {files.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                        >
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 rounded-xl">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Upload Button */}
                  <button
                    onClick={handleUpload}
                    disabled={files.length === 0 || uploading}
                    className="w-full mt-6 py-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    {uploading ? 'Uploading...' : 'Upload Files'}
                  </button>
                </>
              ) : (
                // Success State
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-light text-gray-900 mb-2">Upload Complete</h2>
                  <p className="text-gray-500 mb-8">Use this code to retrieve your files</p>
                  <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                    <p className="text-4xl font-mono font-light text-blue-600 tracking-wider">
                      {retrievalCode}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    This code will expire in 24 hours
                  </p>
                  <button
                    onClick={() => {
                      setRetrievalCode('');
                      setFiles([]);
                    }}
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Upload More Files
                  </button>
                </div>
              )}
            </>
          ) : (
            // Retrieve Mode
            <>
              <div className="text-center mb-8">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h2 className="text-2xl font-light text-gray-900 mb-2">Enter Retrieval Code</h2>
                <p className="text-gray-500">Input the code you received</p>
              </div>

              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full p-4 text-center text-2xl font-mono tracking-widest border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all mb-4"
              />

              {error && (
                <div className="mb-4 p-4 bg-red-50 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handleRetrieve}
                disabled={inputCode.length !== 6 || retrieving}
                className="w-full py-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {retrieving ? 'Retrieving...' : 'Retrieve Files'}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Files are automatically deleted after 24 hours
        </p>
      </div>
    </div>
  );
}