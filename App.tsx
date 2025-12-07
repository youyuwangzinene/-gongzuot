import React, { useState, useEffect } from 'react';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';
import Gallery from './components/Gallery';
import { GeneratedItem, MediaType } from './types';
import { SparklesIcon, PhotoIcon, FilmIcon, HistoryIcon } from './components/Icons';

function App() {
  const [activeTab, setActiveTab] = useState<MediaType>(MediaType.IMAGE);
  // Initialize from local storage if available
  const [history, setHistory] = useState<GeneratedItem[]>(() => {
    try {
      const saved = localStorage.getItem('dreamina-history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  });

  // Save to local storage whenever history changes
  useEffect(() => {
    try {
      localStorage.setItem('dreamina-history', JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  }, [history]);

  const handleSuccess = (item: GeneratedItem) => {
    setHistory((prev) => [item, ...prev]);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm("Delete this creation?")) {
      setHistory((prev) => prev.filter(item => item.id !== id));
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire history? This cannot be undone.")) {
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900/50 border-r border-slate-800 flex-shrink-0 flex flex-col z-20">
        <div className="p-6 border-b border-slate-800">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-purple-400" />
                Dreamina
            </h1>
            <p className="text-xs text-slate-500 mt-1">AI Creative Studio</p>
        </div>

        <nav className="p-4 space-y-2 flex-1">
            <button
                onClick={() => setActiveTab(MediaType.IMAGE)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${activeTab === MediaType.IMAGE 
                    ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
                <PhotoIcon className="w-5 h-5" />
                <span className="font-medium">Image Generation</span>
            </button>
            <button
                onClick={() => setActiveTab(MediaType.VIDEO)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${activeTab === MediaType.VIDEO 
                    ? 'bg-pink-600/10 text-pink-400 border border-pink-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
                <FilmIcon className="w-5 h-5" />
                <span className="font-medium">Video Generation</span>
            </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 font-medium mb-1">SESSION STATS</p>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">Creations</span>
                    <span className="text-white font-bold">{history.length}</span>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen relative scroll-smooth">
        {/* Background gradient effects */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
        </div>

        <div className="p-6 md:p-8 max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Column: Creator Studio */}
            <div className="xl:col-span-5 order-2 xl:order-1">
                <div className="sticky top-6 z-10">
                    {activeTab === MediaType.IMAGE ? (
                        <ImageStudio onGenerateSuccess={handleSuccess} />
                    ) : (
                        <VideoStudio onGenerateSuccess={handleSuccess} />
                    )}
                </div>
            </div>

            {/* Right Column: Gallery/History */}
            <div className="xl:col-span-7 order-1 xl:order-2">
                <div className="flex items-center justify-between mb-6 bg-slate-900/30 backdrop-blur-md p-4 rounded-xl border border-slate-800/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <HistoryIcon className="w-5 h-5 text-slate-400" />
                        Recent Creations
                    </h2>
                    {history.length > 0 && (
                        <button 
                            onClick={clearHistory}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-900/20 border border-transparent hover:border-red-900/50"
                        >
                            Clear History
                        </button>
                    )}
                </div>
                
                <Gallery items={history} onDelete={handleDeleteItem} onSaveNewItem={handleSuccess} />
            </div>
        </div>
      </main>
    </div>
  );
}

export default App;