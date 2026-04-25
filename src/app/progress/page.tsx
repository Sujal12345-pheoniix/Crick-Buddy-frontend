'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { progressAPI } from '@/lib/api';
import { LoadingSpinner, EmptyState } from '@/components/ui';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    AreaChart, Area
} from 'recharts';
import Link from 'next/link';
import toast from 'react-hot-toast';

type ProgressTab = 'batting' | 'bowling' | 'posture' | 'match';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#161d30', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{label}</p>
                {payload.map((p: any) => (
                    <p key={p.name} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {p.value}</p>
                ))}
            </div>
        );
    }
    return null;
};

const initialMatchForm = {
    matchDate: '',
    runs: '',
    balls: '',
    wickets: '',
    oversBowled: '',
    runsConceded: '',
    catches: '',
    stumpings: ''
};

export default function ProgressPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState<ProgressTab>('batting');
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [matchAnalysis, setMatchAnalysis] = useState<any>(null);
    const [matchForm, setMatchForm] = useState(initialMatchForm);

    const fetchProgress = async () => {
        setLoading(true);
        try {
            if (tab === 'match') {
                const [entriesRes, analysisRes] = await Promise.all([
                    progressAPI.getMatchEntries(30),
                    progressAPI.analyzeMatchGrowth(),
                ]);
                setEntries(entriesRes.data.entries || []);
                setMatchAnalysis(analysisRes.data.analysis || null);
            } else {
                const res = await progressAPI.getAll(tab);
                setEntries(res.data.entries || []);
                setMatchAnalysis(null);
            }
        } catch {
            setEntries([]);
            setMatchAnalysis(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgress();
    }, [tab]);

    const chartData = useMemo(() => entries.map((e, i) => ({
        session: `Session ${i + 1}`,
        date: new Date(e.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        overall: e.overallScore || 0,
        ...(tab === 'batting' ? {
            stance: e.stanceScore || 0,
            timing: e.timingScore || 0,
            followThrough: e.followThroughScore || 0,
            swingAngle: e.batSwingAngle || 0,
        } : {}),
        ...(tab === 'bowling' ? {
            wrist: e.wristPositionScore || 0,
            armRotation: e.armRotationScore || 0,
            release: e.releasePointScore || 0,
            speed: e.estimatedBallSpeed || 0,
        } : {}),
        ...(tab === 'posture' ? {
            shoulder: e.shoulderAlignmentScore || 0,
            balance: e.balanceScore || 0,
        } : {}),
        ...(tab === 'match' ? {
            battingImpact: e.stanceScore || 0,
            bowlingImpact: e.releasePointScore || 0,
            fieldingImpact: e.balanceScore || 0,
            strikeRate: e.batSwingAngle || 0,
            economy: e.armRotationAngle || 0,
        } : {})
    })), [entries, tab]);

    const TABS: ProgressTab[] = ['batting', 'bowling', 'posture', 'match'];
    const tabColors: Record<ProgressTab, string> = {
        batting: '#00ff88',
        bowling: '#3b82f6',
        posture: '#f59e0b',
        match: '#ec4899'
    };

    const submitMatchPerformance = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = Object.fromEntries(
                Object.entries(matchForm).map(([k, v]) => [k, v === '' ? 0 : v])
            );
            await progressAPI.submitMatchPerformance(payload);
            toast.success('Match performance submitted and analyzed');
            setMatchForm(initialMatchForm);
            await fetchProgress();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to submit match performance');
        } finally {
            setSubmitting(false);
        }
    };

    const improvement = useMemo(() => {
        if (!entries.length) return 0;
        return (entries[entries.length - 1]?.overallScore || 0) - (entries[0]?.overallScore || 0);
    }, [entries]);

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ padding: '32px 40px' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Progress Tracking</h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
                        Track your improvement over time and submit real match scores for growth feedback.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
                            border: `1.5px solid ${tab === t ? tabColors[t] : 'rgba(255,255,255,0.1)'}`,
                            background: tab === t ? `${tabColors[t]}14` : 'transparent',
                            color: tab === t ? tabColors[t] : 'rgba(255,255,255,0.5)',
                            textTransform: 'capitalize', transition: 'all 0.2s'
                        }}>
                            {t === 'batting' ? '🏏' : t === 'bowling' ? '⚡' : t === 'posture' ? '📸' : '📝'} {t}
                        </button>
                    ))}
                </div>

                {tab === 'match' && (
                    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Add Match Performance</h2>
                        <form onSubmit={submitMatchPerformance}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 12 }}>
                                {[
                                    { key: 'matchDate', label: 'Match Date', type: 'date' },
                                    { key: 'runs', label: 'Runs', type: 'number' },
                                    { key: 'balls', label: 'Balls', type: 'number' },
                                    { key: 'wickets', label: 'Wickets', type: 'number' },
                                    { key: 'oversBowled', label: 'Overs Bowled', type: 'number' },
                                    { key: 'runsConceded', label: 'Runs Conceded', type: 'number' },
                                    { key: 'catches', label: 'Catches', type: 'number' },
                                    { key: 'stumpings', label: 'Stumpings', type: 'number' },
                                ].map((f: any) => (
                                    <div key={f.key}>
                                        <label className="input-label">{f.label}</label>
                                        <input
                                            type={f.type}
                                            className="input"
                                            value={(matchForm as any)[f.key]}
                                            onChange={(e) => setMatchForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                                        />
                                    </div>
                                ))}
                            </div>
                            <button className="btn-primary" type="submit" disabled={submitting}>
                                {submitting ? 'Analyzing...' : 'Submit Match Performance'}
                            </button>
                        </form>
                    </div>
                )}

                {loading ? <LoadingSpinner /> : entries.length === 0 ? (
                    <EmptyState icon="📊" title={`No ${tab} data yet`}
                        description={tab === 'match'
                            ? 'Submit your recent match stats to unlock AI growth analysis'
                            : 'Upload and analyze videos to start tracking your progress'}
                        action={tab === 'match'
                            ? undefined
                            : <Link href="/upload" className="btn-primary" style={{ textDecoration: 'none' }}>Upload Video</Link>} />
                ) : (
                    <>
                        {tab === 'match' && matchAnalysis && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                                {[
                                    { label: 'Trend', value: matchAnalysis.trend || 'stable' },
                                    { label: 'Average Score', value: matchAnalysis.averageScore || 0 },
                                    { label: 'Latest Score', value: matchAnalysis.latestScore || 0 },
                                    { label: 'Improvement', value: matchAnalysis.improvement || 0 },
                                ].map((x) => (
                                    <div key={x.label} className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 22, fontWeight: 900, color: tabColors.match, textTransform: 'capitalize' }}>{x.value}</div>
                                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{x.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
                                Overall {tab.charAt(0).toUpperCase() + tab.slice(1)} Score Over Time
                            </h2>
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={tabColors[tab]} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={tabColors[tab]} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                                    <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="overall" stroke={tabColors[tab]} strokeWidth={2.5} fill="url(#scoreGrad)" name="Overall Score" dot={{ fill: tabColors[tab], r: 4 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="card" style={{ padding: 24 }}>
                            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Detailed Metrics</h2>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                                    {tab === 'batting' && <>
                                        <Line type="monotone" dataKey="stance" stroke="#00ff88" strokeWidth={2} dot={{ r: 3 }} name="Stance" />
                                        <Line type="monotone" dataKey="timing" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Timing" />
                                        <Line type="monotone" dataKey="followThrough" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Follow-Through" />
                                    </>}
                                    {tab === 'bowling' && <>
                                        <Line type="monotone" dataKey="wrist" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Wrist" />
                                        <Line type="monotone" dataKey="release" stroke="#00ff88" strokeWidth={2} dot={{ r: 3 }} name="Release" />
                                        <Line type="monotone" dataKey="speed" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Speed (km/h)" />
                                    </>}
                                    {tab === 'posture' && <>
                                        <Line type="monotone" dataKey="shoulder" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Shoulder" />
                                        <Line type="monotone" dataKey="balance" stroke="#00ff88" strokeWidth={2} dot={{ r: 3 }} name="Balance" />
                                    </>}
                                    {tab === 'match' && <>
                                        <Line type="monotone" dataKey="battingImpact" stroke="#00ff88" strokeWidth={2} dot={{ r: 3 }} name="Batting Impact" />
                                        <Line type="monotone" dataKey="bowlingImpact" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Bowling Impact" />
                                        <Line type="monotone" dataKey="fieldingImpact" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Fielding Impact" />
                                    </>}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {tab === 'match' && matchAnalysis && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
                                <div className="card" style={{ padding: 20 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#00ff88', marginBottom: 12 }}>Strengths</h3>
                                    {(matchAnalysis.strengths || []).map((item: string, idx: number) => (
                                        <div key={idx} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>• {item}</div>
                                    ))}
                                </div>
                                <div className="card" style={{ padding: 20 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ff4757', marginBottom: 12 }}>Weaknesses</h3>
                                    {(matchAnalysis.weaknesses || []).map((item: string, idx: number) => (
                                        <div key={idx} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>• {item}</div>
                                    ))}
                                </div>
                                <div className="card" style={{ padding: 20, gridColumn: 'span 2' }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6', marginBottom: 12 }}>AI Suggestions</h3>
                                    {(matchAnalysis.suggestions || []).map((item: string, idx: number) => (
                                        <div key={idx} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>• {item}</div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24 }}>
                            {[
                                { label: 'Sessions', value: entries.length },
                                { label: 'Best Score', value: Math.max(...entries.map(e => e.overallScore || 0)) },
                                { label: 'Latest Score', value: entries[entries.length - 1]?.overallScore || 0 },
                                { label: 'Improvement', value: `${improvement >= 0 ? '+' : ''}${Math.round(improvement * 10) / 10}` },
                            ].map(stat => (
                                <div key={stat.label} className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 26, fontWeight: 900, color: tabColors[tab] }}>{stat.value}</div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
