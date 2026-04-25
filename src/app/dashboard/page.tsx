'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { MetricCard, ScoreBadge, StatusBadge, LoadingSpinner, EmptyState } from '@/components/ui';
import { uploadsAPI, reportsAPI, progressAPI } from '@/lib/api';
import { Upload, BarChart3, FileText, Activity, ChevronRight, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

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
        return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString();
    };

    const latestReport = reports[0];
    const pendingUploads = uploads.filter(u => u.status === 'processing' || u.status === 'pending').length;

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ padding: '32px 40px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
                            Welcome back, {user.name.split(' ')[0]}! 🏏
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
                            {user.playerType} · {user.experienceLevel} · {user.battingStyle}
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 56,
                            height: 56,
                            borderRadius: 16,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01))',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.05)'
                        }}>
                            {/* Glowing background effect */}
                            <div style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(45deg, #00ff88, #3b82f6)',
                                filter: 'blur(15px)',
                                opacity: 0.3,
                                zIndex: -1,
                                borderRadius: 'inherit',
                                animation: 'pulse 3s infinite alternate'
                            }} />
                            <img src="/icon.png" alt="Crick Buddy Logo" style={{ width: 36, height: 36, objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }} />
                        </div>
                        <Link href="/upload" className="btn-primary" style={{ padding: '12px 24px', fontSize: 15, fontWeight: 600 }}>
                            <Upload size={18} />
                            New Analysis
                        </Link>
                    </div>
                </div>

                {/* Quick stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                    <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,255,136,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Upload size={22} color="#00ff88" />
                        </div>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 900 }}>{user.totalUploads}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Total Uploads</div>
                        </div>
                    </div>
                    <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={22} color="#3b82f6" />
                        </div>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 900 }}>{user.totalReports}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Reports Generated</div>
                        </div>
                    </div>
                    <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={22} color="#f59e0b" />
                        </div>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 900 }}>{user.overallScore || 0}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Overall Score</div>
                        </div>
                    </div>
                    <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={22} color="#8b5cf6" />
                        </div>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 900 }}>{pendingUploads}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Processing</div>
                        </div>
                    </div>
                </div>

                {/* Latest report + recent uploads */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                    {/* Latest Report */}
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Latest Analysis Report</h2>
                            <Link href="/progress" style={{ fontSize: 13, color: '#00ff88', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                View all <ChevronRight size={14} />
                            </Link>
                        </div>
                        {dataLoading ? <LoadingSpinner size={32} /> :
                            latestReport ? (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                                        <ScoreBadge score={latestReport.overallScore || 0} size="lg" />
                                        <div>
                                            <div style={{ fontSize: 18, fontWeight: 800, textTransform: 'capitalize', marginBottom: 4 }}>
                                                {latestReport.type} Analysis
                                            </div>
                                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                                                {formatDate(latestReport.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Strengths preview */}
                                    {latestReport.strengths?.slice(0, 2).map((s: string, i: number) => (
                                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                                            <span style={{ color: '#00ff88', marginTop: 2 }}>✓</span>
                                            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>{s}</span>
                                        </div>
                                    ))}
                                    {latestReport.upload?.id ? (
                                        <Link href={`/analysis/${latestReport.upload.id}`} className="btn-secondary" style={{ display: 'inline-flex', marginTop: 16, fontSize: 13, padding: '8px 16px' }}>
                                            View Full Report <ChevronRight size={14} />
                                        </Link>
                                    ) : (
                                        <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                                            Linked upload not found for this report.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <EmptyState icon="📊" title="No reports yet" description="Upload a video to get your first analysis report"
                                    action={<Link href="/upload" className="btn-primary" style={{ textDecoration: 'none' }}>Upload Now</Link>} />
                            )
                        }
                    </div>

                    {/* Recent Uploads */}
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Recent Uploads</h2>
                            <Link href="/upload" style={{ fontSize: 13, color: '#00ff88', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                Upload new <ChevronRight size={14} />
                            </Link>
                        </div>
                        {dataLoading ? <LoadingSpinner size={32} /> :
                            uploads.length === 0 ? (
                                <EmptyState icon="📹" title="No uploads yet" description="Get started by uploading a video"
                                    action={<Link href="/upload" className="btn-primary" style={{ textDecoration: 'none' }}>Upload Now</Link>} />
                            ) : (
                                <div>
                                    {uploads.slice(0, 5).map((u: any) => (
                                        <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize', marginBottom: 2 }}>
                                                    {u.type} Analysis
                                                </div>
                                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                                                    {formatDate(u.createdAt)}
                                                </div>
                                            </div>
                                            <StatusBadge status={u.status} />
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                    </div>
                </div>

                {/* Quick action cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    {[
                        { href: '/chatbot', icon: '💬', title: 'Ask AI Coach', desc: 'Get instant cricket advice', color: '#00ff88' },
                        { href: '/training', icon: '🏋️', title: 'Training Drills', desc: 'Suggested exercises for you', color: '#3b82f6' },
                        { href: '/equipment', icon: '🏏', title: 'Equipment', desc: 'Gear recommendations', color: '#f59e0b' },
                        { href: '/events', icon: '📡', title: 'Live & Tournaments', desc: 'Nearby events and scoreboards', color: '#ef4444' },
                    ].map(item => (
                        <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                            <div className="card" style={{ padding: 20, cursor: 'pointer' }}>
                                <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
                                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{item.desc}</div>
                                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4, color: item.color, fontSize: 13, fontWeight: 600 }}>
                                    Open <ChevronRight size={14} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
