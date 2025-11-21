import React from 'react';
import { AppMode } from '../types';
import { UploadCloud, DownloadCloud } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (mode: AppMode) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl animate-slide-up">
      <button
        onClick={() => onNavigate(AppMode.SEND)}
        className="group relative overflow-hidden rounded-2xl glass-panel p-10 text-left transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="absolute top-0 right-0 p-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/30"></div>
        
        <div className="relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg mb-6 group-hover:rotate-6 transition-transform">
            <UploadCloud className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Send</h2>
          <p className="text-gray-300 leading-relaxed">
            Upload files and get a secure pickup code. Retrieve them anywhere, anytime.
          </p>
        </div>
      </button>

      <button
        onClick={() => onNavigate(AppMode.RECEIVE)}
        className="group relative overflow-hidden rounded-2xl glass-panel p-10 text-left transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <div className="absolute top-0 right-0 p-32 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-purple-500/30"></div>

        <div className="relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg mb-6 group-hover:-rotate-6 transition-transform">
            <DownloadCloud className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Receive</h2>
          <p className="text-gray-300 leading-relaxed">
            Have a code? Enter it here to instantly access and download your files.
          </p>
        </div>
      </button>
    </div>
  );
};