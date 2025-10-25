
import React from 'react';
import HistoryIcon from './icons/HistoryIcon';
import TrashIcon from './icons/TrashIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import LogoutIcon from './icons/LogoutIcon';
import XIcon from './icons/XIcon';
import type { ChatSession } from '../types';
import AutomateIcon from './icons/AutomateIcon';
import CreateIcon from './icons/CreateIcon';
import AnalyzeIcon from './icons/AnalyzeIcon';
import AssistIcon from './icons/AssistIcon';
import InfoIcon from './icons/InfoIcon';

interface SidebarProps {
  onNewChat: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onClearHistory: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  onShowAbout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onNewChat, 
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onClearHistory,
  theme,
  onToggleTheme,
  onLogout,
  isOpen,
  onClose,
  onShowAbout,
}) => {
  const isDark = theme === 'dark';

  const handleSelect = (id: string) => {
    onSelectSession(id);
    onClose();
  };

  const handleNewChat = () => {
    onNewChat();
    onClose();
  };

  const handleShowAbout = () => {
    onShowAbout();
    onClose();
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`fixed top-0 left-0 h-full flex flex-col w-64 p-6 transition-transform duration-300 ease-in-out z-40 md:relative md:translate-x-0 ${isDark ? 'bg-gray-900 border-r border-gray-700/50' : 'bg-white border-r border-gray-200'} ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button 
          onClick={onClose} 
          className={`absolute top-4 right-4 md:hidden p-2 rounded-full ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
          aria-label="Close menu"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="logo-gradient" x1="21" y1="3" x2="3" y2="21" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#6EE7B7"/>
                        <stop offset="1" stopColor="#10B981"/>
                    </linearGradient>
                </defs>
                <path d="M19.07,5.93 C17.2,4.06 14.68,3 12,3 C7.03,3 3,7.03 3,12 C3,16.97 7.03,21 12,21 C16.1,21 19.68,18.47 21,15" fill="none" stroke="url(#logo-gradient)" strokeWidth="3" strokeLinecap="round"/>
                <path d="M17.2,10.2C16.2,9.4 14.2,9.2 12.5,9.8C10.8,10.4 9.8,12 10.4,13.6C11,15.2 13,16 14.5,15.2" fill={isDark ? "#374151" : "#E5E7EB"}/>
                <path d="M16,7C14.5,6.5 12,7.5 11,9.5" stroke={isDark ? "white" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Autonex AI</h1>
        </div>
        
        <div className="mt-8">
          <h3 className={`px-3 text-sm font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Capabilities
          </h3>
          <div className="space-y-1">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <AutomateIcon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Automate</span>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <CreateIcon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Create</span>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <AnalyzeIcon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Analyze</span>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <AssistIcon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Assist</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleNewChat}
          className={`mt-6 w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-colors duration-200 ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          <span className="font-semibold">New Chat</span>
        </button>
        
        <nav className="flex-1 mt-6 pt-6 border-t border-gray-700/50 overflow-y-auto">
          <div className={`flex items-center gap-2 px-2 text-sm font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <HistoryIcon className="w-5 h-5" />
            <h2>History</h2>
          </div>
          <ul className="space-y-1">
            {sessions.map((session) => (
              <li key={session.id}>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handleSelect(session.id); }}
                  className={`flex items-start p-2 rounded-lg text-sm transition-colors duration-200 w-full text-left truncate ${
                    session.id === activeSessionId 
                      ? (isDark ? 'bg-gray-800 font-semibold text-white' : 'bg-gray-100 font-semibold text-gray-900')
                      : (isDark ? 'text-gray-300 hover:bg-gray-800/50' : 'text-gray-600 hover:bg-gray-100/50')
                  }`}
                  title={session.title}
                >
                  {session.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700/50' : 'border-gray-200'} space-y-2`}>
          <div className="grid grid-cols-3 gap-2">
              <button 
                  onClick={onLogout}
                  className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm transition-colors duration-200 ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'}`}
                  title="Logout"
              >
                  <LogoutIcon className="w-5 h-5" />
              </button>
              <button
                  onClick={handleShowAbout}
                  className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm transition-colors duration-200 ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'}`}
                  title="About"
              >
                  <InfoIcon className="w-5 h-5" />
              </button>
              <button
                  onClick={onToggleTheme}
                  className={`flex items-center justify-center p-2 rounded-lg text-sm transition-colors duration-200 ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'}`}
                  aria-label="Toggle theme"
                  title="Toggle Theme"
              >
                  {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
          </div>
          <button 
              onClick={onClearHistory}
              className={`w-full flex items-center justify-center gap-2 p-2 rounded-lg text-sm transition-colors duration-200 ${isDark ? 'text-gray-400 hover:bg-red-900/50 hover:text-red-300' : 'text-gray-500 hover:bg-red-50 hover:text-red-600'}`}
          >
              <TrashIcon className="w-4 h-4" />
              <span>Clear History</span>
          </button>
        </div>
        
        <div className={`mt-4 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="text-sm font-semibold">Autonex Agency</p>
          <p className="text-xs">“Smarter Automation. Better Results.”</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
