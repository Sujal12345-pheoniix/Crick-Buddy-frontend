'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    playerType: string;
    experienceLevel: string;
    battingStyle: string;
    bowlingStyle: string;
};

type FieldProps = {
    label: string;
    name: keyof RegisterForm;
    type?: string;
    placeholder?: string;
    defaultValue?: string;
};

type SelectProps = {
    label: string;
    name: keyof RegisterForm;
    options: Array<{ value: string; label: string }>;
    defaultValue?: string;
};

function Field({ label, name, type = 'text', placeholder, defaultValue = '' }: FieldProps) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label className="input-label">{label}</label>
            <input
                className="input"
                type={type}
                name={name}
                placeholder={placeholder}
                defaultValue={defaultValue}
                autoComplete={name === 'email' ? 'email' : name.toLowerCase().includes('password') ? 'new-password' : 'name'}
                inputMode={type === 'email' ? 'email' : type === 'password' ? 'text' : undefined}
                autoCapitalize={type === 'email' || name.toLowerCase().includes('password') ? 'none' : 'words'}
                autoCorrect={type === 'email' || name.toLowerCase().includes('password') ? 'off' : undefined}
                spellCheck={type === 'email' || name.toLowerCase().includes('password') ? false : undefined}
            />
        </div>
    );
}

function Select({ label, name, options, defaultValue = '' }: SelectProps) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label className="input-label">{label}</label>
            <select
                className="input"
                name={name}
                defaultValue={defaultValue}
                style={{ cursor: 'pointer', appearance: 'none' }}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );
}

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const form = {
            name: String(formData.get('name') || '').trim(),
            email: String(formData.get('email') || '').trim(),
            password: String(formData.get('password') || ''),
            confirmPassword: String(formData.get('confirmPassword') || ''),
            role: String(formData.get('role') || 'player'),
            playerType: String(formData.get('playerType') || 'batsman'),
            experienceLevel: String(formData.get('experienceLevel') || 'beginner'),
            battingStyle: String(formData.get('battingStyle') || 'right-handed'),
            bowlingStyle: 'none'
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
            <div style={{ width: '100%', maxWidth: 480 }}>
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
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
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 8 }}>Create your free account</p>
                </div>

                <div className="card" style={{ padding: 'clamp(24px, 5vw, 40px)' }}>
                    <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 28, textAlign: 'center' }}>Join Crick-Buddy 🏏</h1>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 12 }}>
                            <div style={{ gridColumn: '1 / -1' }}><Field label="Full Name" name="name" placeholder="Virat Sharma" /></div>
                            <div style={{ gridColumn: '1 / -1' }}><Field label="Email" name="email" type="email" placeholder="you@example.com" /></div>
                            <Field label="Password" name="password" type="password" placeholder="Min 6 chars" />
                            <Field label="Confirm Password" name="confirmPassword" type="password" placeholder="Repeat password" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 12, marginTop: 4 }}>
                            <Select label="I Am A" name="role" options={[
                                { value: 'player', label: '🏏 Player' },
                                { value: 'coach', label: '📋 Coach' }
                            ]} defaultValue="player" />
                            <Select label="Player Type" name="playerType" options={[
                                { value: 'batsman', label: 'Batsman' },
                                { value: 'bowler', label: 'Bowler' },
                                { value: 'all-rounder', label: 'All-Rounder' },
                                { value: 'wicket-keeper', label: 'WK-Batsman' }
                            ]} defaultValue="batsman" />
                            <Select label="Experience Level" name="experienceLevel" options={[
                                { value: 'beginner', label: '🌱 Beginner' },
                                { value: 'intermediate', label: '⚡ Intermediate' },
                                { value: 'professional', label: '🌟 Professional' }
                            ]} defaultValue="beginner" />
                            <Select label="Batting Style" name="battingStyle" options={[
                                { value: 'right-handed', label: 'Right-Handed' },
                                { value: 'left-handed', label: 'Left-Handed' }
                            ]} defaultValue="right-handed" />
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 8 }} disabled={loading}>
                            {loading ? <Loader size={18} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> : null}
                            {loading ? 'Creating Account...' : 'Create Free Account'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: '#00ff88', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
