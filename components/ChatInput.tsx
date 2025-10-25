
import React, { useRef } from 'react';
import PaperclipIcon from './icons/PaperclipIcon';
import ImageIcon from './icons/ImageIcon';
import ThinkingIcon from './icons/ThinkingIcon';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  sendMessage: () => void;
  isLoading: boolean;
  videoFile: File | null;
  setVideoFile: (file: File | null) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  isImageGeneration: boolean;
  setIsImageGeneration: (isGenerating: boolean) => void;
  aspectRatio: '16:9' | '9:16';
  setAspectRatio: (ratio: '16:9' | '9:16') => void;
  isThinkingMode: boolean;
  setIsThinkingMode: (isThinking: boolean) => void;
  theme: 'light' | 'dark';
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  sendMessage,
  isLoading,
  videoFile,
  setVideoFile,
  imageFile,
  setImageFile,
  isImageGeneration,
  setIsImageGeneration,
  aspectRatio,
  setAspectRatio,
  isThinkingMode,
  setIsThinkingMode,
  theme,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (input.trim() || videoFile || imageFile)) {
        sendMessage();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setImageFile(null);
      } else if (file.type.startsWith('image/')) {
        setImageFile(file);
        setVideoFile(null);
      }
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };
  
  const attachedFile = videoFile || imageFile;

  return (
    <div className={`border-t transition-colors duration-300 ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-50/50 border-gray-200'}`}>
       {attachedFile && (
        <div className="max-w-4xl mx-auto px-4 pt-2">
          <div className={`relative inline-block p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-200/50'}`}>
            {videoFile ? (
              <video src={URL.createObjectURL(videoFile)} className="max-h-24 rounded" muted />
            ) : imageFile ? (
              <img src={URL.createObjectURL(imageFile)} alt="Image preview" className="max-h-24 rounded" />
            ) : null}
            <div className="absolute -top-2 -right-2">
              <button 
                onClick={() => { setVideoFile(null); setImageFile(null); }}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800' : 'bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
                aria-label="Remove file"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
        </div>
      )}
      {isImageGeneration && (
        <div className="max-w-4xl mx-auto px-4 pt-3 flex items-center justify-center gap-2">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Aspect Ratio:</span>
          <button
            onClick={() => setAspectRatio('16:9')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              aspectRatio === '16:9' ? 'bg-blue-600 text-white' : (isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')
            }`}
          >
            Landscape (16:9)
          </button>
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              aspectRatio === '9:16' ? 'bg-blue-600 text-white' : (isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')
            }`}
          >
            Portrait (9:16)
          </button>
        </div>
      )}
      <div className="p-4">
        <div className="relative max-w-4xl mx-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*,image/*"
            className="hidden"
            disabled={isLoading}
          />
          <button
            onClick={handleAttachClick}
            disabled={isLoading || isImageGeneration || isThinkingMode}
            className={`absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full disabled:opacity-50 transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
            aria-label="Attach file"
          >
            <PaperclipIcon className="w-5 h-5" />
          </button>
           <button
            onClick={() => setIsImageGeneration(!isImageGeneration)}
            disabled={isLoading || !!attachedFile || isThinkingMode}
            className={`absolute left-12 top-1/2 -translate-y-1/2 p-2 rounded-full disabled:opacity-50 transition-colors ${
              isImageGeneration 
                ? 'text-blue-500 ' + (isDark ? 'bg-gray-700' : 'bg-gray-200')
                : (isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200')
            }`}
            aria-label="Toggle Image Generation"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsThinkingMode(!isThinkingMode)}
            disabled={isLoading || !!attachedFile || isImageGeneration}
            className={`absolute left-21 top-1/2 -translate-y-1/2 p-2 rounded-full disabled:opacity-50 transition-colors ${
              isThinkingMode 
                ? 'text-purple-500 ' + (isDark ? 'bg-gray-700' : 'bg-gray-200')
                : (isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200')
            }`}
            aria-label="Toggle Thinking Mode"
          >
            <ThinkingIcon className="w-5 h-5" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isImageGeneration 
                ? "Describe the image you want to create..." 
                : isThinkingMode
                ? "Ask a complex question..."
                : attachedFile 
                ? "Describe your request for the attached file..." 
                : "Ask Autonex AI anything... / कुछ भी पूछें..."
            }
            className={`w-full rounded-lg py-3 pl-32 pr-16 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow ${isDark ? 'bg-gray-700 text-gray-200 placeholder:text-gray-400' : 'bg-white text-gray-900 placeholder:text-gray-500'}`}
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || (!input.trim() && !attachedFile)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 text-white disabled:cursor-not-allowed hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ${isDark ? 'disabled:bg-gray-600 focus:ring-offset-gray-800' : 'disabled:bg-gray-300 focus:ring-offset-gray-100'}`}
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
