
import React, { useState, useEffect, useRef } from 'react';
import api from './api';
import { Send, Sparkles, LogOut, Menu, Brain, X } from 'lucide-react';
import { MessageBubble } from './components/MessageBubble';
import { MemoryPanel } from './components/MemoryPanel';
import { LoginPage } from './components/LoginPage';
import { ChatHistoryPanel } from './components/ChatHistoryPanel'; // New Import

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(() => localStorage.getItem('kai_user_id'));
  const [username, setUsername] = useState(() => localStorage.getItem('kai_username') || 'User');
  const [refreshMemory, setRefreshMemory] = useState(0);

  // Multi-Session State
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [refreshHistory, setRefreshHistory] = useState(0); // Trigger sidebar update
  const messagesEndRef = useRef(null);

  // Mobile State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      // Initial load? Maybe select latest session or start new?
      // Let's default to New Chat (empty)
      setMessages([{ role: 'model', content: "Welcome back, " + username + ". System initialized." }]);
    }
  }, [userId]);

  useEffect(() => { scrollToBottom(); }, [messages, loading]);
  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

  const handleLogin = (id, name) => {
    localStorage.setItem('kai_user_id', id);
    localStorage.setItem('kai_username', name);
    setUserId(id);
    setUsername(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('kai_user_id');
    localStorage.removeItem('kai_username');
    setUserId(null);
    setMessages([]);
    setUsername('');
    setCurrentSessionId(null);
  }

  // Load specific session
  const handleSelectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    setIsMobileMenuOpen(false); // Close mobile drawer on selection
    if (!sessionId) {
      // New Chat
      setMessages([{ role: 'model', content: "Ready for a new task, " + username + "." }]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/api/chat/session/' + sessionId);
      if (res.data) {
        setMessages(res.data.map(m => ({ content: m.content, role: m.role })));
      }
    } catch (err) {
      console.error("Failed to load session");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    // Optimistic Update
    setMessages(prev => [...prev, { content: userMsg, role: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      const payload = {
        userId,
        message: userMsg,
        sessionId: currentSessionId // Send current ID (or null for new)
      };

      const res = await api.post('/api/chat/message', payload);

      // Backend returns the session ID used/created
      const returnedSessionId = res.data.sessionId;

      // If we were in "New Chat" mode, update to the actual session ID now
      if (!currentSessionId && returnedSessionId) {
        setCurrentSessionId(returnedSessionId);
        setRefreshHistory(n => n + 1); // Update sidebar title
      }

      setMessages(prev => [...prev, { content: res.data.reply, role: 'model' }]);

      // Trigger memory check
      setTimeout(() => setRefreshMemory(n => n + 1), 2000);

    } catch (err) {
      setMessages(prev => [...prev, { content: "⚠️ Connection Failed.", role: 'model' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="h-screen w-full bg-tech-bg bg-cover bg-center overflow-hidden relative">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none"></div>
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-tech-bg bg-cover bg-center overflow-hidden relative" style={{ backgroundColor: '#0f172a' }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none"></div>

      {/* Floating Glass Container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center md:p-8">
        <div className="w-full max-w-7xl h-full bg-black/40 border-0 md:border md:border-white/10 md:rounded-3xl backdrop-blur-xl shadow-2xl flex overflow-hidden">

          {/* HISTORY SIDEBAR (DESKTOP) */}
          <div className="hidden md:block w-72 border-r border-white/5 bg-black/20">
            <ChatHistoryPanel
              userId={userId}
              onSelectSession={handleSelectSession}
              currentSessionId={currentSessionId}
              triggerRefresh={refreshHistory}
            />
          </div>

          {/* HISTORY SIDEBAR (MOBILE OVERLAY - LEFT) */}
          {isMobileMenuOpen && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md md:hidden flex">
              <div className="w-3/4 h-full bg-[#0f111a] border-r border-white/10 shadow-2xl flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-white/5 shrink-0">
                  <span className="text-white font-bold tracking-widest text-sm">ARCHIVES</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/50 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ChatHistoryPanel
                    userId={userId}
                    onSelectSession={handleSelectSession}
                    currentSessionId={currentSessionId}
                    triggerRefresh={refreshHistory}
                  />
                </div>
              </div>
              <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)}></div>
            </div>
          )}

          {/* MEMORY SIDEBAR (MOBILE OVERLAY - RIGHT) */}
          {isMemoryOpen && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md md:hidden flex justify-end">
              <div className="flex-1" onClick={() => setIsMemoryOpen(false)}></div>
              <div className="w-3/4 h-full bg-[#0f111a] border-l border-white/10 shadow-2xl flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-white/5 shrink-0">
                  <button onClick={() => setIsMemoryOpen(false)} className="text-white/50 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                  <span className="text-white font-bold tracking-widest text-sm text-right">NEURAL CORE</span>
                </div>
                <div className="flex-1 overflow-hidden p-2">
                  <MemoryPanel userId={userId} refreshTrigger={refreshMemory} />
                </div>
              </div>
            </div>
          )}

          {/* MAIN CHAT (CENTER) */}
          <div className="flex-1 flex flex-col relative w-full min-w-0">
            {/* Header */}
            <header className="h-16 md:h-20 border-b border-white/5 flex items-center px-4 md:px-8 justify-between bg-white/5">
              <div className="flex items-center gap-3 md:gap-4">
                {/* Mobile Menu Button */}
                <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-white/70 hover:text-white">
                  <Menu className="w-6 h-6" />
                </button>

                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-white tracking-wide">KAI <span className="text-blue-400 hidden sm:inline">assistant</span></h1>
                  <p className="text-[10px] md:text-xs text-gray-400">Connected: <span className="text-white font-mono">{username}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Mobile Memory Button */}
                <button onClick={() => setIsMemoryOpen(true)} className="md:hidden text-white/70 hover:text-blue-400 transition">
                  <Brain className="w-6 h-6" />
                </button>

                <button onClick={handleLogout} className="text-white/50 hover:text-red-400 transition" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-8 space-y-3 md:space-y-2">
              {messages.map((msg, i) => (
                <MessageBubble key={i} role={msg.role} content={msg.content} />
              ))}
              {loading && (
                <div className="flex items-center gap-2 ml-4 text-xs font-mono text-blue-300 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 md:p-6 bg-gradient-to-t from-black/40 to-transparent">
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type message..."
                  className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 md:px-6 py-3 md:py-4 text-white text-sm md:text-base placeholder-gray-400 focus:outline-none focus:bg-white/15 focus:border-blue-500/50 transition-all shadow-lg backdrop-blur-md"
                />
                <button
                  type="submit"
                  disabled={!input || loading}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none"
                >
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </form>
            </div>
          </div>

          {/* MEMORY SIDEBAR (DESKTOP - RIGHT) */}
          <div className="hidden lg:block w-80 border-l border-white/5 bg-white/5">
            <MemoryPanel userId={userId} refreshTrigger={refreshMemory} />
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
