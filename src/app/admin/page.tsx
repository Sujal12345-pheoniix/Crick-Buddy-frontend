'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { adminAPI } from '@/lib/api';
import { LoadingSpinner, StatusBadge, EmptyState, PageHeader, scoreBand } from '@/components/ui';
import {
    Users, Database, Activity, Trash2, Edit, Search, RefreshCw,
    ChevronLeft, ChevronRight, X, Save, AlertTriangle, Home, LogOut, Film, FileText, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ─── Tabs ───────────────────────────────────────────────────────────────────
const adminNav = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users' },
    { key: 'uploads', label: 'Uploads' },
    { key: 'reports', label: 'Reports' },
    { key: 'database', label: 'Database' },
    { key: 'settings', label: 'Settings' },
];

// Chart palette. Recharts draws SVG attributes, which cannot read CSS variables
// reliably, so the design-system values are mirrored here (white, navy-300, line).
const CHART = {
    bar: '#FFFFFF',
    axis: '#8AA2CF',
    grid: 'rgba(255,255,255,0.08)',
};

const roleBadge = (role: string) => role === 'admin' ? 'badge badge-white' : role === 'coach' ? 'badge badge-info' : 'badge';
const statusBand = (s: string) => s === 'completed' ? 'good' : s === 'failed' ? 'poor' : s === 'pending' ? 'fair' : '';
const initial = (name?: string) => (name?.trim().charAt(0) || '?').toUpperCase();
const fmtDate = (v: any) => {
    const d = v ? new Date(v) : null;
    return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
};

/** Shared overlay + dialog frame for the admin modals. */
function Dialog({ labelledBy, onClose, maxWidth, children }: { labelledBy: string; onClose: () => void; maxWidth: number; children: ReactNode }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div className="fade" style={{ position: 'absolute', inset: 0, background: 'var(--black)', opacity: 0.75, backdropFilter: 'blur(4px)' }} onClick={onClose} />
            <div role="dialog" aria-modal="true" aria-labelledby={labelledBy} className="card card-raised card-pad rise"
                style={{ position: 'relative', width: '100%', maxWidth, maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto', borderColor: 'var(--line-2)' }}>
                {children}
            </div>
        </div>
    );
}

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
        <Dialog labelledBy="edit-user-title" onClose={onClose} maxWidth={480}>
            <div className="row-between" style={{ marginBottom: 22 }}>
                <div>
                    <div className="eyebrow">Edit user</div>
                    <h3 id="edit-user-title" style={{ marginTop: 8, fontSize: 22 }}>{user.name}</h3>
                </div>
                <button type="button" className="btn btn-ghost btn-sm btn-icon" style={{ width: 34 }} onClick={onClose} aria-label="Close">
                    <X size={18} />
                </button>
            </div>
            <div className="stack" style={{ gap: 14 }}>
                {(['name', 'email'] as const).map(field => (
                    <div key={field} className="field">
                        <label className="input-label" htmlFor={`edit-${field}`} style={{ textTransform: 'capitalize' }}>{field}</label>
                        <input id={`edit-${field}`} className="input" type={field === 'email' ? 'email' : 'text'} value={form[field]}
                            onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
                    </div>
                ))}
                {[
                    { label: 'Role', key: 'role', opts: ['player', 'coach', 'admin'] },
                    { label: 'Experience', key: 'experienceLevel', opts: ['beginner', 'intermediate', 'professional'] },
                    { label: 'Player type', key: 'playerType', opts: ['batsman', 'bowler', 'all-rounder', 'wicket-keeper'] },
                ].map(({ label, key, opts }) => (
                    <div key={key} className="field">
                        <label className="input-label" htmlFor={`edit-${key}`}>{label}</label>
                        <select id={`edit-${key}`} className="input" value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                            style={{ textTransform: 'capitalize' }}>
                            {opts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                ))}
            </div>
            <div className="row wrap" style={{ gap: 10, marginTop: 24 }}>
                <button type="button" className="btn btn-primary" style={{ flex: '1 1 180px' }} onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving…' : <><Save size={15} /> Save changes</>}
                </button>
                <button type="button" className="btn btn-secondary" style={{ flex: '0 1 auto' }} onClick={onClose}>Cancel</button>
            </div>
        </Dialog>
    );
}

