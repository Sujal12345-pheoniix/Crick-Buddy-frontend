'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { usersAPI } from '@/lib/api';
import { Save, Loader, Key } from 'lucide-react';
import toast from 'react-hot-toast';

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

    const Field = ({ label, name, type = 'text', placeholder, value, onChange }: any) => (
        <div style={{ marginBottom: 16 }}>
            <label className="input-label">{label}</label>
            <input className="input" type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} />
        </div>
    );

    const Select = ({ label, name, options, value, onChange }: any) => (
        <div style={{ marginBottom: 16 }}>
            <label className="input-label">{label}</label>
            <select className="input" name={name} value={value} onChange={onChange} style={{ cursor: 'pointer' }}>
                {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ padding: '32px 40px' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Settings ⚙️</h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)' }}>Manage your profile and account settings</p>
                </div>

                <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Profile */}
                    <div className="card" style={{ padding: 28 }}>
                        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 24 }}>Profile Information</h2>
                        <form onSubmit={handleSave}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #00ff88, #00c864)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#0a0e1a' }}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>{user?.email}</div>
                                    <div style={{ color: '#00ff88', fontSize: 12, fontWeight: 600, textTransform: 'capitalize', marginTop: 3 }}>{user?.role}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{ gridColumn: '1/-1' }}>
                                    <Field label="Full Name" name="name" value={form.name} onChange={handleChange} />
                                </div>
                                <Field label="Phone" name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
                                <Select label="Player Type" name="playerType" value={form.playerType} onChange={handleChange} options={[
                                    { value: 'batsman', label: 'Batsman' }, { value: 'bowler', label: 'Bowler' },
                                    { value: 'all-rounder', label: 'All-Rounder' }, { value: 'wicket-keeper', label: 'WK-Batsman' }
                                ]} />
                                <Select label="Experience Level" name="experienceLevel" value={form.experienceLevel} onChange={handleChange} options={[
                                    { value: 'beginner', label: '🌱 Beginner' }, { value: 'intermediate', label: '⚡ Intermediate' }, { value: 'professional', label: '🌟 Professional' }
                                ]} />
                                <Select label="Batting Style" name="battingStyle" value={form.battingStyle} onChange={handleChange} options={[
                                    { value: 'right-handed', label: 'Right-Handed' }, { value: 'left-handed', label: 'Left-Handed' }
                                ]} />
                            </div>

                            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '12px 32px' }} disabled={loading}>
                                {loading ? <Loader size={16} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> : <Save size={16} />}
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>

                    {/* Password */}
                    <div className="card" style={{ padding: 28 }}>
                        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Key size={18} /> Change Password
                        </h2>
                        <form onSubmit={handlePwChange}>
                            <Field label="Current Password" name="currentPassword" type="password" placeholder="Current password" value={pw.currentPassword} onChange={(e: any) => setPw(p => ({ ...p, currentPassword: e.target.value }))} />
                            <Field label="New Password" name="newPassword" type="password" placeholder="Min 6 characters" value={pw.newPassword} onChange={(e: any) => setPw(p => ({ ...p, newPassword: e.target.value }))} />
                            <Field label="Confirm Password" name="confirmPassword" type="password" placeholder="Repeat new password" value={pw.confirmPassword} onChange={(e: any) => setPw(p => ({ ...p, confirmPassword: e.target.value }))} />
                            <button type="submit" className="btn-secondary" style={{ justifyContent: 'center', padding: '12px 32px' }} disabled={pwLoading}>
                                {pwLoading ? 'Updating...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
