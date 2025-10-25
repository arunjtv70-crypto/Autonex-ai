
import React from 'react';
import AutomateIcon from './icons/AutomateIcon';
import CreateIcon from './icons/CreateIcon';
import AnalyzeIcon from './icons/AnalyzeIcon';
import AssistIcon from './icons/AssistIcon';

interface AboutPageProps {
  theme: 'light' | 'dark';
  onBackToChat: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ theme, onBackToChat }) => {
  const isDark = theme === 'dark';

  const capabilityCardClasses = `p-6 rounded-xl flex flex-col items-center text-center transition-colors duration-300 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`;
  const iconClasses = `w-8 h-8 mb-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`;
  const titleClasses = `text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`;
  const descriptionClasses = `text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`;
  
  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>About Autonex AI</h1>
                <p className={`mt-2 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    An advanced conversational and automation assistant.
                </p>
            </div>
            <button
                onClick={onBackToChat}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                Back to Chat
            </button>
        </div>

        <div className={`p-8 rounded-xl mb-8 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Our Purpose</h2>
            <p className={`${descriptionClasses} leading-relaxed`}>
                Autonex AI is designed to be a professional AI partner, helping users with intelligent automation, content creation, data analysis, and AI-powered business tools. Developed by <strong>Autonex Agency</strong>, our mission is to deliver smarter automation for better results. We believe in providing a tool that is fast, reliable, professional, and capable of understanding and responding in the user's natural language.
            </p>
        </div>

        <div>
            <h2 className={`text-2xl font-bold mb-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>Core Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={capabilityCardClasses}>
                    <AutomateIcon className={iconClasses} />
                    <h3 className={titleClasses}>Automation</h3>
                    <p className={descriptionClasses}>Design chatbots, streamline workflows, and enhance process automation with intelligent suggestions.</p>
                </div>
                <div className={capabilityCardClasses}>
                    <CreateIcon className={iconClasses} />
                    <h3 className={titleClasses}>Content Creation</h3>
                    <p className={descriptionClasses}>Generate creative and engaging content, including posts, blogs, and marketing messages.</p>
                </div>
                <div className={capabilityCardClasses}>
                    <AnalyzeIcon className={iconClasses} />
                    <h3 className={titleClasses}>Data Analysis</h3>
                    <p className={descriptionClasses}>Understand complex data or text and receive clear, simple explanations and valuable insights.</p>
                </div>
                 <div className={capabilityCardClasses}>
                    <AssistIcon className={iconClasses} />
                    <h3 className={titleClasses}>Assistance</h3>
                    <p className={descriptionClasses}>Solve business challenges and boost daily productivity with smart, AI-powered suggestions.</p>
                </div>
            </div>
        </div>

        <div className={`mt-12 text-center py-6 border-t ${isDark ? 'border-gray-700/50' : 'border-gray-200'}`}>
            <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Developed by Autonex Agency</p>
            <p className={`mt-1 text-md italic ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                “Smarter Automation. Better Results.”
            </p>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
