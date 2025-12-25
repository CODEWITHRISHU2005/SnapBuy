import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  Trash2, 
  Smile, 
  Paperclip 
} from 'lucide-react';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Hello! I am your AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Show tooltip occasionally when closed
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setShowTooltip(true), 3000);
      const hideTimer = setTimeout(() => setShowTooltip(false), 8000);
      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    } else {
      setShowTooltip(false);
    }
  }, [isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!inputValue.trim()) return;

    if (!isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: inputValue,
          sender: 'user',
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          text: 'Please log in to chat with me.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
      setInputValue('');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatAPI.ask(userMessage.text);
      const botResponseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        text: 'Chat history cleared. How can I help you now?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  // Custom animations styles
  const styles = `
    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
      70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
      100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
    }
    .msg-animate {
      animation: slideInUp 0.3s ease-out forwards;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      
      {/* Floating Action Button (Launcher) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4">
        {/* Tooltip */}
        <div 
          className={`bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 transition-all duration-500 transform origin-right ${
            showTooltip && !isOpen ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-10 scale-95 pointer-events-none'
          }`}
        >
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
            Need help? Ask me anything! 👋
          </p>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-3 h-3 bg-white dark:bg-slate-800 rotate-45 border-r border-t border-slate-100 dark:border-slate-700"></div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
            isOpen
              ? 'bg-rose-500 hover:bg-rose-600 rotate-90'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {/* Pulse effect when closed */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full animate-[pulse-ring_3s_infinite] bg-indigo-500/30 -z-10"></span>
          )}
          
          <div className="relative text-white">
            {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
          </div>
        </button>
      </div>

      {/* Main Chat Interface */}
      <div
        className={`fixed bottom-24 right-6 w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden transition-all duration-500 origin-bottom-right z-50 ${
          isOpen
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-20 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-4 sm:p-5 shrink-0">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
             <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent animate-spin-slow"></div>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-inner border border-white/20">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-indigo-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight tracking-wide">SnapBot</h3>
                <p className="text-indigo-100/80 text-xs font-medium">Always here to help</p>
              </div>
            </div>
            
            <button 
              onClick={clearChat}
              className="p-2 text-indigo-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-3 msg-animate ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                    : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`relative px-4 py-3 rounded-2xl max-w-[75%] shadow-sm text-[15px] leading-relaxed group ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700/50 rounded-bl-sm'
                }`}
              >
                {msg.text}
                
                {/* Timestamp */}
                <span className={`block text-[10px] mt-1 opacity-0 group-hover:opacity-70 transition-opacity ${
                  msg.sender === 'user' ? 'text-indigo-100' : 'text-slate-400'
                }`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-end gap-3 msg-animate">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm border border-slate-100 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-1.5 h-6">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <form
            onSubmit={handleSendMessage}
            className="flex items-end gap-2 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-3xl border border-transparent focus-within:border-indigo-500/30 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all"
          >
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-indigo-500 transition-colors rounded-full hover:bg-white dark:hover:bg-slate-700"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-indigo-500 transition-colors rounded-full hover:bg-white dark:hover:bg-slate-700"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 px-2 py-2.5 max-h-32 min-h-[44px]"
              disabled={isLoading}
            />
            
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ${
                isLoading || !inputValue.trim()
                  ? 'opacity-50 scale-90 cursor-not-allowed'
                  : 'hover:bg-indigo-700 hover:scale-105 active:scale-95'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
              <span>Powered by SnapBuy AI</span>
              <Sparkles className="w-3 h-3" />
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
