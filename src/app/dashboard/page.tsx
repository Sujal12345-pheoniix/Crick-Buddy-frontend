'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { ScoreBadge, StatusBadge, LoadingSpinner, EmptyState, PageHeader, scoreBand } from '@/components/ui';
import { uploadsAPI, reportsAPI, progressAPI } from '@/lib/api';
import { Upload, ArrowUpRight, MessageSquare, Dumbbell, Radio, Trophy, Film, FileBarChart } from 'lucide-react';
import toast from 'react-hot-toast';

const QUICK = [
    { href: '/chatbot', icon: MessageSquare, title: 'Ask the AI coach', desc: 'Questions about technique, fitness or match plans.' },
    { href: '/training', icon: Dumbbell, title: 'Training drills', desc: 'Sessions matched to your level and role.' },
    { href: '/events', icon: Radio, title: 'Live & tournaments', desc: 'Scores and competitions near you.' },
    { href: '/leaderboard', icon: Trophy, title: 'Leaderboard', desc: 'See where you rank among players.' },
];

function greeting() {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

const fmtDate = (v: any) => {
    const d = v ? new Date(v) : null;
    return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';
};

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [uploads, setUploads] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>({});
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const [u, r, s] = await Promise.all([uploadsAPI.list(), reportsAPI.list(), progressAPI.getSummary()]);
                setUploads(u.data.uploads || []);
                setReports(r.data.reports || []);
                setSummary(s.data.summary || {});
            } catch { toast.error('Could not load your dashboard'); }
            finally { setDataLoading(false); }
        })();
    }, [user]);

    if (loading) return <LoadingSpinner />;
    if (!user) return null;

    const latest = reports[0];
    const scores = reports.map(r => r.overallScore).filter((n: any) => typeof n === 'number');
    const best = scores.length ? Math.max(...scores) : null;
    const average = scores.length ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : null;
    const inFlight = uploads.filter(u => u.status === 'processing' || u.status === 'pending');

    const board = [
        { label: 'Analyses', value: uploads.length },
        { label: 'Average score', value: average ?? '—', band: scoreBand(average) },
        { label: 'Best score', value: best ?? '—', band: scoreBand(best) },
        { label: 'Batting', value: summary.batting?.overallScore != null ? Math.round(summary.batting.overallScore) : '—', band: scoreBand(summary.batting?.overallScore) },
        { label: 'Bowling', value: summary.bowling?.overallScore != null ? Math.round(summary.bowling.overallScore) : '—', band: scoreBand(summary.bowling?.overallScore) },
    ];

    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <div className="page">
                    <PageHeader
                        eyebrow={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        title={`${greeting()}, ${user.name.split(' ')[0]}`}
                        description={<span style={{ textTransform: 'capitalize' }}>{user.experienceLevel} {user.playerType} · {user.battingStyle?.replace('-', ' ')}</span>}
                        actions={<Link href="/upload" className="btn btn-primary btn-lg"><Upload size={17} /> Analyse a clip</Link>}
                    />

                    {/* Scoreboard strip */}
                    <section className="panel-black crease rise rise-1" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 0 }}>
                            {board.map((b, i) => (
                                <div key={b.label} style={{ padding: '20px 22px', borderLeft: i ? '1px solid var(--line)' : 0 }}>
                                    <div className="label">{b.label}</div>
                                    <div className={`stat-value ${b.band ? `score-${b.band}` : ''}`} style={{ fontSize: 44 }}>
                                        {dataLoading ? <span className="skeleton" style={{ display: 'inline-block', width: 54, height: 36 }} /> : b.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {inFlight.length > 0 && (
                        <Link href={`/analysis/${inFlight[0].id}`} className="notice notice-info rise rise-2" style={{ marginBottom: 20, alignItems: 'center' }}>
                            <div className="spinner" style={{ width: 18, height: 18 }} />
                            <div style={{ flex: 1 }}>
                                <strong style={{ fontWeight: 600 }}>{inFlight.length === 1 ? 'An analysis is in progress' : `${inFlight.length} analyses in progress`}</strong>
                                <div className="muted small">Your {inFlight[0].type} clip is being analysed — open it to follow along.</div>
                            </div>
                            <ArrowUpRight size={18} />
                        </Link>
                    )}

                    <div className="split rise rise-2" style={{ marginBottom: 28 }}>
                        {/* Latest analysis */}
                        <section className="card card-pad">
                            <div className="card-head">
                                <h3>Latest analysis</h3>
                                <Link href="/progress" className="btn btn-ghost btn-sm">Progress <ArrowUpRight size={14} /></Link>
                            </div>
                            {dataLoading ? <div className="skeleton" style={{ height: 180 }} /> : latest ? (
                                <div>
                                    <div className="row" style={{ gap: 22, alignItems: 'center', marginBottom: 22 }}>
                                        <ScoreBadge score={latest.overallScore || 0} size="lg" />
                                        <div>
                                            <div className="eyebrow">{fmtDate(latest.createdAt)}</div>
                                            <h2 style={{ marginTop: 6, textTransform: 'capitalize' }}>{latest.type} analysis</h2>
                                            {latest.battingMetrics?.shotType && !latest.battingMetrics.shotType.startsWith('Unclassified') && (
                                                <div className="muted small" style={{ marginTop: 4 }}>{latest.battingMetrics.shotType}</div>
                                            )}
                                        </div>
                                    </div>
                                    {latest.strengths?.length > 0 && (
                                        <ul className="ticks" style={{ marginBottom: 18 }}>
                                            {latest.strengths.slice(0, 2).map((s: string, i: number) => <li key={i}>{s}</li>)}
                                        </ul>
                                    )}
                                    {latest.upload?.id && (
                                        <Link href={`/analysis/${latest.upload.id}`} className="btn btn-secondary">Open full report <ArrowUpRight size={15} /></Link>
                                    )}
                                </div>
                            ) : (
                                <EmptyState icon={<FileBarChart size={24} />} title="No reports yet"
                                    description="Film a single shot or delivery side-on and upload it — your breakdown is ready in a few minutes."
                                    action={<Link href="/upload" className="btn btn-primary"><Upload size={15} /> Analyse a clip</Link>} />
                            )}
                        </section>

                        {/* Recent uploads */}
                        <section className="card card-pad">
                            <div className="card-head">
                                <h3>Recent clips</h3>
                                <Link href="/upload" className="btn btn-ghost btn-sm">New <Upload size={14} /></Link>
                            </div>
                            {dataLoading ? <div className="stack">{[0, 1, 2].map(i => <div key={i} className="skeleton" style={{ height: 44 }} />)}</div>
                                : uploads.length === 0 ? (
                                    <EmptyState icon={<Film size={24} />} title="No clips yet" description="Your uploads and their status appear here." />
                                ) : (
                                    <div className="list">
                                        {uploads.slice(0, 6).map((u: any) => (
                                            <Link key={u.id} href={`/analysis/${u.id}`} className="list-item list-link">
                                                <span className="choice-icon" style={{ width: 38, height: 38 }}><Film size={17} /></span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{u.type}</div>
                                                    <div className="muted small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.originalName} · {fmtDate(u.createdAt)}</div>
                                                </div>
                                                <StatusBadge status={u.status} />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                        </section>
                    </div>

                    <div className="eyebrow rise rise-3" style={{ marginBottom: 14 }}>Keep improving</div>
                    <div className="grid-4 rise rise-3">
                        {QUICK.map(({ href, icon: Icon, title, desc }) => (
                            <Link key={href} href={href} className="card card-pad card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div className="row-between">
                                    <span className="choice-icon"><Icon size={19} /></span>
                                    <ArrowUpRight size={17} className="muted" />
                                </div>
                                <div style={{ fontWeight: 600, marginTop: 6 }}>{title}</div>
                                <div className="muted small">{desc}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
