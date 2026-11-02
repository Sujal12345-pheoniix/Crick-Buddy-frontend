'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BrandMark, BrandName } from '@/components/Sidebar';
import { Eye, EyeOff, Loader, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const PROOF = [
    'Bat path, head position and balance through every frame of the shot',
    'Front-foot landing, arm path and release point for bowlers',
    'A scored breakdown with drills that target what matters most',
];

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
            toast.success('Welcome back');
            router.push(u?.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="grid-2" style={{ minHeight: '100dvh', gap: 0, background: 'var(--navy-1000)' }}>
            {/* Brand panel — desktop only */}
            <aside className="hero hide-mobile" style={{ display: 'flex', borderRight: '1px solid var(--line)' }}>
                <div className="pitch-stripes" aria-hidden="true" style={{ position: 'absolute', inset: 0 }} />
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 48, padding: 'clamp(32px, 5vw, 64px)', width: '100%' }}>
                    <Link href="/" className="row" style={{ gap: 12 }} aria-label="CrickBuddy home">
                        <BrandMark /><BrandName />
                    </Link>

                    <div className="rise" style={{ maxWidth: 520 }}>
                        <div className="eyebrow">Members&apos; pavilion</div>
                        <h1 style={{ fontSize: 'clamp(40px, 5vw, 72px)', marginTop: 14 }}>Back to the nets.</h1>
                        <p className="lede" style={{ marginTop: 16 }}>
                            Pick up where you left off — your reports, drills and progress are waiting.
                        </p>
                        <hr className="seam" style={{ margin: '28px 0' }} />
                        <div className="label" style={{ marginBottom: 14 }}>What every analysis measures</div>
                        <ul className="ticks">
                            {PROOF.map(p => <li key={p}>{p}</li>)}
                        </ul>
                    </div>

                    <p className="muted small">Film side-on. Upload. Get a coach&apos;s read in minutes.</p>
                </div>
            </aside>

            {/* Form */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(32px, 6vw, 64px) 16px' }}>
                <div style={{ width: '100%', maxWidth: 440 }}>
                    <div className="show-mobile">
                        <div style={{ marginBottom: 28 }}>
                            <Link href="/" className="row" style={{ gap: 12 }} aria-label="CrickBuddy home">
                                <BrandMark /><BrandName />
                            </Link>
                        </div>
                    </div>

                    <div className="card card-raised rise rise-1" style={{ padding: 'clamp(24px, 5vw, 36px)' }}>
                        <div className="eyebrow">Sign in</div>
                        <h2 style={{ marginTop: 10 }}>Welcome back</h2>
                        <p className="muted small" style={{ marginTop: 6, marginBottom: 26 }}>Sign in to your CrickBuddy account.</p>

                        <form onSubmit={handleSubmit} className="stack" style={{ gap: 18 }}>
                            <div className="field">
                                <label className="input-label" htmlFor="login-email">Email address</label>
                                <input id="login-email" className="input" type="email" placeholder="you@example.com" value={email}
                                    onChange={e => setEmail(e.target.value)} autoComplete="email" inputMode="email" />
                            </div>

                            <div className="field">
                                <div className="row-between">
                                    <label className="input-label" htmlFor="login-password">Password</label>
                                    <a href="#" className="link small muted">Forgot password?</a>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input id="login-password" className="input" type={showPw ? 'text' : 'password'} placeholder="Your password" value={password}
                                        onChange={e => setPassword(e.target.value)} style={{ paddingRight: 52 }} autoComplete="current-password" />
                                    <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowPw(!showPw)}
                                        aria-label={showPw ? 'Hide password' : 'Show password'} aria-pressed={showPw}
                                        style={{ position: 'absolute', right: 6, top: 6 }}>
                                        {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 6 }}>
                                {loading ? <><Loader size={17} className="animate-spin" /> Signing in…</> : <>Sign in <ChevronRight size={17} /></>}
                            </button>
                        </form>

                        <hr className="divider" />

                        <p className="muted small" style={{ textAlign: 'center' }}>
                            New to CrickBuddy?{' '}
                            <Link href="/register" className="link" style={{ fontWeight: 600 }}>Create an account</Link>
                        </p>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 16 }} className="rise rise-2">
                        <button type="button" className="btn btn-ghost btn-sm"
                            onClick={() => { setEmail('demo@crickbuddy.com'); setPassword('demo123'); }}>
                            Try with demo credentials
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
