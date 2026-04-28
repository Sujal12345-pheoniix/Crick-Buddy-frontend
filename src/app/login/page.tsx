'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return toast.error('Please fill all fields');
        setLoading(true);
        try {
            const u = await login(email, password);
            toast.success('Welcome back! 🏏');
            router.push(u?.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
            {/* Background orbs */}
            <div className="hero-orb" style={{ width: 500, height: 500, background: 'rgba(34,197,94,0.05)', top: '-10%', right: '-5%' }} />
            <div className="hero-orb" style={{ width: 350, height: 350, background: 'rgba(99,102,241,0.04)', bottom: '-5%', left: '-5%', animationDelay: '2s' }} />

            <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <Link href="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', boxShadow: '0 8px 32px rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <img src="/icon.png" alt="Crick Buddy" style={{ width: 52, height: 52, objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Crick-Buddy</span>
                    </Link>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Sign in to your cricket dashboard</p>
                </div>

                <div className="card" style={{ padding: 'clamp(24px,5vw,36px)' }}>
                    <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, textAlign: 'center' }}>Welcome Back 🏏</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', marginBottom: 28 }}>Continue your journey to cricket excellence</p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 18 }}>
                            <label className="input-label">Email Address</label>
                            <input className="input" type="email" placeholder="you@example.com" value={email}
                                onChange={e => setEmail(e.target.value)} autoComplete="email" inputMode="email" />
                        </div>

                        <div style={{ marginBottom: 12, position: 'relative' }}>
                            <label className="input-label">Password</label>
                            <input className="input" type={showPw ? 'text' : 'password'} placeholder="Your password" value={password}
                                onChange={e => setPassword(e.target.value)} style={{ paddingRight: 48 }} autoComplete="current-password" />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, bottom: 13, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: 26 }}>
                            <a href="#" style={{ color: '#22c55e', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
                        </div>

                        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ justifyContent: 'center' }}>
                            {loading ? <><Loader size={17} className="animate-spin" /> Signing in...</> : <>Sign In <ChevronRight size={17} /></>}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: 'var(--text-muted)' }}>
                        Don't have an account?{' '}
                        <Link href="/register" style={{ color: '#22c55e', fontWeight: 700, textDecoration: 'none' }}>Create one free</Link>
                    </div>
                </div>

                {/* Demo credentials */}
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <button onClick={() => { setEmail('demo@crickbuddy.com'); setPassword('demo123'); }}
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 18px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}>
                        🎮 Try with demo credentials
                    </button>
                </div>
            </div>
        </div>
    );
}
