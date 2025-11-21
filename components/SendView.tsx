import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, File as FileIcon, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { SnapFile, UploadStatus } from '../types';
import { uploadFiles } from '../services/storageService';
import { analyzeFiles } from '../services/geminiService';

export const SendView: React.FC = () => {
  const [files, setFiles] = useState<SnapFile[]>([]);
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.IDLE);
  const [pickupCode, setPickupCode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: SnapFile[] = [];
    const MAX_SIZE = 4 * 1024 * 1024; // 4MB limit for localStorage demo

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      if (file.size > MAX_SIZE) {
        setError(`File ${file.name} exceeds 4MB demo limit.`);
        continue;
      }

      const reader = new FileReader();
      const filePromise = new Promise<SnapFile>((resolve) => {
        reader.onload = (e) => {
          resolve({
            id: Math.random().toString(36).substring(7),
            name: file.name,
            size: file.size,
            type: file.type,
            data: e.target?.result as string
          });
        };
      });
      reader.readAsDataURL(file);
      newFiles.push(await filePromise);
    }

    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await processFiles(e.dataTransfer.files);
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;

    setStatus(UploadStatus.ANALYZING);
    
    // 1. AI Analysis (Gemini)
    let summary: string | undefined;
    // Only run AI if we have files and key. 
    // Note: In a real app, we might do this concurrently or as a background job.
    if (process.env.API_KEY) {
      summary = await analyzeFiles(files);
    }

    setStatus(UploadStatus.UPLOADING);

    // 2. Upload (Storage)
    const response = await uploadFiles(files, summary);

    if (response.success && response.code) {
      setPickupCode(response.code);
      setStatus(UploadStatus.COMPLETED);
    } else {
      setError(response.error || "Upload failed");
      setStatus(UploadStatus.ERROR);
    }
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const reset = () => {
    setFiles([]);
    setPickupCode(null);
    setStatus(UploadStatus.IDLE);
    setError(null);
  };

  if (status === UploadStatus.COMPLETED && pickupCode) {
    return (
      <div className="w-full max-w-lg mx-auto animate-fade-in">
        <div className="glass-panel rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
          <div className="mb-6 flex justify-center">
             <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-400 h-10 w-10" />
             </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Ready for pickup!</h2>
          <p className="text-gray-300 mb-8">Use this code on your other device to retrieve your files.</p>
          
          <div className="bg-black/30 rounded-xl p-6 mb-8 border border-white/10">
            <span className="text-5xl font-mono tracking-widest text-white font-bold select-all">
              {pickupCode}
            </span>
          </div>

          <button 
            onClick={reset}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all"
          >
            Send More Files
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up mt-8">
       <div className="glass-panel rounded-2xl p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Upload Files</h2>
          <p className="text-gray-400 text-sm">Support for images, documents, and archives.</p>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
            ${isDragging 
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]' 
              : 'border-gray-600 hover:border-gray-400 hover:bg-white/5'
            }
          `}
        >
          <input 
            type="file" 
            multiple 
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => processFiles(e.target.files)}
          />
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-800 rounded-full">
              <Upload className="text-blue-400" size={32} />
            </div>
          </div>
          <p className="text-lg font-medium mb-1">Click or drag files to upload</p>
          <p className="text-xs text-gray-500">Up to 4MB per file (Demo limit)</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Selected Files ({files.length})</h3>
            <div className="max-h-60 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon size={20} className="text-purple-400 flex-shrink-0" />
                    ) : file.type.includes('text') ? (
                       <FileText size={20} className="text-yellow-400 flex-shrink-0" />
                    ) : (
                      <FileIcon size={20} className="text-blue-400 flex-shrink-0" />
                    )}
                    <div className="truncate">
                      <p className="text-sm font-medium truncate text-gray-200">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-8">
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || status !== UploadStatus.IDLE}
            className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
              ${files.length === 0 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/25 active:scale-[0.98]'
              }
            `}
          >
            {status === UploadStatus.IDLE && 'Generate Pickup Code'}
            {status === UploadStatus.ANALYZING && (
              <>
                <Sparkles className="animate-pulse text-yellow-300" size={20} />
                <span>AI Analyzing...</span>
              </>
            )}
            {status === UploadStatus.UPLOADING && (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Uploading...</span>
              </>
            )}
          </button>
        </div>
       </div>
    </div>
  );
};