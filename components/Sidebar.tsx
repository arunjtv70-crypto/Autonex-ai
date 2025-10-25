import React from 'react';
import TrashIcon from './icons/TrashIcon';
import LogoutIcon from './icons/LogoutIcon';
import XIcon from './icons/XIcon';
import type { ChatSession } from '../types';
import SettingsIcon from './icons/SettingsIcon';
import AutonexBrand from './AutonexBrand';

interface SidebarProps {
  onNewChat: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onClearHistory: () => void;
  theme: 'light' | 'dark';
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  onShowSettings: () => void;
}

const capabilities = ['Automate', 'Create', 'Analyze', 'Assist'];

const Sidebar: React.FC<SidebarProps> = ({ 
  onNewChat, 
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onClearHistory,
  theme,
  onLogout,
  isOpen,
  onClose,
  onShowSettings,
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
  
  const handleShowSettings = () => {
    onShowSettings();
    onClose();
  };

  return (
    <>
      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 300ms ease-out forwards;
        }
      `}</style>
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

        <div className="flex items-center mb-6">
          <AutonexBrand className="w-36 h-auto" isDark={isDark} />
        </div>
        
        <div className="mt-8 space-y-2">
            {capabilities.map((capability, index) => (
                <div 
                    key={capability} 
                    className="p-2 rounded-md hover:bg-white/10 transition-colors duration-200 cursor-pointer animate-slide-down"
                    style={{ animationDelay: `${index * 100}ms`, opacity: 0 /* Initial state for animation */ }}
                >
                    <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{capability}</span>
                </div>
            ))}
        </div>

        <button
          onClick={handleNewChat}
          className={`mt-8 w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-colors duration-200 ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          <span className="font-semibold">New Chat</span>
        </button>
        
        <div className="flex-1 mt-6 pt-6 border-t border-gray-700/50 flex flex-col min-h-0">
          <div className="flex justify-between items-center px-2 mb-2">
            <h2 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              History
            </h2>
          </div>
          <nav className="flex-1 overflow-y-auto -mr-4 pr-4">
            <ul className="space-y-1">
              {sessions.map((session) => (
                <li key={session.id}>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handleSelect(session.id); }}
                    className={`block p-2 rounded-lg text-sm transition-colors duration-200 w-full text-left truncate ${
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
        </div>

        <div className={`mt-6 pt-4 border-t ${isDark ? 'border-gray-700/50' : 'border-gray-200'} space-y-2`}>
            <button 
                onClick={handleShowSettings}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <SettingsIcon className="w-5 h-5" />
                <span>Settings</span>
            </button>
            <button 
                onClick={onLogout}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <LogoutIcon className="w-5 h-5" />
                <span>Logout</span>
            </button>
             <button 
                onClick={onClearHistory}
                className={`w-full flex items-center justify-center gap-2 p-2 rounded-lg text-sm transition-colors duration-200 ${isDark ? 'text-gray-400 hover:bg-red-900/50 hover:text-red-300' : 'text-gray-500 hover:bg-red-50 hover:text-red-600'}`}
            >
                <TrashIcon className="w-4 h-4" />
                <span>Clear All Chats</span>
            </button>
        </div>
        
        <div className={`mt-auto pt-4 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="text-sm font-semibold">⚡ Autonex Agency</p>
          <p className="text-xs">“Smarter Automation. Better Results.”</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;