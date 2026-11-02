'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { PageHeader } from '@/components/ui';
import { usersAPI } from '@/lib/api';
import { Save, Loader, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const PLAYER_TYPES = [
    { value: 'batsman', label: 'Batsman' }, { value: 'bowler', label: 'Bowler' },
    { value: 'all-rounder', label: 'All-Rounder' }, { value: 'wicket-keeper', label: 'WK-Batsman' },
];
const EXPERIENCE = [
    { value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'professional', label: 'Professional' },
];
const BATTING = [
    { value: 'right-handed', label: 'Right-Handed' }, { value: 'left-handed', label: 'Left-Handed' },
];

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        playerType: user?.playerType || 'batsman',
        experienceLevel: user?.experienceLevel || 'beginner',
        battingStyle: user?.battingStyle || 'right-handed',
        bowlingStyle: user?.bowlingStyle || 'none',
    });
    const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await usersAPI.updateProfile(form);
            updateUser(res.data.user);
            toast.success('Profile updated!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally { setLoading(false); }
    };

    const handlePwChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pw.newPassword !== pw.confirmPassword) return toast.error('Passwords do not match');
        setPwLoading(true);
        try {
            await usersAPI.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
            toast.success('Password changed!');
            setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Password change failed');
        } finally { setPwLoading(false); }
    };

    const select = (id: string, label: string, name: keyof typeof form, options: { value: string; label: string }[]) => (
        <div className="field">
            <label className="input-label" htmlFor={id}>{label}</label>
            <select id={id} className="input" name={name} value={form[name]} onChange={handleChange}>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );

    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <div className="page">
                    <PageHeader
                        eyebrow="Account"
                        title="Settings"
                        description="Your profile shapes every analysis and drill — keep it current."
                    />

                    <div className="split rise rise-1">
                        {/* Profile */}
                        <section className="card card-pad" aria-labelledby="profile-heading">
                            <div className="card-head">
                                <h3 id="profile-heading">Profile</h3>
                            </div>

                            <div className="panel-black row" style={{ padding: 16, gap: 16, marginBottom: 22 }}>
                                <span className="avatar" style={{ width: 56, height: 56, fontSize: 24 }} aria-hidden="true">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 17, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                                    <div className="muted small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                                </div>
                                {user?.role && <span className="badge badge-white">{user.role}</span>}
                            </div>

                            <form onSubmit={handleSave}>
                                <div className="grid-2" style={{ gap: 16 }}>
                                    <div className="field" style={{ gridColumn: '1 / -1' }}>
                                        <label className="input-label" htmlFor="set-name">Full name</label>
                                        <input id="set-name" className="input" type="text" name="name" value={form.name} onChange={handleChange} autoComplete="name" />
                                    </div>
                                    <div className="field">
                                        <label className="input-label" htmlFor="set-phone">Phone</label>
                                        <input id="set-phone" className="input" type="text" name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} autoComplete="tel" inputMode="tel" />
                                    </div>
                                    {select('set-playerType', 'Player type', 'playerType', PLAYER_TYPES)}
                                    {select('set-experience', 'Experience level', 'experienceLevel', EXPERIENCE)}
                                    {select('set-batting', 'Batting style', 'battingStyle', BATTING)}
                                </div>

                                <div className="row" style={{ marginTop: 24 }}>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                                        {loading ? 'Saving…' : 'Save changes'}
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* Password */}
                        <section className="card card-pad" aria-labelledby="password-heading">
                            <div className="card-head">
                                <h3 id="password-heading">Change password</h3>
                                <span className="muted" style={{ display: 'inline-flex' }} aria-hidden="true"><Key size={17} /></span>
                            </div>
                            <p className="muted small" style={{ marginBottom: 20 }}>Use at least six characters, and nothing you use elsewhere.</p>

                            <form onSubmit={handlePwChange} className="stack">
                                <div className="field">
                                    <label className="input-label" htmlFor="set-current">Current password</label>
                                    <input id="set-current" className="input" type="password" name="currentPassword" placeholder="Current password" autoComplete="current-password"
                                        value={pw.currentPassword} onChange={e => setPw(p => ({ ...p, currentPassword: e.target.value }))} />
                                </div>
                                <div className="field">
                                    <label className="input-label" htmlFor="set-new">New password</label>
                                    <input id="set-new" className="input" type="password" name="newPassword" placeholder="Min 6 characters" autoComplete="new-password"
                                        value={pw.newPassword} onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))} />
                                </div>
                                <div className="field">
                                    <label className="input-label" htmlFor="set-confirm">Confirm new password</label>
                                    <input id="set-confirm" className="input" type="password" name="confirmPassword" placeholder="Repeat new password" autoComplete="new-password"
                                        value={pw.confirmPassword} onChange={e => setPw(p => ({ ...p, confirmPassword: e.target.value }))} />
                                </div>
                                <div className="row" style={{ marginTop: 8 }}>
                                    <button type="submit" className="btn btn-secondary" disabled={pwLoading}>
                                        {pwLoading ? 'Updating…' : 'Update password'}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
