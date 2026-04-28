'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { ScoreBadge, StatusBadge, LoadingSpinner, EmptyState } from '@/components/ui';
import { uploadsAPI, reportsAPI, progressAPI } from '@/lib/api';
import { Upload, BarChart3, FileText, Activity, ChevronRight, TrendingUp, Zap, Target, Trophy, Star, MessageCircle, Dumbbell, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const levelConfig: Record<string, { color: string; label: string; emoji: string; next: string }> = {
    beginner:     { color: '#22c55e', label: 'Beginner',     emoji: '🌱', next: 'Intermediate' },
    intermediate: { color: '#6366f1', label: 'Intermediate', emoji: '⚡', next: 'Professional'  },
    professional: { color: '#eab308', label: 'Pro',          emoji: '🌟', next: 'Legend'         },
};

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [uploads, setUploads] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading]);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [u, r, s] = await Promise.all([uploadsAPI.list(), reportsAPI.list(), progressAPI.getSummary()]);
                setUploads(u.data.uploads || []);
                setReports(r.data.reports || []);
                setSummary(s.data.summary || {});
            } catch { toast.error('Failed to load dashboard data'); }
            finally { setDataLoading(false); }
        };
        fetchData();
    }, [user]);

    if (loading) return <LoadingSpinner />;
    if (!user) return null;

    const formatDate = (value: any) => {
        if (!value) return '—';
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const latestReport = reports[0];
    const pendingUploads = uploads.filter(u => u.status === 'processing' || u.status === 'pending').length;
    const level = levelConfig[user.experienceLevel || 'beginner'];
    const xpPercent = Math.min((user.totalUploads || 0) * 10, 100);

    const quickActions = [
        { href: '/chatbot',   emoji: '💬', title: 'AI Coach',        desc: 'Get instant cricket advice', color: '#22c55e',  bg: 'rgba(34,197,94,0.08)'  },
        { href: '/training',  emoji: '🏋️', title: 'Training Drills', desc: 'Exercises for your level',   color: '#6366f1',  bg: 'rgba(99,102,241,0.08)' },
        { href: '/equipment', emoji: '🏏', title: 'Equipment',       desc: 'Gear recommendations',       color: '#f97316',  bg: 'rgba(249,115,22,0.08)' },
        { href: '/events',    emoji: '📡', title: 'Live Events',     desc: 'Tournaments & scoreboards',  color: '#ef4444',  bg: 'rgba(239,68,68,0.08)'  },
    ];

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ padding: 'clamp(16px,3vw,32px) clamp(16px,3vw,36px)', width: '100%' }}>

                {/* ── Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ minWidth: 0 }}>
                        <h1 style={{ fontSize: 'clamp(20px,3.5vw,28px)', fontWeight: 800, marginBottom: 6, letterSpacing: '-0.01em' }}>
                            Hey, {user.name.split(' ')[0]}! {level.emoji}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <span className={`badge badge-${user.experienceLevel === 'professional' ? 'yellow' : user.experienceLevel === 'intermediate' ? 'blue' : 'green'}`}>
                                {level.emoji} {level.label}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                {user.playerType} · {user.battingStyle}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <img src="/icon.png" alt="logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                        </div>
                        <Link href="/upload" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
                            <Upload size={15} />
                            New Analysis
                        </Link>
                    </div>
                </div>

                {/* ── XP / Level Bar ── */}
                <div className="card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
                        <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${level.color}, ${level.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#0a0e1a', flexShrink: 0 }}>
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 700 }}>{level.label} Player</span>
                                <span style={{ fontSize: 12, color: level.color, fontWeight: 700 }}>→ {level.next}</span>
                            </div>
                            <div className="xp-bar-container">
                                <div className="xp-bar-fill" style={{ '--xp-width': `${xpPercent}%` } as any} />
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                {user.totalUploads || 0} analyses completed · Keep going!
                            </div>
                        </div>
                    </div>
                    {/* Achievement chips */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {(user.totalUploads || 0) >= 1  && <span className="achievement-badge">🎯 First Upload</span>}
                        {(user.totalUploads || 0) >= 5  && <span className="achievement-badge">⚡ 5 Analyses</span>}
                        {(user.totalReports || 0) >= 3  && <span className="achievement-badge">📊 3 Reports</span>}
                    </div>
                </div>



                {/* ── Main Grid ── */}
                <div className="dash-main-grid" style={{ marginBottom: 24 }}>
                    {/* Latest Report */}
                    <div className="card" style={{ padding: 22 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Latest Analysis</h2>
                            <Link href="/progress" style={{ fontSize: 13, color: '#22c55e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                                View all <ChevronRight size={13} />
                            </Link>
                        </div>
                        {dataLoading ? <LoadingSpinner size={32} /> :
                            latestReport ? (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
                                        <ScoreBadge score={latestReport.overallScore || 0} size="lg" />
                                        <div>
                                            <div style={{ fontSize: 17, fontWeight: 800, textTransform: 'capitalize', marginBottom: 4 }}>
                                                {latestReport.type} Analysis
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(latestReport.createdAt)}</div>
                                            <div className="badge badge-green" style={{ marginTop: 6 }}>✅ Completed</div>
                                        </div>
                                    </div>
                                    {latestReport.strengths?.slice(0, 2).map((s: string, i: number) => (
                                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                                            <span style={{ color: '#22c55e', fontSize: 14, marginTop: 1 }}>✓</span>
                                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</span>
                                        </div>
                                    ))}
                                    {latestReport.upload?.id ? (
                                        <Link href={`/analysis/${latestReport.upload.id}`} className="btn btn-secondary" style={{ marginTop: 16, fontSize: 13, padding: '9px 16px' }}>
                                            View Full Report <ChevronRight size={13} />
                                        </Link>
                                    ) : (
                                        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>Upload not linked to this report.</div>
                                    )}
                                </div>
                            ) : (
                                <EmptyState icon="📊" title="No reports yet" description="Upload a video to get your first AI analysis report"
                                    action={<Link href="/upload" className="btn btn-primary" style={{ textDecoration: 'none' }}><Upload size={14} /> Upload Now</Link>} />
                            )
                        }
                    </div>

                    {/* Recent Uploads */}
                    <div className="card" style={{ padding: 22 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Uploads</h2>
                            <Link href="/upload" style={{ fontSize: 13, color: '#22c55e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                                New upload <ChevronRight size={13} />
                            </Link>
                        </div>
                        {dataLoading ? <LoadingSpinner size={32} /> :
                            uploads.length === 0 ? (
                                <EmptyState icon="📹" title="No uploads yet" description="Get started by uploading your first cricket video"
                                    action={<Link href="/upload" className="btn btn-primary" style={{ textDecoration: 'none' }}><Upload size={14} /> Upload Now</Link>} />
                            ) : (
                                <div>
                                    {uploads.slice(0, 5).map((u: any) => (
                                        <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize', marginBottom: 2 }}>
                                                    {u.type} Analysis
                                                </div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</div>
                                            </div>
                                            <StatusBadge status={u.status} />
                                        </div>
                                    ))}
                                    {uploads.length > 5 && (
                                        <div style={{ textAlign: 'center', marginTop: 12 }}>
                                            <Link href="/progress" style={{ fontSize: 13, color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>
                                                View all {uploads.length} uploads →
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )
                        }
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)' }}>Quick Actions</h2>
                <div className="dash-actions-grid">
                    {quickActions.map(item => (
                        <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                            <div className="card card-interactive" style={{ padding: 18, cursor: 'pointer', background: item.bg, border: `1px solid ${item.color}22` }}>
                                <div style={{ fontSize: 28, marginBottom: 10 }}>{item.emoji}</div>
                                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</div>
                                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4, color: item.color, fontSize: 13, fontWeight: 700 }}>
                                    Open <ChevronRight size={13} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

            </main>
        </div>
    );
}
