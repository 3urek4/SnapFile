import React, { useState } from 'react';
import { AppMode } from './types';
import { SendView } from './components/SendView';
import { ReceiveView } from './components/ReceiveView';
import { HomeView } from './components/HomeView';
import { Header } from './components/Header';
import { ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);

  const handleBack = () => {
    setMode(AppMode.HOME);
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-4xl mx-auto px-4 py-6 min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 flex flex-col justify-center items-center w-full mt-8 mb-12 relative">
          {mode !== AppMode.HOME && (
            <button 
              onClick={handleBack}
              className="absolute top-0 left-0 text-gray-300 hover:text-white flex items-center gap-2 transition-colors mb-4 z-10"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </button>
          )}

          <div className="w-full transition-all duration-500 ease-in-out">
            {mode === AppMode.HOME && <HomeView onNavigate={setMode} />}
            {mode === AppMode.SEND && <SendView />}
            {mode === AppMode.RECEIVE && <ReceiveView />}
          </div>
        </main>

        <footer className="text-center text-sm text-gray-400 py-4">
          <p>© {new Date().getFullYear()} SnapFile. Secure Transfer.</p>
          <p className="text-xs mt-1 opacity-50">Demo: Files stored in browser memory for testing.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;