import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language } from '../types';
import { chatWithExpert } from '../services/geminiService';
import { MessageSquareIcon, SparklesIcon } from './Icons';
import { translations } from '../translations';
import ReactMarkdown from 'react-markdown';

interface Props {
  lang: Language;
}

const ChatInterface: React.FC<Props> = ({ lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  // Reset initial message when language changes or on mount
  useEffect(() => {
    if (messages.length === 0) {
        setMessages([{ 
        id: '1', 
        role: 'model', 
        text: t.chatWelcome,
        timestamp: new Date() 
        }]);
    }
  }, [lang, t.chatWelcome, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

      const responseText = await chatWithExpert(history, userMsg.text, lang);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "I couldn't understand that, please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I encountered an error. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/20 animate-slide-up">
      {/* Header */}
      <div className="p-4 bg-[#667eea] text-white flex items-center gap-2">
        <SparklesIcon />
        <h2 className="font-bold">AgroGuard Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-900/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-[#667eea] text-white rounded-tr-none' 
                : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-tl-none'
            }`}>
              {msg.role === 'user' ? (
                  <p>{msg.text}</p>
              ) : (
                  <div className="prose prose-sm max-w-none prose-indigo dark:prose-invert [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>pre]:bg-gray-800 [&>pre]:text-white [&>pre]:p-3 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>code]:bg-gray-100 dark:[&>code]:bg-gray-800 [&>code]:text-indigo-600 dark:[&>code]:text-indigo-300 [&>code]:px-1 [&>code]:rounded">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
             <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-3 rounded-2xl rounded-tl-none text-xs text-gray-500 dark:text-gray-400 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-[#667eea] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-[#667eea] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#667eea] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
             </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chatPlaceholder}
          className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#667eea] text-gray-800 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="p-3 bg-[#667eea] text-white rounded-xl hover:bg-[#5a67d8] disabled:opacity-50 transition-colors flex items-center justify-center w-12"
        >
          <MessageSquareIcon />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;