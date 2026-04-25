'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Eye, EyeOff, Loader } from 'lucide-react';
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
            if (u?.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, position: 'relative'
        }}>
            <div className="hero-orb" style={{ width: 400, height: 400, background: 'rgba(0,255,136,0.04)', top: '5%', right: '10%' }} />
            <div className="hero-orb" style={{ width: 300, height: 300, background: 'rgba(59,130,246,0.04)', bottom: '10%', left: '5%' }} />

            <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 14, flexDirection: 'column' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 16,
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(0,255,136,0.2)',
                            boxShadow: '0 8px 24px rgba(0,255,136,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            <img src="/icon.png" alt="Crick Buddy Logo" style={{ width: 56, height: 56, objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Crick-Buddy</span>
                    </Link>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 8 }}>Sign in to your account</p>
                </div>

                <div className="card" style={{ padding: 40 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 28, textAlign: 'center' }}>Welcome Back 🏏</h1>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 20 }}>
                            <label className="input-label">Email Address</label>
                            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>

                        <div style={{ marginBottom: 12, position: 'relative' }}>
                            <label className="input-label">Password</label>
                            <input className="input" type={showPw ? 'text' : 'password'} placeholder="Your password" value={password}
                                onChange={e => setPassword(e.target.value)} style={{ paddingRight: 48 }} />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{
                                position: 'absolute', right: 14, bottom: 13, background: 'none', border: 'none',
                                cursor: 'pointer', color: 'rgba(255,255,255,0.4)'
                            }}>
                                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: 28 }}>
                            <a href="#" style={{ color: '#00ff88', fontSize: 13, textDecoration: 'none' }}>Forgot password?</a>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
                            {loading ? <Loader size={18} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> : null}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                        Don't have an account?{' '}
                        <Link href="/register" style={{ color: '#00ff88', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
                    </div>
                </div>

                {/* Demo badge */}
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <button onClick={() => { setEmail('demo@crickbuddy.com'); setPassword('demo123'); }}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer' }}>
                        Try with demo credentials
                    </button>
                </div>
            </div>
        </div>
    );
}
