'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Paperclip, Smile } from 'lucide-react';

interface ChatBoxProps {
    style?: React.CSSProperties;
    className?: string;
}

export default function ChatBox({ style, className }: ChatBoxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: 'Chào bạn! Tôi có thể giúp gì cho bạn?', sender: 'bot', time: '10:00 AM' },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isSmileHovered, setIsSmileHovered] = useState(false);
    const [isSendHovered, setIsSendHovered] = useState(false);
    const [isCloseHovered, setIsCloseHovered] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newMessage = {
            id: Date.now(),
            text: inputValue,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages([...messages, newMessage]);
        setInputValue('');

        // Simulate bot response
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: "Thanks for your message! I'm just a demo bot for now.",
                    sender: 'bot',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
            ]);
        }, 1000);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 flex flex-col items-center gap-[10px] pointer-events-none`}
            style={{ left: '30%', bottom: '5%', marginLeft: '13%', right: 'auto' }}
        >
            {/* Chat Window */}
            <div
                className={`
          mb-4 w-[350px] sm:w-[380px] bg-white overflow-hidden
          transition-all duration-300 ease-in-out origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}
        `}
                style={{ maxHeight: 'calc(100vh - 220px)', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
            >
                {/* Header */}
                <div style={{ background: 'linear-gradient(to right, #FF512F, #FFC300)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div>
                            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', margin: '0' }}>Travel Pal</h3>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        onMouseEnter={() => setIsCloseHovered(true)}
                        onMouseLeave={() => setIsCloseHovered(false)}
                        style={{
                            color: isCloseHovered ? 'white' : 'rgba(255, 255, 255, 0.8)',
                            backgroundColor: isCloseHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            padding: '0.375rem',
                            borderRadius: '9999px',
                            transition: 'color 0.15s ease-in-out, background-color 0.15s ease-in-out',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div style={{ height: '300px', overflowY: 'auto', padding: '1rem', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', margin: '1rem 0' }}>Today</div>

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}
                        >
                            <div
                                style={{
                                    maxWidth: '80%',
                                    padding: '0.75rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.875rem',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                    backgroundColor: msg.sender === 'user' ? '#4f46e5' : 'white',
                                    color: msg.sender === 'user' ? 'white' : '#1f2937',
                                    border: msg.sender === 'user' ? 'none' : '1px solid #f3f4f6',
                                    borderBottomRightRadius: msg.sender === 'user' ? '0' : '1rem',
                                    borderBottomLeftRadius: msg.sender === 'user' ? '1rem' : '0'
                                }}
                            >
                                <p style={{ margin: 0 }}>{msg.text}</p>
                                <p
                                    style={{
                                        fontSize: '0.625rem',
                                        marginTop: '0.25rem',
                                        textAlign: 'right',
                                        color: msg.sender === 'user' ? '#e0e7ff' : '#9ca3af'
                                    }}
                                >
                                    {msg.time}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                {/* Input Area */}
                <div style={{ padding: '1rem', backgroundColor: 'white', borderTop: '1px solid #f3f4f6' }}>
                    <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: '1 1 0%', position: 'relative' }}>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onFocus={() => setIsInputFocused(true)}
                                onBlur={() => setIsInputFocused(false)}
                                placeholder="Type a message..."
                                style={{
                                    width: '100%',
                                    paddingTop: '0.625rem',
                                    paddingBottom: '0.625rem',
                                    paddingLeft: '1rem',
                                    paddingRight: '2.5rem',
                                    backgroundColor: isInputFocused ? 'white' : '#f3f4f6',
                                    border: isInputFocused ? '1px solid #6366f1' : '1px solid transparent',
                                    borderRadius: '9999px',
                                    fontSize: '0.875rem',
                                    transition: 'all 0.15s ease-in-out',
                                    outline: 'none',
                                    color: '#374151',
                                    boxShadow: isInputFocused ? '0 0 0 2px #c7d2fe' : 'none'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            onMouseEnter={() => setIsSendHovered(true)}
                            onMouseLeave={() => setIsSendHovered(false)}
                            style={{
                                padding: '0.625rem',
                                borderRadius: '9999px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                transition: 'all 0.200s ease-in-out',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: inputValue.trim() ? (isSendHovered ? '#4338ca' : '#4f46e5') : '#e5e7eb',
                                color: inputValue.trim() ? 'white' : '#9ca3af',
                                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                                transform: inputValue.trim() && isSendHovered ? 'scale(1.05)' : 'scale(1)',
                                border: 'none'
                            }}
                        >
                            <Send size={18} className={inputValue.trim() ? 'ml-0.5' : ''} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Toggle Button */}
            {/* Toggle Button */}
            <button
                onClick={toggleChat}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '9999px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    background: 'linear-gradient(to right, #FF512F, #9333ea)',
                    color: 'white',
                    transition: 'all 0.3s ease-out',
                    outline: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    pointerEvents: 'auto'
                }}
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '9999px',
                    backgroundColor: 'white',
                    opacity: isHovered ? 0.2 : 0,
                    transition: 'opacity 0.3s'
                }}></div>

                <span>{isOpen ? 'AI' : 'AI chỉnh sửa kế hoạch'}</span>

                {/* Notification Badge (only show when closed) */}
                {!isOpen && (
                    <span style={{ position: 'absolute', top: '-0.25rem', right: '-0.25rem', display: 'flex', height: '1rem', width: '1rem' }}>
                        <span style={{ animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite', position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '9999px', backgroundColor: '#f87171', opacity: 0.75 }}></span>
                        <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '9999px', height: '1rem', width: '1rem', backgroundColor: '#ef4444', border: '2px solid white' }}></span>
                    </span>
                )}
            </button>
        </div>
    );
}
