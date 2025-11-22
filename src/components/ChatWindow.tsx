import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/types';
import { Send, Bot, User } from 'lucide-react';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    // Added !bg-white to container
    <div className="flex flex-col h-[600px] !bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-indigo-600 p-4 text-white flex items-center gap-2">
        <Bot className="w-5 h-5" />
        <h3 className="font-bold">Travel Assistant</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10 text-sm">
                <p>Ask me to change the plan, add restaurants, or check the weather!</p>
            </div>
        )}
        
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-indigo-100'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-blue-600" /> : <Bot className="w-5 h-5 text-indigo-600" />}
            </div>
            <div 
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white !text-gray-800 border border-gray-200 shadow-sm rounded-tl-none'
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm">
                <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 !bg-white border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Change dinner to sushi..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm !text-gray-900 bg-white"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};