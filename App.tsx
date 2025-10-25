
import React, { useState, useRef, useEffect } from 'react';
import type { Message, GroundingChunk, ChatSession } from './types';
import { sendMessageStream } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';

const App: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isImageGeneration, setIsImageGeneration] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Load sessions from localStorage on initial render
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem('chatSessions');
      if (storedSessions) {
        setChatSessions(JSON.parse(storedSessions));
      }
      const storedActiveId = localStorage.getItem('activeSessionId');
      if (storedActiveId) {
        setActiveSessionId(storedActiveId);
      } else if (storedSessions) {
        setActiveSessionId(JSON.parse(storedSessions)[0]?.id || null);
      } else {
        // If no sessions, create a new one
        handleNewChat();
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      handleNewChat(); // Start fresh if storage is corrupt
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    } else {
      localStorage.removeItem('chatSessions');
    }
    if (activeSessionId) {
      localStorage.setItem('activeSessionId', activeSessionId);
    } else {
      localStorage.removeItem('activeSessionId');
    }
  }, [chatSessions, activeSessionId]);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatSessions, activeSessionId]);
  
  const handleNewChat = () => {
    setIsLoading(false);
    setInput('');
    setVideoFile(null);
    setImageFile(null);
    setIsImageGeneration(false);
    setIsThinkingMode(false);
    
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [
        {
          id: 'initial-ai-message-reset',
          sender: 'ai',
          text: "Hello! I am Autonex AI. How can I help? / नमस्ते! मैं ऑटोनिक्स एआई हूं। मैं आपकी क्या मदद कर सकता हूँ?",
        },
      ],
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setIsLoading(false);
    setInput('');
    setVideoFile(null);
    setImageFile(null);
    setIsImageGeneration(false);
    setIsThinkingMode(false);
  };
  
  const handleClearHistory = () => {
    setShowClearConfirm(true);
  };

  const confirmClearHistory = () => {
    localStorage.removeItem('chatSessions');
    localStorage.removeItem('activeSessionId');
    setChatSessions([]);
    setActiveSessionId(null);
    setShowClearConfirm(false);
    handleNewChat(); // Start a fresh session
  };


  const handleSendMessage = async () => {
    if ((!input.trim() && !videoFile && !imageFile) || isLoading || !activeSessionId) return;

    let videoUrl: string | undefined;
    if (videoFile) {
        videoUrl = URL.createObjectURL(videoFile);
    }
    let imageUrl: string | undefined;
    if (imageFile) {
        imageUrl = URL.createObjectURL(imageFile);
    }

    const userMessageText = isImageGeneration
      ? `Generate an image: "${input}" (Aspect Ratio: ${aspectRatio})`
      : isThinkingMode
      ? `Complex query: "${input}"`
      : input;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMessageText,
      videoUrl,
      imageUrl,
    };

    const aiMessagePlaceholder: Message = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: '',
      sources: [],
    };

    setChatSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === activeSessionId) {
          // If this is the first user message, update the title
          const isFirstUserMessage = session.messages.filter(m => m.sender === 'user').length === 0;
          const newTitle = isFirstUserMessage && input.trim() ? input.trim().substring(0, 30) : session.title;
          
          return {
            ...session,
            title: newTitle,
            messages: [...session.messages, userMessage, aiMessagePlaceholder],
          };
        }
        return session;
      })
    );
    
    const currentVideoFile = videoFile;
    const currentImageFile = imageFile;
    const currentInput = input;
    const currentIsImageGeneration = isImageGeneration;
    const currentAspectRatio = aspectRatio;
    const currentIsThinkingMode = isThinkingMode;

    setInput('');
    setVideoFile(null);
    setImageFile(null);
    setIsImageGeneration(false);
    setIsThinkingMode(false);
    setIsLoading(true);

    try {
      const stream = sendMessageStream(
        currentInput,
        activeSessionId,
        currentVideoFile,
        currentImageFile,
        currentIsImageGeneration,
        currentAspectRatio,
        currentIsThinkingMode,
      );
      let fullResponse = '';
      let finalSources: GroundingChunk[] | undefined = undefined;
      let finalEditedImageUrl: string | undefined = undefined;
      let finalGeneratedImageUrl: string | undefined = undefined;


      for await (const part of stream) {
        if (part.text) {
          fullResponse += part.text;
        }
        if (part.sources) {
          finalSources = part.sources;
        }
        if (part.editedImageUrl) {
          finalEditedImageUrl = part.editedImageUrl;
        }
        if (part.generatedImageUrl) {
          finalGeneratedImageUrl = part.generatedImageUrl;
        }
        
        setChatSessions(prevSessions =>
          prevSessions.map(session =>
            session.id === activeSessionId
              ? {
                  ...session,
                  messages: session.messages.map(msg =>
                    msg.id === aiMessagePlaceholder.id
                      ? { ...msg, text: fullResponse, sources: finalSources, editedImageUrl: finalEditedImageUrl, generatedImageUrl: finalGeneratedImageUrl }
                      : msg
                  ),
                }
              : session
          )
        );
      }
    } catch (error) {
      console.error('Failed to get response:', error);
      setChatSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === activeSessionId
            ? {
                ...session,
                messages: session.messages.map(msg =>
                  msg.id === aiMessagePlaceholder.id
                    ? { ...msg, text: 'Sorry, I encountered an error.' }
                    : msg
                ),
              }
            : session
        )
      );
    } finally {
      setIsLoading(false);
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    }
  };

  const activeMessages = chatSessions.find(s => s.id === activeSessionId)?.messages || [];
  const isDark = theme === 'dark';

  return (
    <div className={`relative flex h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <Sidebar 
        onNewChat={handleNewChat} 
        sessions={chatSessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onClearHistory={handleClearHistory}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
      <div className="flex flex-col flex-1">
        <header className={`md:hidden flex items-center justify-between p-4 border-b transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-700/50' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center mr-3">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                      <linearGradient id="logo-gradient-mobile" x1="21" y1="3" x2="3" y2="21" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#6EE7B7"/>
                          <stop offset="1" stopColor="#10B981"/>
                      </linearGradient>
                  </defs>
                  <path d="M19.07,5.93 C17.2,4.06 14.68,3 12,3 C7.03,3 3,7.03 3,12 C3,16.97 7.03,21 12,21 C16.1,21 19.68,18.47 21,15" fill="none" stroke="url(#logo-gradient-mobile)" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M17.2,10.2C16.2,9.4 14.2,9.2 12.5,9.8C10.8,10.4 9.8,12 10.4,13.6C11,15.2 13,16 14.5,15.2" fill={isDark ? "#374151" : "#E5E7EB"}/>
                  <path d="M16,7C14.5,6.5 12,7.5 11,9.5" stroke={isDark ? "white" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Autonex AI</h1>
          </div>
          <button onClick={handleNewChat} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`} aria-label="New Chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {activeMessages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} theme={theme} />
            ))}
             <div ref={chatEndRef} />
          </div>
        </main>
        
        <ChatInput 
          input={input}
          setInput={setInput}
          sendMessage={handleSendMessage}
          isLoading={isLoading}
          videoFile={videoFile}
          setVideoFile={setVideoFile}
          imageFile={imageFile}
          setImageFile={setImageFile}
          isImageGeneration={isImageGeneration}
          setIsImageGeneration={setIsImageGeneration}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          isThinkingMode={isThinkingMode}
          setIsThinkingMode={setIsThinkingMode}
          theme={theme}
        />
      </div>

      {showClearConfirm && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`rounded-xl p-8 shadow-2xl border max-w-sm text-center transition-colors duration-300 ${isDark ? 'bg-gray-800 border-gray-700/50' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Clear All History?</h2>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>This will permanently delete all your chat sessions. This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              >
                Cancel
              </button>
              <button 
                onClick={confirmClearHistory}
                className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
