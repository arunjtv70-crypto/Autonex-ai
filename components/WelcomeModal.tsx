import React from 'react';
import AutonexBrand from './AutonexBrand';
import CreateIcon from './icons/CreateIcon';
import PaperclipIcon from './icons/PaperclipIcon';
import HistoryIcon from './icons/HistoryIcon';
import SettingsIcon from './icons/SettingsIcon';

interface WelcomeModalProps {
  theme: 'light' | 'dark';
  onClose: () => void;
}

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  isDark: boolean;
}> = ({ icon, title, description, isDark }) => (
  <div className={`flex items-start gap-4 p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'}`}>
    <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
      {icon}
    </div>
    <div>
      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`} dangerouslySetInnerHTML={{ __html: description }}></p>
    </div>
  </div>
);


const WelcomeModal: React.FC<WelcomeModalProps> = ({ theme, onClose }) => {
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 300ms ease-out forwards;
        }
      `}</style>
      <div className={`rounded-2xl shadow-2xl border max-w-2xl w-full transition-colors duration-300 animate-fade-in-scale ${isDark ? 'bg-gray-900 border-gray-700/50' : 'bg-white border-gray-200'}`}>
        <div className={`p-6 md:p-8 border-b ${isDark ? 'border-gray-700/50' : 'border-gray-200'}`}>
            <AutonexBrand className="w-40 h-auto mx-auto" isDark={isDark} />
            <h2 className={`text-2xl md:text-3xl font-bold mt-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome to Autonex AI</h2>
            <p className={`text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Here’s a quick tour of your new AI assistant.</p>
        </div>
        
        <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            <FeatureCard
                isDark={isDark}
                icon={<CreateIcon className="w-5 h-5" />}
                title="Core Capabilities"
                description="Use the quick-access capabilities like <b>Automate</b>, <b>Create</b>, <b>Analyze</b>, and <b>Assist</b> to guide the AI on specific tasks."
            />
            <FeatureCard
                isDark={isDark}
                icon={<HistoryIcon className="w-5 h-5" />}
                title="Your Conversation Hub"
                description="Interact with Autonex AI in the main chat window. Your conversation <b>History</b> is saved for easy access."
            />
            <FeatureCard
                isDark={isDark}
                icon={<PaperclipIcon className="w-5 h-5" />}
                title="Advanced Input Tools"
                description="Enhance your prompts by <b>attaching files</b>, generating images, enabling deep <b>'Thinking Mode'</b> for complex queries, or using your voice."
            />
             <FeatureCard
                isDark={isDark}
                icon={<SettingsIcon className="w-5 h-5" />}
                title="Personalization & Settings"
                description="Click <b>Settings</b> to customize the theme, manage the AI's memory, and control chat history preferences."
            />
          </div>
        </div>

        <div className={`p-6 md:p-8 border-t ${isDark ? 'border-gray-700/50' : 'border-gray-200'}`}>
            <button
                onClick={onClose}
                className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Let's Get Started
            </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
