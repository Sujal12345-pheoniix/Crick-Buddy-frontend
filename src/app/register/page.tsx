'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BrandMark, BrandName } from '@/components/Sidebar';
import { Loader, ChevronRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

type RegisterForm = {
    name: string; email: string; password: string; confirmPassword: string;
    role: string; playerType: string; experienceLevel: string; battingStyle: string; bowlingStyle: string;
};

const PROOF = [
    'Upload a single shot or delivery filmed side-on',
    'Get a scored breakdown of stance, swing, balance and release',
    'Follow drills matched to your role and level, and track the gains',
];

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [playerType, setPlayerType] = useState('batsman');
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
            playerType: playerType,
            experienceLevel: String(fd.get('experienceLevel') || 'beginner'),
            battingStyle: String(fd.get('battingStyle') || 'none'),
            bowlingStyle: String(fd.get('bowlingStyle') || 'none'),
        };
        if (!form.name || !form.email) return toast.error('Name and email are required');
        if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        setLoading(true);
        try {
            await register(form);
            toast.success('Account created — welcome to CrickBuddy');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
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
                        <div className="eyebrow">Join the squad</div>
                        <h1 style={{ fontSize: 'clamp(40px, 5vw, 72px)', marginTop: 14 }}>Take guard.</h1>
                        <p className="lede" style={{ marginTop: 16 }}>
                            Frame-by-frame technique analysis for batters and bowlers, with a coach&apos;s eye for detail.
                        </p>
                        <hr className="seam" style={{ margin: '28px 0' }} />
                        <div className="label" style={{ marginBottom: 14 }}>How it works</div>
                        <ul className="ticks">
                            {PROOF.map(p => <li key={p}>{p}</li>)}
                        </ul>
                    </div>

                    <p className="muted small">Free to start. No card needed.</p>
                </div>
            </aside>

            {/* Form */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(32px, 6vw, 64px) 16px' }}>
                <div style={{ width: '100%', maxWidth: 500 }}>
                    <div className="show-mobile">
                        <div style={{ marginBottom: 28 }}>
                            <Link href="/" className="row" style={{ gap: 12 }} aria-label="CrickBuddy home">
                                <BrandMark /><BrandName />
                            </Link>
                        </div>
                    </div>

                    <div className="card card-raised rise rise-1" style={{ padding: 'clamp(22px, 4.5vw, 34px)' }}>
                        <div className="eyebrow">Create account</div>
                        <h2 style={{ marginTop: 10 }}>Join CrickBuddy</h2>
                        <p className="muted small" style={{ marginTop: 6, marginBottom: 26 }}>Free account — no credit card needed.</p>

                        <form onSubmit={handleSubmit} className="stack" style={{ gap: 18 }}>
                            <div className="field">
                                <label className="input-label" htmlFor="reg-name">Full name</label>
                                <input id="reg-name" className="input" name="name" placeholder="Virat Sharma" autoComplete="name" autoCapitalize="words" />
                            </div>
                            <div className="field">
                                <label className="input-label" htmlFor="reg-email">Email address</label>
                                <input id="reg-email" className="input" name="email" type="email" placeholder="you@example.com" autoComplete="email" inputMode="email" />
                            </div>

                            <div>
                                <div className="grid-2" style={{ gap: 14 }}>
                                    <div className="field">
                                        <label className="input-label" htmlFor="reg-password">Password</label>
                                        <input id="reg-password" className="input" name="password" type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" autoComplete="new-password" />
                                    </div>
                                    <div className="field">
                                        <label className="input-label" htmlFor="reg-confirm">Confirm password</label>
                                        <input id="reg-confirm" className="input" name="confirmPassword" type={showPw ? 'text' : 'password'} placeholder="Repeat password" autoComplete="new-password" />
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', marginTop: 6 }}>
                                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowPw(!showPw)} aria-pressed={showPw}>
                                        {showPw ? <><EyeOff size={14} /> Hide passwords</> : <><Eye size={14} /> Show passwords</>}
                                    </button>
                                </div>
                            </div>

                            <hr className="seam" />

                            <div className="label">Your cricket</div>
                            <div className="grid-2" style={{ gap: 14 }}>
                                <div className="field">
                                    <label className="input-label" htmlFor="reg-role">I am a</label>
                                    <select id="reg-role" className="input" name="role" defaultValue="player">
                                        <option value="player">Player</option>
                                        <option value="coach">Coach</option>
                                    </select>
                                </div>
                                <div className="field">
                                    <label className="input-label" htmlFor="reg-playerType">Player type</label>
                                    <select id="reg-playerType" className="input" name="playerType" value={playerType} onChange={(e) => setPlayerType(e.target.value)}>
                                        <option value="batsman">Batsman</option>
                                        <option value="bowler">Bowler</option>
                                        <option value="all-rounder">All-Rounder</option>
                                        <option value="wicket-keeper">WK-Batsman</option>
                                    </select>
                                </div>
                                <div className="field">
                                    <label className="input-label" htmlFor="reg-experience">Experience</label>
                                    <select id="reg-experience" className="input" name="experienceLevel" defaultValue="beginner">
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="professional">Professional</option>
                                    </select>
                                </div>
                                {(playerType === 'batsman' || playerType === 'all-rounder' || playerType === 'wicket-keeper') && (
                                    <div className="field">
                                        <label className="input-label" htmlFor="reg-batting">Batting style</label>
                                        <select id="reg-batting" className="input" name="battingStyle" defaultValue="right-handed">
                                            <option value="right-handed">Right-Handed</option>
                                            <option value="left-handed">Left-Handed</option>
                                        </select>
                                    </div>
                                )}
                                {(playerType === 'bowler' || playerType === 'all-rounder') && (
                                    <div className="field">
                                        <label className="input-label" htmlFor="reg-bowling">Bowling style</label>
                                        <select id="reg-bowling" className="input" name="bowlingStyle" defaultValue="right-arm-fast">
                                            <option value="right-arm-fast">Right-Arm Fast</option>
                                            <option value="right-arm-medium">Right-Arm Medium</option>
                                            <option value="right-arm-spin">Right-Arm Spin</option>
                                            <option value="left-arm-fast">Left-Arm Fast</option>
                                            <option value="left-arm-medium">Left-Arm Medium</option>
                                            <option value="left-arm-spin">Left-Arm Spin</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 6 }}>
                                {loading ? <><Loader size={17} className="animate-spin" /> Creating account…</> : <>Create free account <ChevronRight size={17} /></>}
                            </button>
                        </form>

                        <hr className="divider" />

                        <p className="muted small" style={{ textAlign: 'center' }}>
                            Already have an account?{' '}
                            <Link href="/login" className="link" style={{ fontWeight: 600 }}>Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
