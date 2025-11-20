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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center">
              <svg className="w-5 h-5 text-white dark:text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-neutral-900 dark:text-white">SnapFile</span>
          </div>
          <a
            href="https://github.com/3urek4"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            by 3urek4
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">

          {/* Mode Tabs */}
          <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-8">
            <button
              onClick={() => {
                setMode('upload')
                setRetrievalCode('')
                setError('')
                setRetrievedFile(null)
              }}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'upload'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => {
                setMode('retrieve')
                setError('')
              }}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'retrieve'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Retrieve
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8">
            {mode === 'upload' ? (
              <>
                {!retrievalCode ? (
                  <>
                    {/* Drop Zone */}
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-16 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800'
                          : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-neutral-600 dark:text-neutral-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                        {isDragActive ? (
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">Drop file here</p>
                        ) : (
                          <>
                            <div>
                              <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Files are deleted after 24 hours
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Selected File */}
                    {file && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-neutral-900 dark:text-white truncate">{file.name}</span>
                          </div>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0 ml-4">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Upload Progress */}
                    {uploading && uploadProgress > 0 && (
                      <div className="mt-6">
                        <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                          <span>Uploading</span>
                          <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-neutral-900 dark:bg-white transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {error && (
                      <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    )}

                    {/* Upload Button */}
                    <button
                      onClick={handleUpload}
                      disabled={!file || uploading}
                      className="w-full mt-6 py-3 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                  </>
                ) : (
                  // Success State
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-400"
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
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">Upload Complete</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">Use this code to retrieve your file</p>
                    
                    {/* Retrieval Code */}
                    <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 mb-6">
                      <p className="text-3xl font-mono font-semibold text-neutral-900 dark:text-white tracking-wider mb-4">
                        {retrievalCode}
                      </p>
                      <button
                        onClick={copyToClipboard}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {copied ? (
                          <>
                            <span className="i-carbon-checkmark w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <span className="i-carbon-copy w-4 h-4" />
                            Copy Code
                          </>
                        )}
                      </button>
                    </div>

                    {/* QR Code & Share Link */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="flex flex-col items-center">
                        <div className="bg-white p-3 rounded-lg border border-neutral-200 mb-2">
                          <QRCodeSVG value={shareUrl} size={120} level="H" />
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Scan QR code</p>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <button
                          onClick={copyLink}
                          className="w-full px-4 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors mb-2"
                        >
                          {copied ? 'Link Copied!' : 'Copy Share Link'}
                        </button>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Share via URL</p>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
                      Expires in 24 hours
                    </p>
                    <button
                      onClick={() => {
                        setRetrievalCode('')
                        setFile(null)
                        setUploadProgress(0)
                      }}
                      className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                      Upload another file
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
                      <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-6 h-6 text-neutral-600 dark:text-neutral-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">Enter Retrieval Code</h2>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Input the 6-character code</p>
                    </div>

                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      placeholder="XXXXXX"
                      maxLength={6}
                      className="w-full p-4 text-center text-2xl font-mono tracking-widest bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-neutral-900 dark:focus:border-white focus:outline-none transition-colors mb-4 text-neutral-900 dark:text-white"
                    />

                    {error && (
                      <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    )}

                    <button
                      onClick={handleRetrieve}
                      disabled={inputCode.length !== 6 || retrieving}
                      className="w-full py-3 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {retrieving ? 'Retrieving...' : 'Retrieve File'}
                    </button>
                  </>
                ) : (
                  // Retrieved File State
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">File Retrieved</h2>
                    
                    <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 mb-6 mt-6">
                      <p className="text-base font-medium text-neutral-900 dark:text-white mb-2">{retrievedFile.filename}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {(retrievedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    <div className="flex gap-3 mb-6">
                      {isPreviewable(retrievedFile.filename) && (
                        <button
                          onClick={handlePreview}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-lg text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                        >
                          <span className="i-carbon-view w-4 h-4" />
                          Preview
                        </button>
                      )}
                      <button
                        onClick={handleDownload}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                      >
                        <span className="i-carbon-download w-4 h-4" />
                        Download
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setRetrievedFile(null)
                        setInputCode('')
                      }}
                      className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                      Retrieve another file
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
          <p>Files are automatically deleted after 24 hours • © {new Date().getFullYear()} SnapFile</p>
        </div>
      </footer>

      {/* Preview Modal */}
      {previewing && retrievedFile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setPreviewing(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-xl max-w-5xl max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white truncate">{retrievedFile.filename}</h3>
              <button
                onClick={() => setPreviewing(false)}
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex items-center justify-center">
              {retrievedFile.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={retrievedFile.url} alt={retrievedFile.filename} className="max-w-full h-auto rounded-lg" />
              ) : retrievedFile.filename.match(/\.pdf$/i) ? (
                <iframe src={retrievedFile.url} className="w-full h-[70vh] rounded-lg" title="PDF Preview" />
              ) : (
                <p className="text-neutral-500 dark:text-neutral-400">Preview not available for this file type</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}