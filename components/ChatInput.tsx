import React, { useRef, useState, useEffect } from 'react';
import PaperclipIcon from './icons/PaperclipIcon';
import ImageIcon from './icons/ImageIcon';
import ThinkingIcon from './icons/ThinkingIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import StopCircleIcon from './icons/StopCircleIcon';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';
import VoiceAgentIcon from './icons/VoiceAgentIcon';
import SoundWaveIcon from './icons/SoundWaveIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';


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
  isRecording: boolean;
  isTranscribing: boolean;
  onToggleRecording: () => void;
  isVoiceAgentMode: boolean;
  onToggleVoiceAgentMode: () => void;
  voiceAgentStatus: string;
}

const VoiceStatusIndicator: React.FC<{ status: string; isDark: boolean }> = ({ status, isDark }) => {
  let icon: React.ReactNode;
  let text: string;
  let colorClasses: string;

  switch (status) {
    case 'connecting':
      icon = <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>;
      text = 'Initializing...';
      colorClasses = isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600';
      break;
    case 'speaking':
      icon = <SoundWaveIcon className="w-4 h-4" />;
      text = 'Speaking...';
      colorClasses = isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700';
      break;
    case 'error':
      icon = <AlertTriangleIcon className="w-4 h-4" />;
      text = 'Error';
      colorClasses = isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700';
      break;
    case 'listening':
    default:
      icon = (
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      );
      text = 'Listening...';
      colorClasses = isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700';
      break;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-3 flex items-center justify-center">
      <div className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors duration-300 ${colorClasses}`}>
        {icon}
        <span className="font-medium">{text}</span>
      </div>
    </div>
  );
};

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
  isRecording,
  isTranscribing,
  onToggleRecording,
  isVoiceAgentMode,
  onToggleVoiceAgentMode,
  voiceAgentStatus,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPromptCopied, setIsPromptCopied] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


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
      setIsToolsMenuOpen(false);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleCopyPrompt = () => {
    if (input) {
      navigator.clipboard.writeText(input).then(() => {
        setIsPromptCopied(true);
        setTimeout(() => setIsPromptCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy prompt: ', err);
      });
    }
  };

  const attachedFile = videoFile || imageFile;

  const activeModeClass = isImageGeneration ? 'border-blue-500/50 bg-blue-900/10' :
                          isThinkingMode ? 'border-purple-500/50 bg-purple-900/10' :
                          isVoiceAgentMode ? 'border-green-500/50 bg-green-900/10' :
                          isDark ? 'border-transparent' : 'border-transparent';
  
  const darkActiveModeClass = isImageGeneration ? 'dark:bg-blue-900/20' :
                              isThinkingMode ? 'dark:bg-purple-900/20' :
                              isVoiceAgentMode ? 'dark:bg-green-900/20' :
                              '';
  
  const isInputDisabled = isLoading || isRecording || isTranscribing || isVoiceAgentMode;

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
            title="Landscape (16:9)"
            className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors ${
              aspectRatio === '16:9' ? 'bg-blue-600 text-white' : (isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="12" rx="2" ry="2"></rect></svg>
            <span>16:9</span>
          </button>
          <button
            onClick={() => setAspectRatio('9:16')}
            title="Portrait (9:16)"
            className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors ${
              aspectRatio === '9:16' ? 'bg-blue-600 text-white' : (isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="3" width="12" height="18" rx="2" ry="2"></rect></svg>
            <span>9:16</span>
          </button>
          <button
            onClick={handleCopyPrompt}
            disabled={!input.trim()}
            title={isPromptCopied ? "Copied!" : "Copy generation prompt"}
            className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isPromptCopied
                ? 'bg-green-600 text-white'
                : (isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')
            }`}
          >
            {isPromptCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
            <span>{isPromptCopied ? 'Copied' : 'Copy Prompt'}</span>
          </button>
        </div>
      )}
      {isVoiceAgentMode && (
        <VoiceStatusIndicator status={voiceAgentStatus} isDark={isDark} />
      )}
      <div className="p-4">
        <div className={`relative max-w-4xl mx-auto rounded-lg border transition-all duration-300 ${activeModeClass} ${darkActiveModeClass}`}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*,image/*"
            className="hidden"
            disabled={isInputDisabled}
          />

          <div ref={toolsMenuRef} className="absolute left-0 top-1/2 -translate-y-1/2 h-full flex items-center pl-3 z-10">
            <button
                onClick={() => setIsToolsMenuOpen(prev => !prev)}
                disabled={isInputDisabled}
                className={`p-2 rounded-full disabled:opacity-50 transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
                aria-label="More tools"
            >
                <PlusCircleIcon className="w-6 h-6" />
            </button>
            {isToolsMenuOpen && (
                <div className={`absolute bottom-full mb-2 w-64 p-2 rounded-lg shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} space-y-1`}>
                    <button
                      onClick={handleAttachClick}
                      disabled={isInputDisabled || isImageGeneration || isThinkingMode}
                      className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-medium disabled:opacity-50 transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <PaperclipIcon className="w-5 h-5" />
                      <span>Attach File</span>
                    </button>
                    <button
                      onClick={() => { setIsImageGeneration(!isImageGeneration); setIsToolsMenuOpen(false); }}
                      disabled={isInputDisabled || !!attachedFile}
                      className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-medium disabled:opacity-50 transition-colors ${isImageGeneration ? (isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700') : (isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span>Image Generation</span>
                    </button>
                    <button
                      onClick={() => { setIsThinkingMode(!isThinkingMode); setIsToolsMenuOpen(false); }}
                      disabled={isInputDisabled || !!attachedFile}
                      className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-medium disabled:opacity-50 transition-colors ${isThinkingMode ? (isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700') : (isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                    >
                      <ThinkingIcon className="w-5 h-5" />
                      <span>Thinking Mode</span>
                    </button>
                </div>
            )}
        </div>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isVoiceAgentMode
                ? "Voice Agent is active. Start speaking..."
                : isRecording
                ? "Recording... Click to stop."
                : isTranscribing
                ? "Transcribing audio..."
                : isImageGeneration 
                ? "Describe the image you want to create..." 
                : isThinkingMode
                ? "Ask a complex question..."
                : attachedFile 
                ? "Describe your request for the attached file..." 
                : "Ask Autonex AI anything..."
            }
            className={`w-full rounded-lg py-3 pl-16 pr-36 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow bg-transparent ${isDark ? 'text-gray-200 placeholder:text-gray-400' : 'text-gray-900 placeholder:text-gray-500'}`}
            rows={1}
            disabled={isInputDisabled}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <button
                onClick={onToggleRecording}
                disabled={isInputDisabled || !!attachedFile}
                className={`p-2 rounded-full disabled:opacity-50 transition-colors relative ${
                  isRecording 
                    ? 'text-red-500 bg-red-500/20'
                    : (isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200')
                }`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                {isRecording ? <StopCircleIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
                {isRecording && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                {isTranscribing && <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div></div>}
              </button>
              <button
                onClick={onToggleVoiceAgentMode}
                disabled={isLoading || !!attachedFile || isRecording || isTranscribing}
                className={`p-2 rounded-full disabled:opacity-50 transition-colors relative ${
                  isVoiceAgentMode
                    ? 'text-green-500 bg-green-500/20'
                    : (isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200')
                }`}
                aria-label={isVoiceAgentMode ? 'Deactivate Voice Agent' : 'Activate Voice Agent'}
              >
                <VoiceAgentIcon className="w-5 h-5" />
                {isVoiceAgentMode && <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
              </button>
             <button
              onClick={sendMessage}
              disabled={isInputDisabled || (!input.trim() && !attachedFile)}
              className={`p-2 rounded-full bg-blue-600 text-white disabled:cursor-not-allowed hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ${isDark ? 'disabled:bg-gray-600 focus:ring-offset-gray-800' : 'disabled:bg-gray-300 focus:ring-offset-gray-100'}`}
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
    </div>
  );
};

export default ChatInput;