import React from 'react';
import type { Message } from '../types';
import SpeakerIcon from './icons/SpeakerIcon';
import SpeakerWaveIcon from './icons/SpeakerWaveIcon';

interface ChatMessageProps {
  message: Message;
  theme: 'light' | 'dark';
  onPlayAudio: (messageId: string, text: string) => void;
  isPlayingAudio: boolean;
  isLoadingAudio: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, theme, onPlayAudio, isPlayingAudio, isLoadingAudio }) => {
  const isAI = message.sender === 'ai';
  const isDark = theme === 'dark';

  const handlePlayClick = () => {
    if (message.text) {
      onPlayAudio(message.id, message.text);
    }
  };

  return (
    <div className={`flex items-start gap-4 ${isAI ? '' : 'justify-end'}`}>
      {isAI && (
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="logo-gradient-avatar" x1="21" y1="3" x2="3" y2="21" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6EE7B7"/>
                    <stop offset="1" stopColor="#10B981"/>
                </linearGradient>
            </defs>
            <path d="M19.07,5.93 C17.2,4.06 14.68,3 12,3 C7.03,3 3,7.03 3,12 C3,16.97 7.03,21 12,21 C16.1,21 19.68,18.47 21,15" fill="none" stroke="url(#logo-gradient-avatar)" strokeWidth="3" strokeLinecap="round"/>
            <path d="M17.2,10.2C16.2,9.4 14.2,9.2 12.5,9.8C10.8,10.4 9.8,12 10.4,13.6C11,15.2 13,16 14.5,15.2" fill={isDark ? "#374151" : "#E5E7EB"}/>
            <path d="M16,7C14.5,6.5 12,7.5 11,9.5" stroke={isDark ? "white" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      )}
      <div
        className={`relative max-w-xl p-4 rounded-xl shadow-md transition-colors duration-300 ${
          isAI
            ? (isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800') + ' rounded-tl-none'
            : 'bg-blue-600 text-white rounded-br-none'
        }`}
      >
        {message.videoUrl && (
            <div className="mb-2 rounded-lg overflow-hidden">
                <video src={message.videoUrl} className="w-full max-h-64" controls/>
            </div>
        )}
        {message.imageUrl && (
            <div className="mb-2 rounded-lg overflow-hidden">
                <img src={message.imageUrl} alt="User upload" className="w-full max-h-64 object-contain" />
            </div>
        )}
        {message.editedImageUrl && (
            <div className="mb-2 rounded-lg overflow-hidden">
                <img src={message.editedImageUrl} alt="AI edited image" className="w-full max-h-80 object-contain" />
            </div>
        )}
        {message.generatedImageUrl && (
            <div className="mb-2 rounded-lg overflow-hidden">
                <img src={message.generatedImageUrl} alt="AI generated image" className="w-full max-h-96 object-contain" />
            </div>
        )}
        <div className="text-sm leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br />') }}></div>
        {isAI && message.sources && message.sources.length > 0 && (
          <div className={`mt-4 pt-3 border-t transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xs font-semibold mb-2 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sources</h3>
            <ol className="list-decimal list-inside space-y-1">
              {message.sources.filter(source => source.web?.uri && source.web?.title).map((source, index) => (
                <li key={index} className="text-xs truncate">
                  <a
                    href={source.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                    title={source.web.title}
                  >
                    {source.web.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}
        {isAI && message.text && (
          <button 
            onClick={handlePlayClick} 
            disabled={isLoadingAudio}
            className={`absolute -bottom-3 -right-3 w-7 h-7 flex items-center justify-center rounded-full border transition-all duration-200 disabled:opacity-50 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-200'}`}
            aria-label="Play audio"
          >
            {isLoadingAudio ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : isPlayingAudio ? (
              <SpeakerWaveIcon className="w-4 h-4" />
            ) : (
              <SpeakerIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;