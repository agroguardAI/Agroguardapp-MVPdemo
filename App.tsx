import React, { useState, useEffect } from 'react';
import { AppState, AnalysisResult, ImageState, Tab, Language } from './types';
import { analyzePestImage, getQuickTip } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import LoadingSpinner from './components/LoadingSpinner';
import ResultCard from './components/ResultCard';
import LiveAssistant from './components/LiveAssistant';
import ChatInterface from './components/ChatInterface';
import MapFinder from './components/MapFinder';
import ImageEditor from './components/ImageEditor';
import Dashboard from './components/Dashboard';
import { LeafIcon, MicIcon, MessageSquareIcon, MapPinIcon, EditIcon, BrainIcon, UserIcon, SunIcon, MoonIcon } from './components/Icons';
import { translations, languageNames } from './translations';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DIAGNOSE);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imageState, setImageState] = useState<ImageState>({ file: null, previewUrl: null });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quickTip, setQuickTip] = useState<string>('');
  const [useDeepThinking, setUseDeepThinking] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true;
  });

  const t = translations[language];

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    // Fetch fast AI tip on load and when language changes
    getQuickTip(language).then(setQuickTip);
  }, [language]);

  const handleImageSelect = async (file: File) => {
    if (!file) return;
    
    const previewUrl = URL.createObjectURL(file);
    setImageState({ file, previewUrl });
    setAppState(AppState.ANALYZING);
    setError(null);

    try {
      const analysis = await analyzePestImage(file, useDeepThinking, language);
      setResult(analysis);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    if (imageState.previewUrl) {
      URL.revokeObjectURL(imageState.previewUrl);
    }
    setImageState({ file: null, previewUrl: null });
    setResult(null);
    setError(null);
    setAppState(AppState.IDLE);
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.DIAGNOSE:
        return (
          <div className="w-full flex flex-col items-center">
            {appState === AppState.IDLE && (
              <div className="w-full max-w-md space-y-4">
                <ImageUploader onImageSelect={handleImageSelect} lang={language} />
                <div className="flex items-center justify-center gap-2 p-4 bg-white/5 dark:bg-white/5 bg-gray-200 rounded-xl border border-gray-300 dark:border-white/10">
                  <input 
                    type="checkbox" 
                    id="thinking" 
                    checked={useDeepThinking}
                    onChange={(e) => setUseDeepThinking(e.target.checked)}
                    className="w-5 h-5 text-[#667eea] rounded focus:ring-green-500"
                  />
                  <label htmlFor="thinking" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-2 font-medium">
                    <BrainIcon /> {t.deepThinking}
                  </label>
                </div>
              </div>
            )}
            {appState === AppState.ANALYZING && <LoadingSpinner lang={language} />}
            {appState === AppState.SUCCESS && result && imageState.previewUrl && (
              <ResultCard result={result} imageUrl={imageState.previewUrl} onReset={handleReset} lang={language} />
            )}
            {appState === AppState.ERROR && (
              <div className="text-center text-red-500 dark:text-red-300 bg-white/50 dark:bg-transparent p-4 rounded-xl">
                <p className="font-medium">{error}</p>
                <button onClick={handleReset} className="mt-4 underline hover:text-red-700 dark:hover:text-red-200">Try Again</button>
              </div>
            )}
          </div>
        );
      case Tab.CHAT: return <ChatInterface lang={language} />;
      case Tab.LIVE: return <LiveAssistant lang={language} />;
      case Tab.MAPS: return <MapFinder lang={language} />;
      case Tab.EDITOR: return <ImageEditor lang={language} />;
      case Tab.DASHBOARD: return <Dashboard lang={language} />;
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans pb-24 ${
      darkMode 
        ? 'bg-gradient-to-br from-green-900 via-[#1a202c] to-black text-gray-100' 
        : 'bg-gradient-to-br from-green-50 via-white to-green-100 text-gray-900'
    }`}>
      
      {/* Quick Tip Banner (Flash Lite) */}
      <div className="bg-[#667eea]/90 backdrop-blur text-white px-4 py-2 text-xs sm:text-sm text-center shadow-md z-50">
        <span className="font-bold">⚡ {t.quickTip}:</span> {quickTip || "Loading..."}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 dark:bg-white/10 bg-green-600 text-white dark:text-green-400 rounded-2xl border border-white/20 shadow-lg backdrop-blur-sm">
              <LeafIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t.appTitle}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t.appDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors text-gray-700 dark:text-gray-200"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Language Selector */}
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
            >
              {Object.entries(languageNames).map(([code, name]) => (
                <option key={code} value={code} className="text-gray-900">{name}</option>
              ))}
            </select>
          </div>
          
          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex bg-gray-200 dark:bg-white/10 rounded-full p-1 backdrop-blur-md border border-gray-300 dark:border-white/10 overflow-x-auto">
            {[
              { id: Tab.DIAGNOSE, icon: LeafIcon, label: t.diagnose },
              { id: Tab.CHAT, icon: MessageSquareIcon, label: t.chat },
              { id: Tab.LIVE, icon: MicIcon, label: t.live },
              { id: Tab.MAPS, icon: MapPinIcon, label: t.find },
              { id: Tab.EDITOR, icon: EditIcon, label: t.simulate },
              { id: Tab.DASHBOARD, icon: UserIcon, label: t.dashboard },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                  ? 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {/* Main Content */}
        <main className="min-h-[600px]">
          {renderContent()}
        </main>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a202c]/95 backdrop-blur border-t border-gray-200 dark:border-white/10 pb-safe z-50 overflow-x-auto no-scrollbar">
          <div className="flex justify-between p-2 min-w-max gap-2">
            {[
              { id: Tab.DIAGNOSE, icon: LeafIcon, label: t.diagnose },
              { id: Tab.CHAT, icon: MessageSquareIcon, label: t.chat },
              { id: Tab.LIVE, icon: MicIcon, label: t.live },
              { id: Tab.MAPS, icon: MapPinIcon, label: t.find },
              { id: Tab.EDITOR, icon: EditIcon, label: t.simulate },
              { id: Tab.DASHBOARD, icon: UserIcon, label: t.dashboard },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[64px] ${
                  activeTab === tab.id ? 'text-[#667eea]' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <div className={`p-1 rounded-full ${activeTab === tab.id ? 'bg-[#667eea]/10' : ''}`}>
                  <tab.icon />
                </div>
                <span className="text-[10px] font-medium truncate w-full text-center">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;