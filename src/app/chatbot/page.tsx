'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { chatbotAPI } from '@/lib/api';
import { Send, Loader, Bot, User } from 'lucide-react';

interface Message {
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

const SUGGESTIONS = [
    'How can I improve my batting stance?',
    'Tips to bowl faster?',
    'Best fitness exercises for cricketers?',
    'How to play cover drive correctly?',
    'How to improve my release point?',
];

export default function ChatbotPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'ai',
            content: `Hello ${user?.name?.split(' ')[0] || 'Player'}! 🏏 I'm your AI Cricket Coach. I can help you with batting technique, bowling strategies, fitness plans, and personalized advice based on your profile. What would you like to work on today?`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const msg = text || input.trim();
        if (!msg || loading) return;
        setInput('');

        const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }));
            const res = await chatbotAPI.send(msg, history);
            const aiMsg: Message = { role: 'ai', content: res.data.reply, timestamp: new Date() };
            setMessages(prev => [...prev, aiMsg]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: 'I had a momentary lapse — could you repeat your question? 🤔',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const formatTime = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                {/* Header */}
                <div style={{ padding: '24px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #00ff88, #00c864)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bot size={22} color="#0a0e1a" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 800 }}>AI Cricket Coach 💬</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <span style={{ width: 6, height: 6, background: '#00ff88', borderRadius: '50%' }} />
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Online · Personalized for {user?.playerType} · {user?.experienceLevel}</span>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px' }}>
                    {/* Suggestions */}
                    {messages.length === 1 && (
                        <div style={{ marginBottom: 24 }}>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>Quick questions:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {SUGGESTIONS.map(s => (
                                    <button key={s} onClick={() => sendMessage(s)}
                                        style={{ background: 'rgba(0,255,136,0.07)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 20, padding: '6px 14px', color: '#00ff88', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500 }}
                                        onMouseEnter={e => (e.target as HTMLElement).style.background = 'rgba(0,255,136,0.15)'}
                                        onMouseLeave={e => (e.target as HTMLElement).style.background = 'rgba(0,255,136,0.07)'}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 20, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                            {/* Avatar */}
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                background: msg.role === 'user' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #00ff88, #00c864)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {msg.role === 'user' ? <User size={16} color="#fff" /> : <Bot size={16} color="#0a0e1a" />}
                            </div>

                            <div style={{ maxWidth: '68%' }}>
                                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
                                    style={{ padding: '12px 16px' }}>
                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                                </div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                    {msg.role === 'user' ? 'You' : 'AI Coach'} · {formatTime(msg.timestamp)}
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #00ff88, #00c864)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={16} color="#0a0e1a" />
                            </div>
                            <div className="chat-bubble-ai" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Loader size={14} style={{ animation: 'spin-slow 0.8s linear infinite', color: '#00ff88' }} />
                                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>AI Coach is thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '20px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', gap: 12, maxWidth: 900 }}>
                        <textarea
                            className="input"
                            rows={1}
                            placeholder="Ask your AI Cricket Coach anything..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{ resize: 'none', lineHeight: 1.5, padding: '13px 16px' }}
                        />
                        <button className="btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}
                            style={{ padding: '0 20px', flexShrink: 0, opacity: (!input.trim() || loading) ? 0.5 : 1 }}>
                            <Send size={18} />
                        </button>
                    </div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>Press Enter to send · Shift+Enter for new line</p>
                </div>
            </main>
        </div>
    );
}
