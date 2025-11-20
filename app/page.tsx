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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4 transform hover:scale-110 transition-transform duration-300">
            <div className="text-6xl">📦</div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 hover:scale-105 transition-transform duration-300">
            SnapFile
          </h1>
          <p className="text-gray-600 font-light">Simple. Secure. Temporary.</p>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-2 mb-8 bg-white/80 backdrop-blur-lg rounded-2xl p-1.5 shadow-lg border border-white/20">
          <button
            onClick={() => {
              setMode('upload');
              setRetrievalCode('');
              setError('');
            }}
            className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
              mode === 'upload'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:bg-gray-50/50 hover:scale-105'
            }`}
          >
            📤 Upload
          </button>
          <button
            onClick={() => {
              setMode('retrieve');
              setError('');
            }}
            className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
              mode === 'retrieve'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:bg-gray-50/50 hover:scale-105'
            }`}
          >
            🔓 Retrieve
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {mode === 'upload' ? (
            <>
              {!retrievalCode ? (
                <>
                  {/* Drop Zone */}
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                      isDragActive
                        ? 'border-purple-500 bg-purple-50 scale-105 shadow-lg'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 hover:scale-[1.02]'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="transform transition-transform duration-300 hover:scale-110">
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
                    </div>
                    {isDragActive ? (
                      <p className="text-lg text-purple-600 font-medium">✨ Drop files here</p>
                    ) : (
                      <>
                        <p className="text-lg text-gray-700 font-medium mb-2">
                          Drop files here or click to browse
                        </p>
                        <p className="text-sm text-gray-500">Files will be available for 24 hours ⏰</p>
                      </>
                    )}
                  </div>

                  {/* Selected Files */}
                  {files.length > 0 && (
                    <div className="mt-6 space-y-2">
                      {files.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                        >
                          <span className="text-sm text-gray-700 truncate flex items-center gap-2">
                            <span>📄</span>
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500 ml-2 bg-white/70 px-2 py-1 rounded-full">
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
                    className="w-full mt-6 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                  >
                    {uploading ? '⏳ Uploading...' : '🚀 Upload Files'}
                  </button>
                </>
              ) : (
                // Success State
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">✨ Upload Complete!</h2>
                  <p className="text-gray-600 mb-8">Use this code to retrieve your files</p>
                  <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-dashed border-purple-200 hover:border-purple-400 transition-all duration-300 hover:scale-105">
                    <p className="text-4xl font-mono font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-wider">
                      {retrievalCode}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    ⏰ This code will expire in 24 hours
                  </p>
                  <button
                    onClick={() => {
                      setRetrievalCode('');
                      setFiles([]);
                    }}
                    className="text-purple-600 hover:text-purple-700 font-medium hover:scale-105 transition-transform duration-300"
                  >
                    📤 Upload More Files
                  </button>
                </div>
              )}
            </>
          ) : (
            // Retrieve Mode
            <>
              <div className="text-center mb-8">
                <div className="inline-block transform hover:scale-110 transition-transform duration-300">
                  <svg
                    className="mx-auto h-16 w-16 text-purple-400 mb-4"
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
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">🔓 Enter Retrieval Code</h2>
                <p className="text-gray-600">Input the code you received</p>
              </div>

              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full p-4 text-center text-2xl font-mono tracking-widest border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none transition-all mb-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 hover:shadow-lg focus:shadow-xl"
              />

              {error && (
                <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-100 animate-pulse">
                  <p className="text-sm text-red-600">❌ {error}</p>
                </div>
              )}

              <button
                onClick={handleRetrieve}
                disabled={inputCode.length !== 6 || retrieving}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
              >
                {retrieving ? '⏳ Retrieving...' : '📥 Retrieve Files'}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-3">
          <p className="text-sm text-gray-500">
            ⏰ Files are automatically deleted after 24 hours
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span>Made with</span>
            <span className="text-red-500 animate-pulse">❤️</span>
            <span>by</span>
            <a
              href="https://github.com/3urek4"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-purple-600 hover:text-purple-700 hover:underline transition-all hover:scale-105 inline-block"
            >
              3urek4
            </a>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} SnapFile. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}