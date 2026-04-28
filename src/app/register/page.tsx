'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader, ChevronRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

type RegisterForm = {
    name: string; email: string; password: string; confirmPassword: string;
    role: string; playerType: string; experienceLevel: string; battingStyle: string; bowlingStyle: string;
};

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        const form: RegisterForm = {
            name: String(fd.get('name') || '').trim(),
            email: String(fd.get('email') || '').trim(),
            password: String(fd.get('password') || ''),
            confirmPassword: String(fd.get('confirmPassword') || ''),
            role: String(fd.get('role') || 'player'),
            playerType: String(fd.get('playerType') || 'batsman'),
            experienceLevel: String(fd.get('experienceLevel') || 'beginner'),
            battingStyle: String(fd.get('battingStyle') || 'right-handed'),
            bowlingStyle: 'none',
        };
        if (!form.name || !form.email) return toast.error('Name and email are required');
        if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        setLoading(true);
        try {
            await register(form);
            toast.success('Account created! Welcome to Crick-Buddy 🏏');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    const inputStyle = { marginBottom: 16 };

    return (
        <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 40px', position: 'relative', overflow: 'hidden' }}>
            <div className="hero-orb" style={{ width: 500, height: 500, background: 'rgba(99,102,241,0.05)', top: '-10%', right: '-5%' }} />
            <div className="hero-orb" style={{ width: 350, height: 350, background: 'rgba(34,197,94,0.04)', bottom: '-5%', left: '-5%', animationDelay: '2s' }} />

            <div style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Link href="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                        <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', boxShadow: '0 8px 32px rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <img src="/icon.png" alt="Crick Buddy" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Crick-Buddy</span>
                    </Link>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Create your free account — no credit card needed</p>
                </div>

                <div className="card" style={{ padding: 'clamp(20px,4vw,32px)' }}>
                    <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, textAlign: 'center' }}>Join Crick-Buddy 🏏</h1>

                    <form onSubmit={handleSubmit}>
                        {/* Name + Email */}
                        <div style={inputStyle}>
                            <label className="input-label">Full Name</label>
                            <input className="input" name="name" placeholder="Virat Sharma" autoComplete="name" autoCapitalize="words" />
                        </div>
                        <div style={inputStyle}>
                            <label className="input-label">Email Address</label>
                            <input className="input" name="email" type="email" placeholder="you@example.com" autoComplete="email" inputMode="email" />
                        </div>

                        {/* Passwords */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 0 }}>
                            <div style={inputStyle}>
                                <label className="input-label">Password</label>
                                <input className="input" name="password" type={showPw ? 'text' : 'password'} placeholder="Min 6 chars" autoComplete="new-password" />
                            </div>
                            <div style={inputStyle}>
                                <label className="input-label">Confirm</label>
                                <input className="input" name="confirmPassword" type={showPw ? 'text' : 'password'} placeholder="Repeat" autoComplete="new-password" />
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', marginBottom: 16 }}>
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
                                {showPw ? <><EyeOff size={13} /> Hide passwords</> : <><Eye size={13} /> Show passwords</>}
                            </button>
                        </div>

                        {/* Selects */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div style={inputStyle}>
                                <label className="input-label">I Am A</label>
                                <select className="input" name="role" defaultValue="player">
                                    <option value="player">🏏 Player</option>
                                    <option value="coach">📋 Coach</option>
                                </select>
                            </div>
                            <div style={inputStyle}>
                                <label className="input-label">Player Type</label>
                                <select className="input" name="playerType" defaultValue="batsman">
                                    <option value="batsman">Batsman</option>
                                    <option value="bowler">Bowler</option>
                                    <option value="all-rounder">All-Rounder</option>
                                    <option value="wicket-keeper">WK-Batsman</option>
                                </select>
                            </div>
                            <div style={inputStyle}>
                                <label className="input-label">Experience</label>
                                <select className="input" name="experienceLevel" defaultValue="beginner">
                                    <option value="beginner">🌱 Beginner</option>
                                    <option value="intermediate">⚡ Intermediate</option>
                                    <option value="professional">🌟 Professional</option>
                                </select>
                            </div>
                            <div style={inputStyle}>
                                <label className="input-label">Batting Style</label>
                                <select className="input" name="battingStyle" defaultValue="right-handed">
                                    <option value="right-handed">Right-Handed</option>
                                    <option value="left-handed">Left-Handed</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ justifyContent: 'center', marginTop: 4 }}>
                            {loading ? <><Loader size={17} className="animate-spin" /> Creating Account...</> : <>Create Free Account <ChevronRight size={17} /></>}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: '#22c55e', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
