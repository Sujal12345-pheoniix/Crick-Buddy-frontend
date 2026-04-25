'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { LoadingSpinner, ScoreBadge, StatusBadge } from '@/components/ui';
import {
    Users, Upload, FileText, Database, Activity, Trash2, Edit,
    Search, RefreshCw, Shield, TrendingUp, ChevronLeft, ChevronRight,
    X, Save, AlertTriangle, BarChart3, Settings, Home, LogOut
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

// ─── Sidebar ────────────────────────────────────────────────────────────────
const adminNav = [
    { key: 'overview', icon: Home, label: 'Overview' },
    { key: 'users', icon: Users, label: 'Users' },
    { key: 'uploads', icon: Upload, label: 'Uploads' },
    { key: 'reports', icon: FileText, label: 'Reports' },
    { key: 'database', icon: Database, label: 'Database' },
    { key: 'settings', icon: Settings, label: 'Settings' },
];

const PIE_COLORS = ['#00ff88', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

// ─── Edit User Modal ─────────────────────────────────────────────────────────
function EditUserModal({ user, onClose, onSave }: { user: any; onClose: () => void; onSave: (u: any) => void }) {
    const [form, setForm] = useState({ name: user.name, email: user.email, role: user.role, experienceLevel: user.experienceLevel, playerType: user.playerType });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.updateUser(user.id, form);
            onSave(res.data.user);
            toast.success('User updated');
            onClose();
        } catch { toast.error('Update failed'); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
            <div style={{ position: 'relative', background: '#111829', borderRadius: 16, padding: 32, width: 460, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800 }}>Edit User</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                {(['name', 'email'] as const).map(field => (
                    <div key={field} style={{ marginBottom: 14 }}>
                        <label className="input-label" style={{ textTransform: 'capitalize' }}>{field}</label>
                        <input className="input" value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
                    </div>
                ))}
                {[
                    { label: 'Role', key: 'role', opts: ['player', 'coach', 'admin'] },
                    { label: 'Experience', key: 'experienceLevel', opts: ['beginner', 'intermediate', 'professional'] },
                    { label: 'Player Type', key: 'playerType', opts: ['batsman', 'bowler', 'all-rounder', 'wicket-keeper'] },
                ].map(({ label, key, opts }) => (
                    <div key={key} style={{ marginBottom: 14 }}>
                        <label className="input-label">{label}</label>
                        <select className="input" value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}>
                            {opts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                ))}
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                    <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : <><Save size={15} /> Save Changes</>}
                    </button>
                    <button className="btn-secondary" style={{ justifyContent: 'center', padding: '0 20px' }} onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

// ─── Confirm Delete Modal ────────────────────────────────────────────────────
function ConfirmModal({ title, desc, onConfirm, onClose }: any) {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
            <div style={{ position: 'relative', background: '#111829', borderRadius: 16, padding: 32, width: 400, border: '1px solid rgba(255,71,87,0.3)', textAlign: 'center' }}>
                <AlertTriangle size={40} color="#ff4757" style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24, fontSize: 14 }}>{desc}</p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onConfirm} style={{ flex: 1, background: '#ff4757', border: 'none', borderRadius: 8, padding: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                    <button onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────
export default function AdminPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [uploads, setUploads] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editUser, setEditUser] = useState<any>(null);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);

    useEffect(() => {
        if (!user) { router.push('/login'); return; }
        if (user.role !== 'admin') { toast.error('Admin access required'); router.push('/dashboard'); return; }
        fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            const res = await adminAPI.getStats();
            setStats(res.data.stats);
        } catch { toast.error('Failed to load stats'); }
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getUsers({ page, limit: 15, search, role: roleFilter });
            setUsers(res.data.users || []);
            setTotalPages(res.data.pages || 1);
        } catch { } finally { setLoading(false); }
    }, [page, search, roleFilter]);

    const fetchUploads = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getUploads({ page, limit: 15 });
            setUploads(res.data.uploads || []);
            setTotalPages(res.data.pages || 1);
        } catch { } finally { setLoading(false); }
    }, [page]);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getReports({ page, limit: 15 });
            setReports(res.data.reports || []);
            setTotalPages(res.data.pages || 1);
        } catch { } finally { setLoading(false); }
    }, [page]);

    const fetchCollections = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getCollections();
            setCollections(res.data.collections || []);
        } catch { } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        setPage(1);
        if (tab === 'users') fetchUsers();
        if (tab === 'uploads') fetchUploads();
        if (tab === 'reports') fetchReports();
        if (tab === 'database') fetchCollections();
    }, [tab]);

    useEffect(() => {
        if (tab === 'users') fetchUsers();
    }, [page, search, roleFilter]);

    useEffect(() => {
        if (tab === 'uploads') fetchUploads();
        if (tab === 'reports') fetchReports();
    }, [page]);

    const handleDeleteUser = async () => {
        try {
            await adminAPI.deleteUser(deleteTarget.id);
            toast.success('User deleted');
            setDeleteTarget(null);
            fetchUsers();
        } catch (e: any) { toast.error(e.response?.data?.message || 'Delete failed'); }
    };

    const handleDeleteUpload = async () => {
        try {
            await adminAPI.deleteUpload(deleteTarget.id);
            toast.success('Upload deleted');
            setDeleteTarget(null);
            fetchUploads();
        } catch { toast.error('Delete failed'); }
    };

    const handleDeleteReport = async () => {
        try {
            await adminAPI.deleteReport(deleteTarget.id);
            toast.success('Report deleted');
            setDeleteTarget(null);
            fetchReports();
        } catch { toast.error('Delete failed'); }
    };

    // ─── Overview Tab ──────────────────────────────────────────────────────────
    const OverviewTab = () => {
        if (!stats) return <LoadingSpinner />;
        const uploadsByType = (stats.uploadsByType || []).map((u: any) => ({ name: u._id, value: u.count }));
        const uploadsByStatus = (stats.uploadsByStatus || []).map((u: any) => ({ name: u._id, value: u.count }));
        const signupData = (stats.signupsByMonth || []).map((s: any) => ({
            month: `${s._id.year}/${String(s._id.month).padStart(2, '0')}`,
            signups: s.count
        }));

        return (
            <div>
                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 }}>
                    {[
                        { label: 'Total Users', value: stats.totalUsers, color: '#00ff88', icon: <Users size={20} /> },
                        { label: 'Players', value: stats.players, color: '#3b82f6', icon: <Activity size={20} /> },
                        { label: 'Coaches', value: stats.coaches, color: '#f59e0b', icon: <Shield size={20} /> },
                        { label: 'Total Uploads', value: stats.totalUploads, color: '#8b5cf6', icon: <Upload size={20} /> },
                        { label: 'Analysis Rate', value: `${stats.processingRate}%`, color: '#ec4899', icon: <TrendingUp size={20} /> },
                    ].map(k => (
                        <div key={k.label} className="card" style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</span>
                                <div style={{ color: k.color }}>{k.icon}</div>
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: k.color }}>{k.value}</div>
                        </div>
                    ))}
                </div>

                {/* Charts row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
                    {/* Signups over time */}
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>User Signups (Last 6 Months)</h3>
                        {signupData.length === 0 ? (
                            <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 40 }}>No data yet</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={signupData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                                    <Tooltip contentStyle={{ background: '#161d30', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 8, fontSize: 12 }} />
                                    <Bar dataKey="signups" fill="#00ff88" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Uploads by type */}
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Uploads by Type</h3>
                        {uploadsByType.length === 0 ? (
                            <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 40 }}>No data yet</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={uploadsByType} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                                        {uploadsByType.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#161d30', borderRadius: 8, border: 'none', fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Uploads by status */}
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>By Status</h3>
                        {uploadsByStatus.map((s: any, i: number) => (
                            <div key={i} style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                                    <span style={{ color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>{s.name}</span>
                                    <span style={{ fontWeight: 700, color: PIE_COLORS[i] }}>{s.value}</span>
                                </div>
                                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
                                    <div style={{ height: '100%', width: `${Math.min(100, (s.value / (stats.totalUploads || 1)) * 100)}%`, background: PIE_COLORS[i], borderRadius: 4 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent activity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Recent Users</h3>
                        {(stats.recentUsers || []).map((u: any) => (
                            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #00ff88, #00c864)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0a0e1a', flexShrink: 0, fontSize: 14 }}>
                                    {u.name?.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{u.email}</div>
                                </div>
                                <span style={{ fontSize: 11, background: u.role === 'admin' ? 'rgba(255,71,87,0.1)' : u.role === 'coach' ? 'rgba(245,158,11,0.1)' : 'rgba(0,255,136,0.1)', color: u.role === 'admin' ? '#ff4757' : u.role === 'coach' ? '#f59e0b' : '#00ff88', padding: '2px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'capitalize' }}>
                                    {u.role}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Recent Uploads</h3>
                        {(stats.recentUploads || []).map((u: any) => (
                            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                                    {u.type === 'batting' ? '🏏' : u.type === 'bowling' ? '⚡' : '📸'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{u.type} Analysis</div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{u.user?.name || 'Unknown'}</div>
                                </div>
                                <StatusBadge status={u.status} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // ─── Users Tab ────────────────────────────────────────────────────────────
    const UsersTab = () => (
        <div>
            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                    <input className="input" placeholder="Search by name or email..." value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        style={{ paddingLeft: 40 }} />
                </div>
                <select className="input" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} style={{ width: 160, cursor: 'pointer' }}>
                    <option value="">All Roles</option>
                    <option value="player">Player</option>
                    <option value="coach">Coach</option>
                    <option value="admin">Admin</option>
                </select>
                <button className="btn-secondary" onClick={fetchUsers} style={{ padding: '0 14px', flexShrink: 0 }}>
                    <RefreshCw size={15} />
                </button>
            </div>

            {loading ? <LoadingSpinner /> : (
                <>
                    <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Level</th>
                                    <th>Type</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>No users found</td></tr>
                                ) : users.map((u: any) => (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #00ff88, #00c864)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0a0e1a', fontSize: 14, flexShrink: 0 }}>
                                                    {u.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: 11, background: u.role === 'admin' ? 'rgba(255,71,87,0.12)' : u.role === 'coach' ? 'rgba(245,158,11,0.12)' : 'rgba(0,255,136,0.12)', color: u.role === 'admin' ? '#ff4757' : u.role === 'coach' ? '#f59e0b' : '#00ff88', padding: '3px 10px', borderRadius: 20, fontWeight: 700, textTransform: 'capitalize' }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 13, textTransform: 'capitalize', color: 'rgba(255,255,255,0.6)' }}>{u.experienceLevel}</td>
                                        <td style={{ fontSize: 13, textTransform: 'capitalize', color: 'rgba(255,255,255,0.6)' }}>{u.playerType}</td>
                                        <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button onClick={() => setEditUser(u)} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 6, padding: '5px 10px', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                                                    <Edit size={12} /> Edit
                                                </button>
                                                <button onClick={() => setDeleteTarget({ id: u.id, type: 'user', name: u.name })} style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 6, padding: '5px 10px', color: '#ff4757', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                                                    <Trash2 size={12} /> Del
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination/>
                </>
            )}
        </div>
    );

    // ─── Uploads Tab ──────────────────────────────────────────────────────────
    const UploadsTab = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>All Uploads</h3>
                <button className="btn-secondary" onClick={fetchUploads}><RefreshCw size={15} /></button>
            </div>
            {loading ? <LoadingSpinner /> : (
                <>
                    <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
                        <table className="data-table">
                            <thead>
                                <tr><th>File</th><th>User</th><th>Type</th><th>Status</th><th>Date</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {uploads.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>No uploads</td></tr>
                                ) : uploads.map((u: any) => (
                                    <tr key={u.id}>
                                        <td style={{ fontSize: 13, maxWidth: 220 }}>
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.originalName || u.filename}</div>
                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{u.id}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>{u.user?.name || 'Deleted'}</div>
                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{u.user?.email}</div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: 12, textTransform: 'capitalize' }}>
                                                {u.type === 'batting' ? '🏏' : u.type === 'bowling' ? '⚡' : '📸'} {u.type}
                                            </span>
                                        </td>
                                        <td><StatusBadge status={u.status} /></td>
                                        <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button onClick={() => setDeleteTarget({ id: u.id, type: 'upload', name: u.originalName })} style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 6, padding: '5px 10px', color: '#ff4757', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination />
                </>
            )}
        </div>
    );

    // ─── Reports Tab ──────────────────────────────────────────────────────────
    const ReportsTab = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>All Analysis Reports</h3>
                <button className="btn-secondary" onClick={fetchReports}><RefreshCw size={15} /></button>
            </div>
            {loading ? <LoadingSpinner /> : (
                <>
                    <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
                        <table className="data-table">
                            <thead>
                                <tr><th>Player</th><th>Type</th><th>Score</th><th>Date</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {reports.length === 0 ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>No reports</td></tr>
                                ) : reports.map((r: any) => (
                                    <tr key={r.id}>
                                        <td>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>{r.user?.name || 'Deleted'}</div>
                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{r.user?.email}</div>
                                        </td>
                                        <td style={{ fontSize: 13, textTransform: 'capitalize' }}>
                                            {r.type === 'batting' ? '🏏' : r.type === 'bowling' ? '⚡' : '📸'} {r.type}
                                        </td>
                                        <td><ScoreBadge score={r.overallScore || 0} size="sm" /></td>
                                        <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button onClick={() => setDeleteTarget({ id: r.id, type: 'report', name: `${r.type} report` })} style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 6, padding: '5px 10px', color: '#ff4757', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination />
                </>
            )}
        </div>
    );

    // ─── Database Tab ─────────────────────────────────────────────────────────
    const DatabaseTab = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>📦 PostgreSQL Tables</h3>
                <button className="btn-secondary" onClick={fetchCollections}><RefreshCw size={15} /></button>
            </div>
            {loading ? <LoadingSpinner /> : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                        {collections.map(c => (
                            <div key={c.name} className="card" style={{ padding: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{c.name}</span>
                                    <Database size={16} color="#00ff88" />
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 900 }}>{c.count}</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Records tracked</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 28, padding: '16px 20px', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#00ff88', marginBottom: 6 }}>Connection Info</div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                            📡 PostgreSQL · {process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'} → Backend → Prisma → PostgreSQL
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                            All writes/reads go through the secure Express API. Direct DB access is not exposed.
                        </div>
                    </div>
                </>
            )}
        </div>
    );


    // ─── Settings Tab ─────────────────────────────────────────────────────────
    const SettingsTab = () => (
        <div style={{ maxWidth: 600 }}>
            <div className="card" style={{ padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>System Information</h3>
                {[
                    { label: 'Platform', value: 'Crick-Buddy Cricket AI v1.0' },
                    { label: 'Backend', value: 'Node.js + Express + PostgreSQL' },
                    { label: 'AI Service', value: 'Python FastAPI + MediaPipe + OpenCV' },
                    { label: 'Frontend', value: 'Next.js 14 + TailwindCSS' },
                    { label: 'Database', value: 'PostgreSQL (Prisma ORM)' },
                    { label: 'Auth', value: 'JWT (HS256) + bcryptjs' },
                    { label: 'Admin', value: user?.email },
                ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{row.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#00ff88' }}>{row.value}</span>
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Link href="/dashboard" className="btn-secondary" style={{ textDecoration: 'none', justifyContent: 'flex-start', padding: '12px 16px' }}>
                        <Home size={16} /> Go to Player Dashboard
                    </Link>
                    <a href="/api/health" target="_blank" className="btn-secondary" style={{ textDecoration: 'none', justifyContent: 'flex-start', padding: '12px 16px' }}>
                        <Activity size={16} /> Check API Health
                    </a>
                    <button className="btn-secondary" style={{ justifyContent: 'flex-start', padding: '12px 16px', color: '#ff4757' }} onClick={logout}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );

    // ─── Pagination ───────────────────────────────────────────────────────────
    const Pagination = () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Page {page} of {totalPages}</span>
            <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-secondary" style={{ padding: '6px 14px' }} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft size={16} />
                </button>
                <button className="btn-secondary" style={{ padding: '6px 14px' }} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Admin Sidebar */}
            <div style={{ width: 220, flexShrink: 0, background: '#0a0e1a', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
                {/* Logo */}
                <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Shield size={20} color="#ff4757" />
                        <span style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>Admin Panel</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Crick-Buddy Cricket AI</div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '12px 0' }}>
                    {adminNav.map(item => (
                        <button key={item.key} onClick={() => setTab(item.key)} style={{
                            width: '100%', padding: '10px 20px', background: tab === item.key ? 'rgba(255,71,87,0.12)' : 'none',
                            border: 'none', borderLeft: tab === item.key ? '3px solid #ff4757' : '3px solid transparent',
                            color: tab === item.key ? '#ff4757' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                            fontSize: 14, fontWeight: tab === item.key ? 700 : 500, transition: 'all 0.15s'
                        }}>
                            <item.icon size={17} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* User */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#ff4757', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: 13 }}>
                            {user?.name?.charAt(0)}
                        </div>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{user?.name?.split(' ')[0]}</div>
                            <div style={{ fontSize: 10, color: '#ff4757', fontWeight: 600 }}>Administrator</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                {/* Top bar */}
                <div style={{ height: 56, background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 800 }}>
                            {adminNav.find(n => n.key === tab)?.label}
                        </h2>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <Link href="/dashboard" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Home size={14} /> Player View
                        </Link>
                        <button onClick={fetchStats} style={{ background: 'none', border: 'none', color: '#00ff88', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>
                </div>

                {/* Page content */}
                <div style={{ padding: '28px 32px' }}>
                    {tab === 'overview' && <OverviewTab />}
                    {tab === 'users' && <UsersTab />}
                    {tab === 'uploads' && <UploadsTab />}
                    {tab === 'reports' && <ReportsTab />}
                    {tab === 'database' && <DatabaseTab />}
                    {tab === 'settings' && <SettingsTab />}
                </div>
            </div>

            {/* Modals */}
            {editUser && (
                <EditUserModal
                    user={editUser}
                    onClose={() => setEditUser(null)}
                    onSave={(updated) => { setUsers(us => us.map(u => u.id === updated.id ? updated : u)); }}
                />
            )}
            {deleteTarget && (
                <ConfirmModal
                    title={`Delete ${deleteTarget.type}?`}
                    desc={`"${deleteTarget.name}" will be permanently deleted. This cannot be undone.`}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={
                        deleteTarget.type === 'user' ? handleDeleteUser :
                            deleteTarget.type === 'upload' ? handleDeleteUpload :
                                handleDeleteReport
                    }
                />
            )}
        </div>
    );
}
