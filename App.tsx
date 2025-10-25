
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob as GenaiBlob } from "@google/genai";
import type { Message, GroundingChunk, ChatSession } from './types';
import { sendMessageStream, transcribeAudio, generateSpeech, generateChatTitle, clearChatCache } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoginScreen from './components/LoginScreen';
import MenuIcon from './components/icons/MenuIcon';
import SettingsPage from './components/SettingsPage';
import WelcomeModal from './components/WelcomeModal';
import AutonexBrand from './components/AutonexBrand';
import PreviewModal from './components/PreviewModal';

// Helper function to decode Base64
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to encode Uint8Array to Base64
function encodeToBase64(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to create a PCM audio blob for the Gemini API
function createPcmBlob(data: Float32Array): GenaiBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encodeToBase64(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


// Helper function to decode raw PCM audio data into an AudioBuffer
async function decodePcmAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const sampleRate = 24000; // As per Gemini TTS docs
  const numChannels = 1;
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}


const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'settings'>('chat');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [playingAudioMessageId, setPlayingAudioMessageId] = useState<string | null>(null);
  const [isLoadingAudioMessageId, setIsLoadingAudioMessageId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  
  // Personalization State
  const [isMemoryOn, setIsMemoryOn] = useState(true);
  const [isChatHistoryOn, setIsChatHistoryOn] = useState(true);
  
  // Voice Agent State
  const [isVoiceAgentMode, setIsVoiceAgentMode] = useState(false);
  const [voiceAgentStatus, setVoiceAgentStatus] = useState('idle');
  const liveSessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioPlaybackSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');


  // Check login status on initial load
  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedInStatus);
  }, []);
  
  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    const savedMemory = localStorage.getItem('isMemoryOn');
    if (savedMemory) {
      setIsMemoryOn(savedMemory === 'true');
    }
    const savedHistory = localStorage.getItem('isChatHistoryOn');
    if (savedHistory) {
        setIsChatHistoryOn(savedHistory === 'true');
    }
  }, []);

  // Save theme to localStorage and apply to body
  useEffect(() => {
    localStorage.setItem('theme', theme);
    const body = document.body;
    body.classList.remove('dark', 'bg-gray-900', 'text-gray-100', 'bg-gray-50', 'text-gray-800');
    
    if (theme === 'dark') {
      body.classList.add('dark', 'bg-gray-900', 'text-gray-100');
    } else {
      body.classList.add('bg-gray-50', 'text-gray-800');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleMemory = () => {
    const newValue = !isMemoryOn;
    setIsMemoryOn(newValue);
    localStorage.setItem('isMemoryOn', String(newValue));
    clearChatCache();
  };
  
  const handleToggleChatHistory = () => {
    const newValue = !isChatHistoryOn;
    setIsChatHistoryOn(newValue);
    localStorage.setItem('isChatHistoryOn', String(newValue));
    clearChatCache();
  };

  // Load sessions from localStorage on initial render
  useEffect(() => {
    if (!isLoggedIn) return; // Don't load sessions if not logged in
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
  }, [isLoggedIn]);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (!isLoggedIn) return;
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
  }, [chatSessions, activeSessionId, isLoggedIn]);


  useEffect(() => {
    // Automatically scroll to the latest message.
    // Use 'auto' for instant scrolling during streaming, and 'smooth' for a nicer effect on user send.
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: isLoading ? 'auto' : 'smooth' });
    }
  }, [chatSessions, activeSessionId, isLoading]);
  
  const handleNewChat = () => {
    setIsLoading(false);
    setInput('');
    setVideoFile(null);
    setImageFile(null);
    setIsImageGeneration(false);
    setIsThinkingMode(false);
    setView('chat');
    
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [
        {
          id: 'initial-ai-message-reset',
          sender: 'ai',
          text: "Hello! I am Autonex AI. How can I assist you today?",
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
    setView('chat');
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

  const handleLogin = () => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeModal') === 'true';
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };
  
  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenWelcomeModal', 'true');
  };

  const confirmLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setShowLogoutConfirm(false);
    setChatSessions([]); // Clear sessions from state
    setActiveSessionId(null);
    setView('chat');
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], "recording.webm", { type: 'audio/webm' });
          
          setIsTranscribing(true);
          const transcribedText = await transcribeAudio(audioFile);
          setInput(prev => (prev ? prev + ' ' : '') + transcribedText);
          setIsTranscribing(false);

          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Microphone access was denied. Please allow microphone access in your browser settings to use this feature.');
      }
    }
  };

  useEffect(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === 'recording') {
        const stopRecording = () => setIsRecording(false);
        recorder.addEventListener('stop', stopRecording);
        return () => recorder.removeEventListener('stop', stopRecording);
    }
  }, []);

  const handlePlayAudio = async (messageId: string, text: string) => {
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
    }

    if (playingAudioMessageId === messageId) {
        setPlayingAudioMessageId(null);
        return;
    }

    setPlayingAudioMessageId(null);
    setIsLoadingAudioMessageId(messageId);

    try {
        const base64Audio = await generateSpeech(text);
        if (base64Audio) {
            if (!audioContextRef.current) {
                // FIX: Cast `window` to `any` to access `webkitAudioContext` without TypeScript errors.
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const decodedBytes = decodeBase64(base64Audio);
            const audioBuffer = await decodePcmAudioData(decodedBytes, audioContextRef.current);

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => {
                setPlayingAudioMessageId(null);
                audioSourceRef.current = null;
            };
            source.start();
            audioSourceRef.current = source;
            setPlayingAudioMessageId(messageId);
        }
    } catch (error) {
        console.error("Failed to play audio:", error);
    } finally {
        setIsLoadingAudioMessageId(null);
    }
  };

  // Voice Agent Methods
  const stopVoiceAgent = () => {
    liveSessionPromiseRef.current?.then(session => session.close());
    liveSessionPromiseRef.current = null;
    
    liveStreamRef.current?.getTracks().forEach(track => track.stop());
    liveStreamRef.current = null;

    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    inputSourceRef.current?.disconnect();
    inputSourceRef.current = null;

    inputAudioContextRef.current?.close().catch(console.error);
    outputAudioContextRef.current?.close().catch(console.error);
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;

    audioPlaybackSourcesRef.current.forEach(source => source.stop());
    audioPlaybackSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    
    currentInputTranscriptionRef.current = '';
    currentOutputTranscriptionRef.current = '';

    setIsVoiceAgentMode(false);
    setVoiceAgentStatus('idle');
  };

  const startVoiceAgent = async () => {
    if (!process.env.API_KEY) {
      alert("API Key is not configured.");
      return;
    }

    setIsVoiceAgentMode(true);
    setVoiceAgentStatus('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      liveStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setVoiceAgentStatus('listening');
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            inputSourceRef.current = source;
            
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              liveSessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.turnComplete && activeSessionId) {
              const userInput = currentInputTranscriptionRef.current.trim();
              const aiResponse = currentOutputTranscriptionRef.current.trim();
              
              if (userInput || aiResponse) {
                setChatSessions(prevSessions =>
                  prevSessions.map(session => {
                    if (session.id === activeSessionId) {
                      const newMessages: Message[] = [];
                      if (userInput) newMessages.push({ id: `user-voice-${Date.now()}`, sender: 'user', text: userInput });
                      if (aiResponse) newMessages.push({ id: `ai-voice-${Date.now()}`, sender: 'ai', text: aiResponse });
                      return { ...session, messages: [...session.messages, ...newMessages] };
                    }
                    return session;
                  })
                );
              }
              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';
            }
            if (message.serverContent?.interrupted) {
              audioPlaybackSourcesRef.current.forEach(source => source.stop());
              audioPlaybackSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
            if (base64Audio && outputAudioContextRef.current) {
              setVoiceAgentStatus('speaking');
              const audioBytes = decodeBase64(base64Audio);
              const audioBuffer = await decodePcmAudioData(audioBytes, outputAudioContextRef.current);
              
              const currentTime = outputAudioContextRef.current.currentTime;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, currentTime);

              const sourceNode = outputAudioContextRef.current.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(outputAudioContextRef.current.destination);
              
              sourceNode.onended = () => {
                audioPlaybackSourcesRef.current.delete(sourceNode);
                if (audioPlaybackSourcesRef.current.size === 0) {
                  setVoiceAgentStatus('listening');
                }
              };
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioPlaybackSourcesRef.current.add(sourceNode);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live session error:', e);
            setVoiceAgentStatus('error');
            stopVoiceAgent();
          },
          onclose: (e: CloseEvent) => {
            stopVoiceAgent();
          },
        }
      });
      liveSessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error('Failed to start voice agent:', err);
      alert('Could not start voice agent. Please ensure you have a microphone and have granted permissions.');
      stopVoiceAgent();
    }
  };

  const handleToggleVoiceAgentMode = () => {
    if (isVoiceAgentMode) {
      stopVoiceAgent();
    } else {
      startVoiceAgent();
    }
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

    // Check if it's the first user message before updating state
    const currentSession = chatSessions.find(s => s.id === activeSessionId);
    const isFirstUserMessage = currentSession ? currentSession.messages.filter(m => m.sender === 'user').length === 0 : false;
    const sessionIdForTitle = activeSessionId; // Capture session ID for async title update

    setChatSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionIdForTitle) {
          // Add new messages, title will be updated asynchronously
          return {
            ...session,
            messages: [...session.messages, userMessage, aiMessagePlaceholder],
          };
        }
        return session;
      })
    );
    
    // Asynchronously generate and set the title if it's the first message
    if (isFirstUserMessage && input.trim()) {
        generateChatTitle(input.trim()).then(newTitle => {
            setChatSessions(prev => prev.map(session => 
                session.id === sessionIdForTitle ? { ...session, title: newTitle } : session
            ));
        });
    }

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
        sessionIdForTitle,
        {
          videoFile: currentVideoFile,
          imageFile: currentImageFile,
          isImageGeneration: currentIsImageGeneration,
          aspectRatio: currentAspectRatio,
          isThinkingMode: currentIsThinkingMode,
          isMemoryOn,
          isChatHistoryOn,
        }
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
            session.id === sessionIdForTitle
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
          session.id === sessionIdForTitle
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

  const handlePreview = (url: string, type: 'image' | 'video') => {
    setPreviewMedia({ url, type });
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {showWelcomeModal && <WelcomeModal theme={theme} onClose={handleCloseWelcomeModal} />}
      <Sidebar 
        onNewChat={handleNewChat} 
        sessions={chatSessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onClearHistory={handleClearHistory}
        theme={theme}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onShowSettings={() => setView('settings')}
      />
      <div className="flex flex-col flex-1">
        <header className={`md:hidden flex items-center justify-between p-4 border-b transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-700/50' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center h-10">
             <AutonexBrand className="w-32 h-auto" isDark={isDark} />
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`} aria-label="Open menu">
             <MenuIcon className="w-6 h-6" />
          </button>
        </header>
        
        {view === 'chat' ? (
          <>
            <main className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {activeMessages.map((msg) => (
                  <ChatMessage 
                    key={msg.id} 
                    message={msg} 
                    theme={theme} 
                    onPlayAudio={handlePlayAudio}
                    isPlayingAudio={playingAudioMessageId === msg.id}
                    isLoadingAudio={isLoadingAudioMessageId === msg.id}
                    onPreview={handlePreview}
                  />
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
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              onToggleRecording={handleToggleRecording}
              isVoiceAgentMode={isVoiceAgentMode}
              onToggleVoiceAgentMode={handleToggleVoiceAgentMode}
              voiceAgentStatus={voiceAgentStatus}
            />
          </>
        ) : (
          <SettingsPage 
            theme={theme} 
            onToggleTheme={handleToggleTheme} 
            onBackToChat={() => setView('chat')}
            isMemoryOn={isMemoryOn}
            onToggleMemory={handleToggleMemory}
            onClearMemory={() => console.log("Clearing memory...")}
            isChatHistoryOn={isChatHistoryOn}
            onToggleChatHistory={handleToggleChatHistory}
          />
        )}
      </div>

      {previewMedia && (
        <PreviewModal 
          media={previewMedia}
          onClose={() => setPreviewMedia(null)}
          theme={theme}
        />
      )}

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

      {showLogoutConfirm && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`rounded-xl p-8 shadow-2xl border max-w-sm text-center transition-colors duration-300 ${isDark ? 'bg-gray-800 border-gray-700/50' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirm Logout</h2>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Are you sure you want to log out? Your session will be ended.</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
