import React from 'react';
import { Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
          <Zap className="text-white" size={24} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SnapFile</h1>
          <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Secure Transfer</p>
        </div>
      </div>
      <div className="hidden sm:block">
        <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-blue-200 backdrop-blur-sm">
           v2.0 Beta
        </span>
      </div>
    </header>
  );
};