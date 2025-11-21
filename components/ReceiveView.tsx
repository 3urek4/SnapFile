import React, { useState } from 'react';
import { Download, Search, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { TransferSession, StorageResponse } from '../types';
import { retrieveFiles } from '../services/storageService';

export const ReceiveView: React.FC = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<TransferSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRetrieve = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length < 6) return;

    setIsLoading(true);
    setError(null);
    setSession(null);

    const response: StorageResponse = await retrieveFiles(code);

    setIsLoading(false);

    if (response.success && response.session) {
      setSession(response.session);
    } else {
      setError(response.error || 'Files not found');
    }
  };

  const handleDownload = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-xl mx-auto animate-slide-up mt-8">
      {!session ? (
        <div className="glass-panel rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Receive Files</h2>
            <p className="text-gray-400">Enter the 6-digit code to retrieve your files.</p>
          </div>

          <form onSubmit={handleRetrieve} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 text-center text-4xl font-mono tracking-[0.5em] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-red-300 bg-red-500/10 p-3 rounded-lg text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={code.length < 6 || isLoading}
              className={`
                w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
                ${code.length < 6 || isLoading
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-500 text-white hover:shadow-purple-500/25 active:scale-[0.98]'
                }
              `}
            >
              {isLoading ? 'Searching...' : 'Retrieve Files'}
              {!isLoading && <Search size={20} />}
            </button>
          </form>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold">Files Found</h2>
              <p className="text-gray-400 text-sm mt-1">Session expires in 24 hours</p>
            </div>
            <button 
              onClick={() => { setSession(null); setCode(''); }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              New Search
            </button>
          </div>

          {/* AI Summary Section */}
          {session.summary && (
             <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2 text-yellow-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>AI Insight</span>
                </div>
                <p className="text-sm text-gray-200 italic leading-relaxed">
                  "{session.summary}"
                </p>
             </div>
          )}

          <div className="space-y-3">
            {session.files.map((file, idx) => (
              <div key={idx} className="group flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center">
                    <FileText className="text-gray-300" size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-200 truncate pr-4">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDownload(file.data, file.name)}
                  className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors shadow-lg shadow-purple-500/20"
                  title="Download"
                >
                  <Download size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-gray-500">Ensure you trust the source of these files before downloading.</p>
          </div>
        </div>
      )}
    </div>
  );
};