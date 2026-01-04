import React, { useState, useEffect, useRef } from 'react';
import { Background } from './components/Background';
import { ChatInterface } from './components/ChatInterface';
import { SettingsModal } from './components/SettingsModal';
import { 
  BrainIcon, 
  SparklesIcon, 
  LayoutIcon, 
  ShieldIcon, 
  SettingsIcon,
  GlobeIcon,
  NetworkIcon,
  CpuIcon,
  DatabaseIcon,
  CodeIcon,
  MessageIcon
} from './components/Icons';
import { Message, ViewState, AppSettings, DEFAULT_SETTINGS } from './types';
import { generateAGIResponse } from './services/geminiService';

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setOpacity(0), 3000);
    const removeTimer = setTimeout(onComplete, 4000);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out"
      style={{ opacity }}
    >
      <div className="relative z-10 text-center p-8">
        <div className="w-24 h-24 mx-auto mb-8 bg-blue-600/20 rounded-full flex items-center justify-center animate-pulse">
          <BrainIcon className="w-12 h-12 text-blue-500" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          AGI Project
        </h1>
        <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-6"></div>
        <div className="space-y-2">
          <p className="text-slate-400 text-sm uppercase tracking-widest">Owner Of AGI</p>
          <p className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
            Mahi X Prerit
          </p>
        </div>
      </div>
      <Background />
    </div>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState<ViewState>(ViewState.HOME);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingText, setThinkingText] = useState('Thinking');
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load settings from local storage
  useEffect(() => {
      const savedSettings = localStorage.getItem('agi_settings');
      if (savedSettings) {
          try {
              setSettings(JSON.parse(savedSettings));
          } catch (e) {
              console.error("Failed to load settings", e);
          }
      }
  }, []);

  const saveSettings = (newSettings: AppSettings) => {
      setSettings(newSettings);
      localStorage.setItem('agi_settings', JSON.stringify(newSettings));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, activeView]);

  useEffect(() => {
    if (isThinking) {
      const interval = setInterval(() => {
        setThinkingText(prev => prev.length > 10 ? 'Thinking' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isThinking]);

  const handleSendMessage = async (text: string) => {
    // Automatically switch to chat view if not already
    if (activeView !== ViewState.CHAT) {
        setActiveView(ViewState.CHAT);
    }
    
    // Optimistic UI update
    const newMessages: Message[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setIsThinking(true);

    try {
      // Pass the *previous* messages as history, not including the new one (service handles append)
      const response = await generateAGIResponse(text, messages, settings);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Critical system failure in cognitive module." }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleNavClick = (view: ViewState) => {
    setActiveView(view);
  };
  
  const handleExampleClick = (text: string) => {
     handleSendMessage(text);
  };

  const handleNewChat = () => {
      setMessages([]);
      setActiveView(ViewState.CHAT);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Helper to render the specific view content (Features, Home, etc.)
  // OR the Empty Chat state
  const renderViewContent = () => {
    switch (activeView) {
      case ViewState.CHAT:
         return (
            <div className="h-full flex flex-col justify-center items-center text-center animate-fade-in p-8">
                <div className="w-24 h-24 bg-gradient-to-tr from-white to-blue-50 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/10 mb-8 border border-white relative group">
                    <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-inner relative z-10">
                        <BrainIcon className="w-10 h-10 text-white animate-pulse" />
                    </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 tracking-tight">
                    How can I help you today?
                </h2>
                <p className="text-slate-500 max-w-md text-lg leading-relaxed mb-8">
                    I am ready to analyze data, write code, and solve complex problems with high precision.
                </p>
                
                {/* Quick suggestions for empty state */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                    <button onClick={() => handleSendMessage("Explain Quantum Computing")} className="p-4 text-left text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all">
                        ⚛️ Explain Quantum Computing
                    </button>
                    <button onClick={() => handleSendMessage("Write a Python script for data analysis")} className="p-4 text-left text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all">
                        🐍 Python Data Analysis Script
                    </button>
                </div>
            </div>
         );

      case ViewState.FEATURES:
        return (
           <div className="animate-fade-in p-8 pb-20">
              <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">System Capabilities</h2>
                  <p className="text-slate-500">Advanced neural modules activated for high-performance tasks.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FeatureDetailCard 
                    title="GK Analysis Engine" 
                    desc="Deep scanning of general knowledge databases to answer complex historical, scientific, and cultural queries with high precision."
                    icon={<GlobeIcon className="w-6 h-6 text-indigo-500" />}
                 />
                 <FeatureDetailCard 
                    title="Code Generation" 
                    desc="Production-grade code synthesis in Python, TypeScript, Rust, and Go. Supports complex algorithms and full-stack architecture."
                    icon={<CodeIcon className="w-6 h-6 text-blue-500" />}
                 />
                 <FeatureDetailCard 
                    title="Logical Reasoning" 
                    desc="Step-by-step chain of thought processing for riddles, math problems, and strategic decision making."
                    icon={<BrainIcon className="w-6 h-6 text-purple-500" />}
                 />
                 <FeatureDetailCard 
                    title="Creative Studio" 
                    desc="Generative text for storytelling, poetry, and scriptwriting with nuanced emotional intelligence."
                    icon={<SparklesIcon className="w-6 h-6 text-cyan-500" />}
                 />
              </div>
           </div>
        );
      case ViewState.EXAMPLES:
         return (
            <div className="animate-fade-in p-8 pb-20">
               <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Example Prompts</h2>
                  <p className="text-slate-500">Test the AGI with these complex scenarios.</p>
               </div>
               <div className="grid grid-cols-1 gap-4">
                  <ExampleButton text="Generate a React component for a 3D data visualization dashboard using Three.js" onClick={handleExampleClick} />
                  <ExampleButton text="Analyze the geopolitical implications of quantum computing in the next decade" onClick={handleExampleClick} />
                  <ExampleButton text="Solve this riddle: I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?" onClick={handleExampleClick} />
                  <ExampleButton text="Explain the concept of Neural Radiance Fields (NeRF) to a 10-year-old" onClick={handleExampleClick} />
               </div>
            </div>
         );
      case ViewState.SAFETY:
         return (
            <div className="animate-fade-in p-8 pb-20">
               <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Safety Protocols</h2>
                  <p className="text-slate-500">Core directives ensuring safe and ethical operation.</p>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 text-slate-700">
                  <div className="flex gap-4">
                     <ShieldIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
                     <div>
                        <h3 className="font-bold text-lg mb-1">Ethical Alignment</h3>
                        <p className="text-sm leading-relaxed">The AGI is aligned with human values, prioritizing helpfulness, harmlessness, and honesty. It refuses to generate harmful, biased, or malicious content.</p>
                     </div>
                  </div>
                   <div className="flex gap-4">
                     <ShieldIcon className="w-8 h-8 text-blue-500 flex-shrink-0" />
                     <div>
                        <h3 className="font-bold text-lg mb-1">Data Privacy</h3>
                        <p className="text-sm leading-relaxed">All interactions are processed with strict privacy standards. No personal data is permanently stored in the training set without consent.</p>
                     </div>
                  </div>
               </div>
            </div>
         );
      case ViewState.HOME:
      default:
        return (
           <div className="animate-fade-in p-8 pb-20">
               <div className="mb-8">
                  <div className="flex items-baseline gap-3 mb-2">
                      <h2 className="text-4xl font-bold text-slate-900">AGI</h2>
                      <span className="text-slate-400 font-medium">By Mahi X Prerit</span>
                  </div>
                  <p className="text-slate-600 max-w-lg text-lg leading-relaxed">
                      Understands, analyzes, and responds to human intelligence at a <span className="text-blue-600 font-semibold">high level</span>.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <FeatureCard 
                      title="Understand" 
                      desc="Processes information like a human brain"
                      icon={<BrainIcon className="w-10 h-10 text-blue-500" />}
                      illustration="bg-blue-50"
                  />
                  <FeatureCard 
                      title="Analyze" 
                      desc="Evaluates data and contexts deeply"
                      icon={<DatabaseIcon className="w-10 h-10 text-indigo-500" />}
                      illustration="bg-indigo-50"
                  />
                  <FeatureCard 
                      title="Decide" 
                      desc="Makes autonomous high-level decisions"
                      icon={<NetworkIcon className="w-10 h-10 text-cyan-500" />}
                      illustration="bg-cyan-50"
                  />
               </div>
           </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 text-white font-sans selection:bg-blue-500 selection:text-white flex flex-col overflow-hidden">
      <Background />
      
      <SettingsModal 
         isOpen={isSettingsOpen} 
         onClose={() => setIsSettingsOpen(false)} 
         settings={settings}
         onSave={saveSettings}
      />

      <div className="relative z-10 w-full h-full flex flex-col max-w-7xl mx-auto px-4 py-4">
        {/* Header */}
        <header className="flex-none flex justify-between items-center py-2 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
               <BrainIcon className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-wide">AGI Project</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button onClick={() => handleNavClick(ViewState.HOME)} className={`hover:text-white transition-colors ${activeView === ViewState.HOME ? 'text-white' : ''}`}>Home</button>
            <button onClick={() => handleNavClick(ViewState.FEATURES)} className={`hover:text-white transition-colors ${activeView === ViewState.FEATURES ? 'text-white' : ''}`}>Features</button>
            <button onClick={() => handleNavClick(ViewState.EXAMPLES)} className={`hover:text-white transition-colors ${activeView === ViewState.EXAMPLES ? 'text-white' : ''}`}>Examples</button>
          </nav>

          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel hover:bg-white/10 transition-all text-xs font-semibold border border-white/10"
            >
              <SettingsIcon className="w-4 h-4" />
              Settings
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/20">
               <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 animate-spin-slow p-[1px]">
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 text-cyan-400" />
                  </div>
               </div>
            </div>
          </div>
        </header>

        {/* Hero / Title Section - Only show on HOME view to save space on Chat */}
        {activeView === ViewState.HOME && (
            <div className="flex-none flex justify-between items-end mb-4 pl-4 animate-fade-in">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-300">
                Artificial General <br/> Intelligence
                </h1>
                <p className="text-blue-300/80 text-lg">Thinking like humans</p>
            </div>
            <button 
                onClick={handleNewChat}
                className="flex items-center gap-2 bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-semibold transition-all shadow-lg shadow-blue-900/40 cursor-pointer active:scale-95"
            >
                <MessageIcon className="w-4 h-4" />
                New Chat
            </button>
            </div>
        )}
        
        {/* If not HOME, allow easy access to New Chat via a smaller header action or sidebar */}
        {activeView !== ViewState.HOME && (
             <div className="flex-none flex justify-end mb-2 px-4">
                 <button 
                    onClick={handleNewChat}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-lg shadow-blue-900/40"
                >
                    <MessageIcon className="w-3 h-3" />
                    New Chat
                </button>
             </div>
        )}

        {/* Main Interface */}
        <div className="flex-1 flex overflow-hidden rounded-3xl bg-[#f0f4f8] text-slate-800 shadow-2xl relative min-h-0">
            
            {/* Sidebar */}
            <div className="hidden md:flex w-64 bg-[#eef2f6] border-r border-slate-200/60 p-6 flex-col gap-2 shrink-0 overflow-y-auto">
                <NavItem 
                    active={activeView === ViewState.HOME} 
                    icon={<GlobeIcon className="w-5 h-5" />} 
                    label="What is AGI" 
                    onClick={() => handleNavClick(ViewState.HOME)}
                />
                <NavItem 
                    active={activeView === ViewState.FEATURES} 
                    icon={<SparklesIcon className="w-5 h-5" />} 
                    label="Features" 
                    onClick={() => handleNavClick(ViewState.FEATURES)}
                    hasIndicator
                />
                <NavItem 
                    active={activeView === ViewState.EXAMPLES} 
                    icon={<LayoutIcon className="w-5 h-5" />} 
                    label="Examples" 
                    onClick={() => handleNavClick(ViewState.EXAMPLES)}
                />
                <NavItem 
                    active={activeView === ViewState.SAFETY} 
                    icon={<ShieldIcon className="w-5 h-5" />} 
                    label="Safety" 
                    onClick={() => handleNavClick(ViewState.SAFETY)}
                />
                <div className="mt-4 border-t border-slate-200 pt-4">
                     <NavItem 
                        active={activeView === ViewState.CHAT} 
                        icon={<MessageIcon className="w-5 h-5" />} 
                        label="Chat Panel" 
                        onClick={() => handleNavClick(ViewState.CHAT)}
                        hasIndicator={activeView === ViewState.CHAT}
                    />
                </div>

                <div className="mt-auto pt-6 border-t border-slate-200">
                    <div className="flex gap-4 justify-center text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 cursor-pointer transition-colors">
                            <HeadphoneIcon className="w-4 h-4" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 cursor-pointer transition-colors">
                            <LayoutIcon className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] relative h-full min-w-0">
                
                {/* Scrollable Messages/Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* If we are in Chat View and have messages, show them. Otherwise show the View Content */}
                    {activeView === ViewState.CHAT && messages.length > 0 ? (
                        <div className="flex flex-col gap-6 p-8 pb-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`
                                    max-w-[85%] rounded-2xl p-5 shadow-sm
                                    ${msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'}
                                `}>
                                    {msg.role === 'model' && (
                                    <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-blue-500">
                                        <SparklesIcon className="w-3 h-3" /> AGI Response
                                    </div>
                                    )}
                                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                                </div>
                                </div>
                            ))}
                            {isThinking && (
                                <div className="flex justify-start animate-pulse">
                                    <div className="bg-white/50 text-blue-600 rounded-2xl p-4 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                    <span className="text-sm font-semibold ml-2">{thinkingText}</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        renderViewContent()
                    )}
                </div>

                {/* Fixed Chat Input Area */}
                <div className="flex-none p-4 bg-[#f8fafc]/80 backdrop-blur-xl border-t border-white/40">
                   <ChatInterface onSendMessage={handleSendMessage} />
                </div>

            </div>
        </div>
        
        {/* Footer (only on large screens) */}
        <div className="hidden lg:flex gap-6 text-slate-500 text-sm pt-2 justify-center flex-none">
             <span>© 2026 AGI Project</span>
             <span>•</span>
             <span>Mahi X Prerit</span>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ active, icon, label, onClick, hasIndicator }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void, hasIndicator?: boolean }) => (
    <button 
        onClick={onClick}
        className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
            ${active 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'}
        `}
    >
        {icon}
        <span className="font-medium">{label}</span>
        {hasIndicator && active && (
            <div className="ml-auto w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"></div>
        )}
    </button>
);

const FeatureCard = ({ title, desc, icon, illustration }: { title: string, desc: string, icon: React.ReactNode, illustration: string }) => (
    <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
        <div className={`h-32 rounded-xl mb-4 ${illustration} flex items-center justify-center relative overflow-hidden`}>
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 to-transparent"></div>
             <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-500">
                 {icon}
             </div>
             <div className="absolute bottom-2 left-2 w-8 h-8 bg-current opacity-10 rounded-full"></div>
             <div className="absolute top-2 right-2 w-4 h-4 bg-current opacity-10 rounded-full"></div>
        </div>
        <div className="px-3 pb-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-1">
                {title}
            </h3>
            <p className="text-sm text-slate-500 leading-snug">{desc}</p>
        </div>
    </div>
);

const FeatureDetailCard = ({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) => (
   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:scale-[1.02]">
       <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
           {icon}
       </div>
       <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
       <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
   </div>
);

const ExampleButton = ({ text, onClick }: { text: string, onClick: (t: string) => void }) => (
   <button 
      onClick={() => onClick(text)}
      className="text-left w-full p-4 rounded-xl bg-white border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all group"
   >
      <p className="text-slate-700 font-medium group-hover:text-blue-600 transition-colors">{text}</p>
   </button>
);

const HeadphoneIcon = ({ className }: {className?: string}) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

export default App;