// ─── Confirm Delete Modal ────────────────────────────────────────────────────
function ConfirmModal({ title, desc, onConfirm, onClose }: any) {
    return (
        <Dialog labelledBy="confirm-title" onClose={onClose} maxWidth={420}>
            <span className="choice-icon" style={{ background: 'var(--poor-bg)', color: 'var(--poor)', marginBottom: 16 }}>
                <AlertTriangle size={20} />
            </span>
            <h3 id="confirm-title" style={{ fontSize: 22, marginBottom: 8 }}>{title}</h3>
            <p className="muted small" style={{ marginBottom: 24 }}>{desc}</p>
            <div className="row wrap" style={{ gap: 10 }}>
                <button type="button" className="btn btn-danger" style={{ flex: '1 1 140px' }} onClick={onConfirm}>
                    <Trash2 size={15} /> Delete
                </button>
                <button type="button" className="btn btn-secondary" style={{ flex: '1 1 140px' }} onClick={onClose}>Cancel</button>
            </div>
        </Dialog>
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

    // ─── Shared bits ──────────────────────────────────────────────────────────
    const SectionHead = ({ title, onRefresh }: { title: string; onRefresh: () => void }) => (
        <div className="card-head">
            <h3>{title}</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onRefresh} aria-label={`Refresh ${title.toLowerCase()}`}>
                <RefreshCw size={14} /> <span className="hide-mobile">Refresh</span>
            </button>
        </div>
    );

    const UserCell = ({ name, email }: { name?: string; email?: string }) => (
        <div className="row" style={{ gap: 12 }}>
            <span className="avatar" style={{ width: 34, height: 34, fontSize: 15 }} aria-hidden="true">{initial(name)}</span>
            <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{name || 'Deleted'}</div>
                {email && <div className="muted small" style={{ whiteSpace: 'nowrap' }}>{email}</div>}
            </div>
        </div>
    );

    const DeleteButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
        <button type="button" className="btn btn-danger btn-sm" onClick={onClick} aria-label={label}>
            <Trash2 size={13} /> <span className="hide-mobile">Delete</span>
        </button>
    );

    // ─── Overview Tab ──────────────────────────────────────────────────────────
    const OverviewTab = () => {
        if (!stats) return <LoadingSpinner />;
        const uploadsByType = (stats.uploadsByType || []).map((u: any) => ({ name: u._id, value: u.count }));
        const uploadsByStatus = (stats.uploadsByStatus || []).map((u: any) => ({ name: u._id, value: u.count }));
        const signupData = (stats.signupsByMonth || []).map((s: any) => ({
            month: `${s._id.year}/${String(s._id.month).padStart(2, '0')}`,
            signups: s.count
        }));
        const typeTotal = uploadsByType.reduce((n: number, t: any) => n + (t.value || 0), 0) || 1;

        const board = [
            { label: 'Total users', value: stats.totalUsers },
            { label: 'Players', value: stats.players },
            { label: 'Coaches', value: stats.coaches },
            { label: 'Uploads', value: stats.totalUploads },
            { label: 'Analysis rate', value: `${stats.processingRate}%`, band: scoreBand(Number(stats.processingRate)) },
        ];

        return (
            <div className="stack" style={{ gap: 20 }}>
                {/* Scoreboard strip */}
                <section className="panel-black crease rise rise-1" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 0 }}>
                        {board.map((b, i) => (
                            <div key={b.label} style={{ padding: '20px 22px', borderLeft: i ? '1px solid var(--line)' : 0 }}>
                                <div className="label">{b.label}</div>
                                <div className={`stat-value ${b.band ? `score-${b.band}` : ''}`} style={{ fontSize: 44 }}>{b.value ?? '—'}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Charts row */}
                <div className="split rise rise-2">
                    <section className="card card-pad">
                        <div className="card-head">
                            <h3>Sign-ups</h3>
                            <span className="label">Last 6 months</span>
                        </div>
                        {signupData.length === 0 ? (
                            <EmptyState icon={<BarChart3 size={24} />} title="No data yet" description="Monthly sign-ups appear here once players register." />
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={signupData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid vertical={false} stroke={CHART.grid} />
                                    <XAxis dataKey="month" stroke={CHART.axis} tick={{ fontSize: 11, fill: CHART.axis }} tickLine={false} axisLine={false} />
                                    <YAxis allowDecimals={false} stroke={CHART.axis} tick={{ fontSize: 11, fill: CHART.axis }} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: CHART.grid }}
                                        contentStyle={{ background: 'var(--navy-850)', border: '1px solid var(--line-2)', borderRadius: 10, fontSize: 12 }}
                                        labelStyle={{ color: 'var(--text-3)' }} itemStyle={{ color: 'var(--text)' }} />
                                    <Bar dataKey="signups" name="Sign-ups" fill={CHART.bar} radius={[4, 4, 0, 0]} maxBarSize={36} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </section>

                    <section className="card card-pad">
                        <div className="card-head"><h3>Uploads</h3></div>
                        <div className="label" style={{ marginBottom: 12 }}>By type</div>
                        {uploadsByType.length === 0 ? <p className="muted small">No uploads yet.</p> : (
                            <div className="stack" style={{ gap: 14 }}>
                                {uploadsByType.map((t: any) => (
                                    <div key={t.name}>
                                        <div className="row-between small">
                                            <span style={{ textTransform: 'capitalize', color: 'var(--text-2)' }}>{t.name}</span>
                                            <span className="tnum" style={{ fontWeight: 600 }}>{t.value}</span>
                                        </div>
                                        <div className="stat-meter" style={{ marginTop: 6 }}><i style={{ width: `${Math.max(2, (t.value / typeTotal) * 100)}%` }} /></div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <hr className="divider" />
                        <div className="label" style={{ marginBottom: 12 }}>By status</div>
                        {uploadsByStatus.length === 0 ? <p className="muted small">No uploads yet.</p> : (
                            <div className="stack" style={{ gap: 14 }}>
                                {uploadsByStatus.map((s: any, i: number) => (
                                    <div key={i}>
                                        <div className="row-between small">
                                            <StatusBadge status={s.name} />
                                            <span className="tnum" style={{ fontWeight: 600 }}>{s.value}</span>
                                        </div>
                                        <div className="stat-meter" style={{ marginTop: 8 }}>
                                            <i className={statusBand(s.name)} style={{ width: `${Math.min(100, (s.value / (stats.totalUploads || 1)) * 100)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Recent activity */}
                <div className="grid-2 rise rise-3">
                    <section className="card card-pad">
                        <div className="card-head"><h3>Recent users</h3></div>
                        {(stats.recentUsers || []).length === 0 ? <p className="muted small">No users yet.</p> : (
                            <div className="list">
                                {(stats.recentUsers || []).map((u: any) => (
                                    <div key={u.id} className="list-item">
                                        <span className="avatar" style={{ width: 34, height: 34, fontSize: 15 }} aria-hidden="true">{initial(u.name)}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                                            <div className="muted small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                                        </div>
                                        <span className={roleBadge(u.role)}>{u.role}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="card card-pad">
                        <div className="card-head"><h3>Recent uploads</h3></div>
                        {(stats.recentUploads || []).length === 0 ? <p className="muted small">No uploads yet.</p> : (
                            <div className="list">
                                {(stats.recentUploads || []).map((u: any) => (
                                    <div key={u.id} className="list-item">
                                        <span className="choice-icon" style={{ width: 34, height: 34, borderRadius: 10 }}><Film size={16} /></span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{u.type} analysis</div>
                                            <div className="muted small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.user?.name || 'Unknown'}</div>
                                        </div>
                                        <StatusBadge status={u.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        );
    };

    // ─── Users Tab ────────────────────────────────────────────────────────────
    const UsersTab = () => (
        <div className="rise rise-1">
            {/* Toolbar */}
            <div className="row wrap" style={{ gap: 10, marginBottom: 16 }}>
                <div style={{ position: 'relative', flex: '1 1 220px' }}>
                    <label htmlFor="admin-user-search" className="sr-only">Search users</label>
                    <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                    <input id="admin-user-search" type="search" className="input" placeholder="Search by name or email" value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        style={{ paddingLeft: 40 }} />
                </div>
                <label htmlFor="admin-role-filter" className="sr-only">Filter by role</label>
                <select id="admin-role-filter" className="input" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} style={{ flex: '1 1 140px', maxWidth: 200 }}>
                    <option value="">All roles</option>
                    <option value="player">Player</option>
                    <option value="coach">Coach</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="button" className="btn btn-secondary btn-icon" style={{ height: 46, width: 46 }} onClick={fetchUsers} aria-label="Refresh users">
                    <RefreshCw size={15} />
                </button>
            </div>

            {loading ? <LoadingSpinner /> : (
                <>
                    <section className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
                        {users.length === 0 ? (
                            <EmptyState icon={<Users size={24} />} title="No users found" description="Try a different name, email or role." />
                        ) : (
                            <div className="table-scroll">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Role</th>
                                            <th>Level</th>
                                            <th>Type</th>
                                            <th>Joined</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u: any) => (
                                            <tr key={u.id}>
                                                <td><UserCell name={u.name} email={u.email} /></td>
                                                <td><span className={roleBadge(u.role)}>{u.role}</span></td>
                                                <td style={{ textTransform: 'capitalize' }}>{u.experienceLevel || '—'}</td>
                                                <td style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{u.playerType || '—'}</td>
                                                <td className="muted small" style={{ whiteSpace: 'nowrap' }}>{fmtDate(u.createdAt)}</td>
                                                <td>
                                                    <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                                                        <button type="button" className="btn btn-navy btn-sm" onClick={() => setEditUser(u)} aria-label={`Edit ${u.name}`}>
                                                            <Edit size={13} /> <span className="hide-mobile">Edit</span>
                                                        </button>
                                                        <DeleteButton label={`Delete ${u.name}`} onClick={() => setDeleteTarget({ id: u.id, type: 'user', name: u.name })} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                    <Pagination />
                </>
            )}
        </div>
    );

    // ─── Uploads Tab ──────────────────────────────────────────────────────────
    const UploadsTab = () => (
        <section className="card card-pad rise rise-1">
            <SectionHead title="All uploads" onRefresh={fetchUploads} />
            {loading ? <LoadingSpinner /> : (
                <>
                    {uploads.length === 0 ? (
                        <EmptyState icon={<Film size={24} />} title="No uploads" description="Clips appear here as soon as players upload them." />
                    ) : (
                        <div className="table-scroll" style={{ margin: '0 -16px 16px' }}>
                            <table className="data-table">
                                <thead>
                                    <tr><th>File</th><th>User</th><th>Type</th><th>Status</th><th>Date</th><th style={{ textAlign: 'right' }}>Action</th></tr>
                                </thead>
                                <tbody>
                                    {uploads.map((u: any) => (
                                        <tr key={u.id}>
                                            <td style={{ maxWidth: 240 }}>
                                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)', fontWeight: 500 }}>{u.originalName || u.filename}</div>
                                                <div className="muted" style={{ fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.id}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{u.user?.name || 'Deleted'}</div>
                                                <div className="muted small" style={{ whiteSpace: 'nowrap' }}>{u.user?.email}</div>
                                            </td>
                                            <td style={{ textTransform: 'capitalize' }}>{u.type}</td>
                                            <td><StatusBadge status={u.status} /></td>
                                            <td className="muted small" style={{ whiteSpace: 'nowrap' }}>{fmtDate(u.createdAt)}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <DeleteButton label={`Delete ${u.originalName || 'upload'}`} onClick={() => setDeleteTarget({ id: u.id, type: 'upload', name: u.originalName })} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pagination />
                </>
            )}
        </section>
    );

    // ─── Reports Tab ──────────────────────────────────────────────────────────
    const ReportsTab = () => (
        <section className="card card-pad rise rise-1">
            <SectionHead title="Analysis reports" onRefresh={fetchReports} />
            {loading ? <LoadingSpinner /> : (
                <>
                    {reports.length === 0 ? (
                        <EmptyState icon={<FileText size={24} />} title="No reports" description="Reports appear here once analyses complete." />
                    ) : (
                        <div className="table-scroll" style={{ margin: '0 -16px 16px' }}>
                            <table className="data-table">
                                <thead>
                                    <tr><th>Player</th><th>Type</th><th style={{ textAlign: 'right' }}>Score</th><th>Date</th><th style={{ textAlign: 'right' }}>Action</th></tr>
                                </thead>
                                <tbody>
                                    {reports.map((r: any) => {
                                        const band = scoreBand(r.overallScore);
                                        return (
                                            <tr key={r.id}>
                                                <td><UserCell name={r.user?.name} email={r.user?.email} /></td>
                                                <td style={{ textTransform: 'capitalize' }}>{r.type}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <span className={`stat-value ${band ? `score-${band}` : 'muted'}`} style={{ fontSize: 26, marginTop: 0, display: 'inline-block' }}>
                                                        {typeof r.overallScore === 'number' ? Math.round(r.overallScore) : '—'}
                                                    </span>
                                                </td>
                                                <td className="muted small" style={{ whiteSpace: 'nowrap' }}>{fmtDate(r.createdAt)}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <DeleteButton label={`Delete ${r.type} report`} onClick={() => setDeleteTarget({ id: r.id, type: 'report', name: `${r.type} report` })} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pagination />
                </>
            )}
        </section>
    );

    // ─── Database Tab ─────────────────────────────────────────────────────────
    const DatabaseTab = () => (
        <div className="rise rise-1">
            <div className="row-between" style={{ marginBottom: 16 }}>
                <h3>PostgreSQL tables</h3>
                <button type="button" className="btn btn-secondary btn-sm" onClick={fetchCollections} aria-label="Refresh tables">
                    <RefreshCw size={14} /> <span className="hide-mobile">Refresh</span>
                </button>
            </div>
            {loading ? <LoadingSpinner /> : (
                <>
                    {collections.length === 0 ? (
                        <section className="card">
                            <EmptyState icon={<Database size={24} />} title="No tables reported" description="The API returned no table counts." />
                        </section>
                    ) : (
                        <div className="grid-auto">
                            {collections.map(c => (
                                <div key={c.name} className="stat">
                                    <div className="label">
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                                        <Database size={14} aria-hidden="true" />
                                    </div>
                                    <div className="stat-value">{c.count}</div>
                                    <div className="stat-foot">Records</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="notice" style={{ marginTop: 20 }}>
                        <span className="choice-icon" style={{ width: 38, height: 38 }}><Database size={17} /></span>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>Connection</div>
                            <div className="small" style={{ color: 'var(--text-2)', overflowWrap: 'anywhere' }}>
                                {process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'API'} → Express → Prisma → PostgreSQL
                            </div>
                            <div className="muted small" style={{ marginTop: 4 }}>
                                Every read and write goes through the authenticated API. The database is never exposed directly.
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );


    // ─── Settings Tab ─────────────────────────────────────────────────────────
    const SettingsTab = () => (
        <div className="grid-2 rise rise-1" style={{ alignItems: 'start' }}>
            <section className="card card-pad">
                <div className="card-head"><h3>System</h3></div>
                <div className="list">
                    {[
                        { label: 'Platform', value: 'CrickBuddy 1.0' },
                        { label: 'Backend', value: 'Node.js, Express, PostgreSQL' },
                        { label: 'AI service', value: 'Python FastAPI, MediaPipe, OpenCV' },
                        { label: 'Frontend', value: 'Next.js, React' },
                        { label: 'Database', value: 'PostgreSQL (Prisma ORM)' },
                        { label: 'Auth', value: 'JWT (HS256), bcryptjs' },
                        { label: 'Admin', value: user?.email },
                    ].map(row => (
                        <div key={row.label} className="list-item" style={{ justifyContent: 'space-between', paddingTop: 12, paddingBottom: 12 }}>
                            <span className="label">{row.label}</span>
                            <span className="small" style={{ fontWeight: 600, color: 'var(--text)', textAlign: 'right', overflowWrap: 'anywhere' }}>{row.value}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="card card-pad">
                <div className="card-head"><h3>Quick actions</h3></div>
                <div className="stack" style={{ gap: 10 }}>
                    <Link href="/dashboard" className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start' }}>
                        <Home size={16} /> Player dashboard
                    </Link>
                    <a href="/api/health" target="_blank" rel="noreferrer" className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start' }}>
                        <Activity size={16} /> Check API health
                    </a>
                    <button type="button" className="btn btn-danger btn-full" style={{ justifyContent: 'flex-start' }} onClick={logout}>
                        <LogOut size={16} /> Sign out
                    </button>
                </div>
            </section>
        </div>
    );

    // ─── Pagination ───────────────────────────────────────────────────────────
    const Pagination = () => (
        <nav className="row-between" aria-label="Pagination">
            <span className="muted small tnum">Page {page} of {totalPages}</span>
            <div className="row" style={{ gap: 8 }}>
                <button type="button" className="btn btn-secondary btn-sm btn-icon" style={{ width: 34 }} disabled={page <= 1} onClick={() => setPage(p => p - 1)} aria-label="Previous page">
                    <ChevronLeft size={16} />
                </button>
                <button type="button" className="btn btn-secondary btn-sm btn-icon" style={{ width: 34 }} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} aria-label="Next page">
                    <ChevronRight size={16} />
                </button>
            </div>
        </nav>
    );

    // ─── Render ───────────────────────────────────────────────────────────────
    // Tab bodies are called as functions (not mounted as <Tab />) so inputs such as
    // the user search keep focus across re-renders.
    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <div className="page">
                    <PageHeader
                        eyebrow="Admin console"
                        title={adminNav.find(n => n.key === tab)?.label}
                        description="Players, clips and reports across CrickBuddy."
                        actions={<>
                            <Link href="/dashboard" className="btn btn-ghost btn-sm"><Home size={14} /> Player view</Link>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={fetchStats}><RefreshCw size={14} /> Refresh</button>
                        </>}
                    />

                    <div className="segmented rise rise-1" role="tablist" aria-label="Admin sections" style={{ marginBottom: 24 }}>
                        {adminNav.map(item => (
                            <button key={item.key} type="button" role="tab" aria-selected={tab === item.key}
                                className={tab === item.key ? 'on' : ''} onClick={() => setTab(item.key)}>
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {tab === 'overview' && OverviewTab()}
                    {tab === 'users' && UsersTab()}
                    {tab === 'uploads' && UploadsTab()}
                    {tab === 'reports' && ReportsTab()}
                    {tab === 'database' && DatabaseTab()}
                    {tab === 'settings' && SettingsTab()}
                </div>
            </main>

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
