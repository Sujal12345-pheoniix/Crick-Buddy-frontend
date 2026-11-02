'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar, { BrandMark } from '@/components/Sidebar';
import { PageHeader } from '@/components/ui';
import { chatbotAPI } from '@/lib/api';
import { Send, Loader } from 'lucide-react';

interface Message {
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

const SUGGESTIONS = [
    'How can I improve my batting stance?',
    'How do I add pace to my bowling?',
    'Best fitness work for cricketers?',
    'How do I play the cover drive correctly?',
    'How can I improve my release point?',
];

export default function ChatbotPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'ai',
            content: `Hello ${user?.name?.split(' ')[0] || 'Player'}. I'm your CrickBuddy coach. Ask me about batting technique, bowling, fitness or match plans — I'll tailor the advice to your profile. What would you like to work on today?`,
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
                content: 'Something went wrong on my end — could you ask that again?',
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

    const profile = [user?.experienceLevel, user?.playerType].filter(Boolean).join(' ');

    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <div className="page">
                    <PageHeader
                        eyebrow="Coaching"
                        title="Your coach"
                        description="Technique, fitness and match plans — answered with your game in mind."
                    />

                    <section className="card rise rise-1" aria-label="Conversation with your coach"
                        style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 250px)', minHeight: 460, overflow: 'hidden' }}>
                        {/* Chat header */}
                        <div className="row-between" style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'var(--navy-1000)' }}>
                            <div className="row" style={{ minWidth: 0 }}>
                                <BrandMark size={38} />
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 15 }}>CrickBuddy coach</div>
                                    {profile && (
                                        <div className="muted small" style={{ textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            Tailored for {profile}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="badge badge-good badge-dot">Online</span>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px, 2.4vw, 24px)' }} aria-live="polite">
                            {messages.map((msg, i) => {
                                const mine = msg.role === 'user';
                                return (
                                    <div key={i} className="row" style={{ alignItems: 'flex-end', gap: 10, marginBottom: 18, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                                        {!mine && <BrandMark size={30} />}
                                        <div style={{ maxWidth: 'min(78%, 620px)', display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                                            <div className={`bubble ${mine ? 'bubble-user' : 'bubble-ai'}`} style={{ maxWidth: '100%' }}>{msg.content}</div>
                                            <div className="muted" style={{ fontSize: 11, marginTop: 5 }}>
                                                {mine ? 'You' : 'Coach'} · {formatTime(msg.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {loading && (
                                <div className="row" style={{ alignItems: 'flex-end', gap: 10, marginBottom: 18 }} role="status">
                                    <BrandMark size={30} />
                                    <div className="bubble bubble-ai row" style={{ gap: 8 }}>
                                        <Loader size={14} className="animate-spin" />
                                        <span className="muted">Coach is thinking…</span>
                                    </div>
                                </div>
                            )}

                            {/* Suggestions */}
                            {messages.length === 1 && (
                                <div style={{ marginTop: 8, paddingLeft: 40 }}>
                                    <div className="label" style={{ marginBottom: 10 }}>Try asking</div>
                                    <div className="row wrap" style={{ gap: 8 }}>
                                        {SUGGESTIONS.map(s => (
                                            <button key={s} type="button" className="chip" onClick={() => sendMessage(s)}>{s}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Composer */}
                        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--line)', background: 'var(--navy-1000)' }}>
                            <div className="row" style={{ alignItems: 'flex-end', gap: 10 }}>
                                <label htmlFor="chat-input" className="sr-only">Message your coach</label>
                                <textarea
                                    id="chat-input"
                                    className="input"
                                    rows={1}
                                    placeholder="Ask about technique, fitness or match plans…"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    style={{ resize: 'none', minHeight: 46, maxHeight: 160 }}
                                />
                                <button type="button" className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}
                                    aria-label="Send message" style={{ height: 46, flexShrink: 0 }}>
                                    <Send size={17} /> <span className="hide-mobile">Send</span>
                                </button>
                            </div>
                            <p className="muted hide-mobile" style={{ fontSize: 11.5, marginTop: 8 }}>
                                <span className="kbd">Enter</span> to send · <span className="kbd">Shift</span> + <span className="kbd">Enter</span> for a new line
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
