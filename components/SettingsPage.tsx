import React from 'react';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import BrainIcon from './icons/BrainIcon';
import TrashIcon from './icons/TrashIcon';
import HistoryIcon from './icons/HistoryIcon';


interface SettingsPageProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onBackToChat: () => void;
  isMemoryOn: boolean;
  onToggleMemory: () => void;
  onClearMemory: () => void;
  isChatHistoryOn: boolean;
  onToggleChatHistory: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  theme, 
  onToggleTheme, 
  onBackToChat,
  isMemoryOn,
  onToggleMemory,
  onClearMemory,
  isChatHistoryOn,
  onToggleChatHistory,
}) => {
  const isDark = theme === 'dark';
  
  const cardClasses = `p-6 rounded-xl transition-colors duration-300 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`;
  const titleClasses = `text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`;
  const descriptionClasses = `text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`;
  
  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
                <p className={`mt-2 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage your preferences and learn about Autonex AI.
                </p>
            </div>
            <button
                onClick={onBackToChat}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                Back
            </button>
        </div>

        <div className="space-y-8">
            <div className={cardClasses}>
                <h2 className={titleClasses}>Theme</h2>
                <div className="flex items-center justify-between">
                    <p className={descriptionClasses}>Switch between light and dark mode.</p>
                    <button
                        onClick={onToggleTheme}
                        className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'bg-gray-700 focus:ring-offset-gray-800 focus:ring-blue-500' : 'bg-gray-200 focus:ring-offset-gray-100 focus:ring-blue-500'}`}
                    >
                        <span className="sr-only">Toggle Theme</span>
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center ${isDark ? 'translate-x-7' : 'translate-x-1'}`}>
                           {isDark ? <MoonIcon className="h-4 w-4 text-gray-700" /> : <SunIcon className="h-4 w-4 text-gray-700" />}
                        </span>
                    </button>
                </div>
            </div>

            <div>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Personalization</h2>
              <div className="space-y-6">
                <div className={cardClasses}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h3 className={`${titleClasses} mb-1 flex items-center gap-2`}><BrainIcon className="w-5 h-5"/> Reference Saved Memories</h3>
                            <p className={`${descriptionClasses} leading-relaxed`}>
                                Allow Autonex AI to save and recall user information such as your name, goals, and preferences. Saved memories are automatically used to personalize future responses and make conversations feel more natural.
                            </p>
                        </div>
                        <button
                            onClick={onToggleMemory}
                            className={`relative flex-shrink-0 inline-flex items-center h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'focus:ring-offset-gray-800 focus:ring-emerald-500' : 'focus:ring-offset-gray-100 focus:ring-emerald-500'} ${isMemoryOn ? 'bg-emerald-500' : (isDark ? 'bg-gray-600' : 'bg-gray-300')}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${isMemoryOn ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <div className={`pt-4 mt-4 border-t ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                        <button
                            onClick={onClearMemory}
                            className={`w-full flex items-center justify-center gap-2 p-2 rounded-lg text-sm transition-colors duration-200 ${isDark ? 'text-gray-400 hover:bg-red-900/50 hover:text-red-300' : 'text-gray-500 hover:bg-red-50 hover:text-red-600'}`}
                        >
                            <TrashIcon className="w-4 h-4" />
                            <span>Clear Memory</span>
                        </button>
                    </div>
                </div>
                 <div className={cardClasses}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h3 className={`${titleClasses} mb-1 flex items-center gap-2`}><HistoryIcon className="w-5 h-5"/> Reference Chat History</h3>
                            <p className={`${descriptionClasses} leading-relaxed`}>
                                Allow Autonex AI to access recent conversation context to provide smoother, more relevant replies. It uses past messages within the same or recent sessions to maintain continuity and remember what was previously discussed.
                            </p>
                        </div>
                        <button
                            onClick={onToggleChatHistory}
                            className={`relative flex-shrink-0 inline-flex items-center h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'focus:ring-offset-gray-800 focus:ring-emerald-500' : 'focus:ring-offset-gray-100 focus:ring-emerald-500'} ${isChatHistoryOn ? 'bg-emerald-500' : (isDark ? 'bg-gray-600' : 'bg-gray-300')}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${isChatHistoryOn ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
              </div>
            </div>

            <div className={cardClasses}>
                <h2 className={titleClasses}>About Autonex AI</h2>
                <p className={`${descriptionClasses} leading-relaxed`}>
                    Autonex AI is a professional AI partner designed to help users with intelligent automation, content creation, data analysis, and AI-powered business tools. Developed by <strong>Autonex Agency</strong>, our mission is to deliver smarter automation for better results.
                </p>
                <p className={`${descriptionClasses} leading-relaxed mt-2`}>
                    App Version: 1.0.0
                </p>
            </div>
        </div>

        <div className={`mt-12 text-center py-6 border-t ${isDark ? 'border-gray-700/50' : 'border-gray-200'}`}>
            <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>⚡ Autonex Agency</p>
            <p className={`mt-1 text-md italic ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                “Smarter Automation. Better Results.”
            </p>
        </div>
      </div>
    </main>
  );
};

export default SettingsPage;