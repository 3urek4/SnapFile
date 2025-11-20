import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { QRCodeSVG } from 'qrcode.react'

export default function App() {
  const [mode, setMode] = useState<'upload' | 'retrieve'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [retrievalCode, setRetrievalCode] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [retrieving, setRetrieving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [retrievedFile, setRetrievedFile] = useState<{
    filename: string
    url: string
    size: number
  } | null>(null)
  const [previewing, setPreviewing] = useState(false)

  // Check URL for code parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code) {
      setMode('retrieve')
      setInputCode(code.toUpperCase())
    }
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setError('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  })

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError('')
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          setUploadProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText)
          setRetrievalCode(data.code)
          setFile(null)
          setUploadProgress(100)
        } else {
          throw new Error('Upload failed')
        }
        setUploading(false)
      })

      xhr.addEventListener('error', () => {
        setError('Upload failed. Please try again.')
        setUploading(false)
      })

      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    } catch (err) {
      setError('Upload failed. Please try again.')
      setUploading(false)
    }
  }

  const handleRetrieve = async () => {
    if (!inputCode.trim()) return

    setRetrieving(true)
    setError('')
    setRetrievedFile(null)

    try {
      const response = await fetch(`/api/retrieve?code=${inputCode}`)

      if (!response.ok) {
        throw new Error('Invalid or expired code')
      }

      const data = await response.json()
      setRetrievedFile(data.file)
    } catch (err) {
      setError('Invalid or expired code. Please check and try again.')
    } finally {
      setRetrieving(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(retrievalCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const copyLink = async () => {
    try {
      const link = `${window.location.origin}?code=${retrievalCode}`
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    if (retrievedFile) {
      const link = document.createElement('a')
      link.href = retrievedFile.url
      link.download = retrievedFile.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePreview = () => {
    if (retrievedFile) {
      setPreviewing(true)
    }
  }

  const isPreviewable = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'md'].includes(ext || '')
  }

  const shareUrl = `${window.location.origin}?code=${retrievalCode}`

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
              setMode('upload')
              setRetrievalCode('')
              setError('')
              setRetrievedFile(null)
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
              setMode('retrieve')
              setError('')
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
        <div className="card-glass p-8">
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
                      <p className="text-lg text-purple-600 font-medium">✨ Drop file here</p>
                    ) : (
                      <>
                        <p className="text-lg text-gray-700 font-medium mb-2">
                          Drop a file here or click to browse
                        </p>
                        <p className="text-sm text-gray-500">Single file • Available for 24 hours ⏰</p>
                      </>
                    )}
                  </div>

                  {/* Selected File */}
                  {file && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                        <span className="text-sm text-gray-700 truncate flex items-center gap-2">
                          <span>📄</span>
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2 bg-white/70 px-2 py-1 rounded-full">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploading && uploadProgress > 0 && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                      <p className="text-sm text-red-600">❌ {error}</p>
                    </div>
                  )}

                  {/* Upload Button */}
                  <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="btn-gradient w-full mt-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
                  >
                    {uploading ? '⏳ Uploading...' : '🚀 Upload File'}
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
                  <p className="text-gray-600 mb-8">Use this code to retrieve your file</p>
                  
                  {/* Retrieval Code */}
                  <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 mb-4 border-2 border-dashed border-purple-200">
                    <p className="text-4xl font-mono font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-wider mb-4">
                      {retrievalCode}
                    </p>
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 hover:bg-white rounded-lg text-sm font-medium text-gray-700 hover:text-purple-600 transition-all hover:scale-105"
                    >
                      {copied ? (
                        <>
                          <span className="i-carbon-checkmark w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <span className="i-carbon-copy w-4 h-4" />
                          Copy Code
                        </>
                      )}
                    </button>
                  </div>

                  {/* QR Code */}
                  <div className="mb-6 flex justify-center">
                    <div className="bg-white p-4 rounded-2xl shadow-lg">
                      <QRCodeSVG value={shareUrl} size={160} level="H" />
                      <p className="text-xs text-gray-500 mt-2 text-center">Scan to access</p>
                    </div>
                  </div>

                  {/* Share Link */}
                  <div className="mb-6">
                    <button
                      onClick={copyLink}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all hover:scale-105"
                    >
                      {copied ? (
                        <>
                          <span className="i-carbon-checkmark w-4 h-4" />
                          Link Copied!
                        </>
                      ) : (
                        <>
                          🔗 Copy Share Link
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mb-6">
                    ⏰ This code will expire in 24 hours
                  </p>
                  <button
                    onClick={() => {
                      setRetrievalCode('')
                      setFile(null)
                      setUploadProgress(0)
                    }}
                    className="text-purple-600 hover:text-purple-700 font-medium hover:scale-105 transition-transform duration-300"
                  >
                    📤 Upload Another File
                  </button>
                </div>
              )}
            </>
          ) : (
            // Retrieve Mode
            <>
              {!retrievedFile ? (
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
                    className="input-gradient w-full p-4 text-center text-2xl font-mono tracking-widest mb-4 hover:shadow-lg focus:shadow-xl"
                  />

                  {error && (
                    <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-100 animate-pulse">
                      <p className="text-sm text-red-600">❌ {error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleRetrieve}
                    disabled={inputCode.length !== 6 || retrieving}
                    className="btn-gradient w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
                  >
                    {retrieving ? '⏳ Retrieving...' : '📥 Retrieve File'}
                  </button>
                </>
              ) : (
                // Retrieved File State
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">📄</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">✨ File Retrieved!</h2>
                  
                  <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
                    <p className="text-lg font-medium text-gray-800 mb-2">{retrievedFile.filename}</p>
                    <p className="text-sm text-gray-500">
                      {(retrievedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <div className="flex gap-3 justify-center mb-6">
                    {isPreviewable(retrievedFile.filename) && (
                      <button
                        onClick={handlePreview}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105"
                      >
                        <span className="i-carbon-view w-5 h-5" />
                        Preview
                      </button>
                    )}
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105"
                    >
                      <span className="i-carbon-download w-5 h-5" />
                      Download
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setRetrievedFile(null)
                      setInputCode('')
                    }}
                    className="text-purple-600 hover:text-purple-700 font-medium hover:scale-105 transition-transform duration-300"
                  >
                    🔓 Retrieve Another File
                  </button>
                </div>
              )}
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

      {/* Preview Modal */}
      {previewing && retrievedFile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setPreviewing(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl max-h-[90vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{retrievedFile.filename}</h3>
              <button
                onClick={() => setPreviewing(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex items-center justify-center">
              {retrievedFile.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={retrievedFile.url} alt={retrievedFile.filename} className="max-w-full h-auto rounded-xl" />
              ) : retrievedFile.filename.match(/\.pdf$/i) ? (
                <iframe src={retrievedFile.url} className="w-full h-[70vh] rounded-xl" />
              ) : (
                <p className="text-gray-600">Preview not available for this file type</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}