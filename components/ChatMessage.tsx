
import React, { useState } from 'react';
import type { Message } from '../types';
import SpeakerIcon from './icons/SpeakerIcon';
import SpeakerWaveIcon from './icons/SpeakerWaveIcon';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';
import AutonexIcon from './icons/AutonexIcon';
import DownloadIcon from './icons/DownloadIcon';
import MaximizeIcon from './icons/MaximizeIcon';

interface ChatMessageProps {
  message: Message;
  theme: 'light' | 'dark';
  onPlayAudio: (messageId: string, text: string) => void;
  isPlayingAudio: boolean;
  isLoadingAudio: boolean;
  onPreview: (url: string, type: 'image' | 'video') => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, theme, onPlayAudio, isPlayingAudio, isLoadingAudio, onPreview }) => {
  const [isCopied, setIsCopied] = useState(false);
  const isAI = message.sender === 'ai';
  const isDark = theme === 'dark';

  const handlePlayClick = () => {
    if (message.text) {
      onPlayAudio(message.id, message.text);
    }
  };

  const handleCopyClick = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  };

  const MediaControls: React.FC<{ url: string; type: 'image' | 'video'; filename: string }> = ({ url, type, filename }) => (
    <div className="absolute bottom-2 right-2 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
      <button
        onClick={() => onPreview(url, type)}
        className={`p-2 rounded-full transition-colors ${isDark ? 'bg-gray-900/60 text-gray-200 hover:bg-gray-800/80 backdrop-blur-sm' : 'bg-white/60 text-gray-700 hover:bg-white/80 backdrop-blur-sm'}`}
        title="Preview"
      >
        <MaximizeIcon className="w-4 h-4" />
      </button>
      <a
        href={url}
        download={filename}
        className={`p-2 rounded-full transition-colors ${isDark ? 'bg-gray-900/60 text-gray-200 hover:bg-gray-800/80 backdrop-blur-sm' : 'bg-white/60 text-gray-700 hover:bg-white/80 backdrop-blur-sm'}`}
        title="Download"
      >
        <DownloadIcon className="w-4 h-4" />
      </a>
    </div>
  );

  return (
    <div className={`flex items-start gap-4 ${isAI ? '' : 'justify-end'}`}>
      {isAI && (
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
          <AutonexIcon isDark={isDark} />
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
            <div className="mb-2 rounded-lg overflow-hidden relative group">
                <video src={message.videoUrl} className="w-full max-h-64" controls/>
                <MediaControls url={message.videoUrl} type="video" filename="autonex-video.mp4" />
            </div>
        )}
        {message.imageUrl && (
            <div className="mb-2 rounded-lg overflow-hidden relative group">
                <img src={message.imageUrl} alt="User upload" className="w-full max-h-64 object-contain" />
                <MediaControls url={message.imageUrl} type="image" filename="uploaded-image.png" />
            </div>
        )}
        {message.editedImageUrl && (
            <div className="mb-2 rounded-lg overflow-hidden relative group">
                <img src={message.editedImageUrl} alt="AI edited image" className="w-full max-h-80 object-contain" />
                <MediaControls url={message.editedImageUrl} type="image" filename="autonex-edited-image.jpg" />
            </div>
        )}
        {message.generatedImageUrl && (
            <div className="mb-2 rounded-lg overflow-hidden relative group">
                <img src={message.generatedImageUrl} alt="AI generated image" className="w-full max-h-96 object-contain" />
                <MediaControls url={message.generatedImageUrl} type="image" filename="autonex-generated-image.jpg" />
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
          <>
            <button
              onClick={handleCopyClick}
              className={`absolute -bottom-3 -left-3 w-7 h-7 flex items-center justify-center rounded-full border transition-all duration-200 ${
                isCopied 
                  ? 'bg-green-500 border-green-400 text-white'
                  : (isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-200')
              }`}
              aria-label={isCopied ? "Copied to clipboard" : "Copy message text"}
              title={isCopied ? "Copied!" : "Copy"}
            >
              {isCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
            </button>
            <button 
              onClick={handlePlayClick} 
              disabled={isLoadingAudio}
              className={`absolute -bottom-3 -right-3 w-7 h-7 flex items-center justify-center rounded-full border transition-all duration-200 disabled:opacity-50 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-200'}`}
              aria-label="Play audio"
              title="Play audio"
            >
              {isLoadingAudio ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : isPlayingAudio ? (
                <SpeakerWaveIcon className="w-4 h-4" />
              ) : (
                <SpeakerIcon className="w-4 h-4" />
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
