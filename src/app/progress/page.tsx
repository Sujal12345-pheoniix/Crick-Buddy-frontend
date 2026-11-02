'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { progressAPI } from '@/lib/api';
import { LoadingSpinner, EmptyState, PageHeader, MetricCard, scoreBand } from '@/components/ui';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    AreaChart, Area
} from 'recharts';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Swords, Wind, PersonStanding, ClipboardList, Upload, TrendingUp, Send } from 'lucide-react';

type ProgressTab = 'batting' | 'bowling' | 'posture' | 'match';

/*
 * Chart palette. Recharts needs literal colour values on its SVG props, so these mirror
 * the design tokens in globals.css: white (--white), navy-300 (--navy-300), --line, --text-3.
 * This is the one place literal colours are allowed in page code.
 */
const CHART = {
    primary: '#FFFFFF',
    secondary: '#8AA2CF',
    grid: 'rgba(255,255,255,0.08)',
    axis: '#8AA2CF',
    areaFill: 'rgba(255,255,255,0.06)',
    dotFill: '#060C1B',
};

const axisProps = {
    stroke: CHART.grid,
    tick: { fontSize: 12, fill: CHART.axis },
    tickLine: false,
    axisLine: { stroke: CHART.grid },
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'var(--navy-850)', border: '1px solid var(--line-2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, boxShadow: 'var(--shadow-2)' }}>
                <p className="label" style={{ marginBottom: 6 }}>{label}</p>
                {payload.map((p: any) => (
                    <p key={p.name} className="row" style={{ gap: 8, color: 'var(--text)', fontWeight: 600 }}>
                        <span style={{ width: 10, height: 2, background: p.color || p.stroke, display: 'inline-block' }} />
                        <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{p.name}</span>
                        <span className="tnum" style={{ marginLeft: 'auto' }}>{p.value}</span>
                    </p>
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

const TAB_META: Record<ProgressTab, { label: string; icon: typeof Swords }> = {
    batting: { label: 'Batting', icon: Swords },
    bowling: { label: 'Bowling', icon: Wind },
    posture: { label: 'Posture', icon: PersonStanding },
    match: { label: 'Match', icon: ClipboardList },
};

/* Three series max per tab: solid white, solid navy-300, dashed white. */
const SERIES: Record<ProgressTab, { key: string; name: string }[]> = {
    batting: [{ key: 'stance', name: 'Stance' }, { key: 'timing', name: 'Timing' }, { key: 'followThrough', name: 'Follow-through' }],
    bowling: [{ key: 'wrist', name: 'Wrist' }, { key: 'release', name: 'Release' }, { key: 'speed', name: 'Speed (km/h)' }],
    posture: [{ key: 'shoulder', name: 'Shoulder' }, { key: 'balance', name: 'Balance' }],
    match: [{ key: 'battingImpact', name: 'Batting impact' }, { key: 'bowlingImpact', name: 'Bowling impact' }, { key: 'fieldingImpact', name: 'Fielding impact' }],
};
const SERIES_STYLE = [
    { stroke: CHART.primary },
    { stroke: CHART.secondary },
    { stroke: CHART.primary, strokeDasharray: '4 4' },
];

const MATCH_FIELDS = [
    { key: 'matchDate', label: 'Match date', type: 'date' },
    { key: 'runs', label: 'Runs', type: 'number' },
    { key: 'balls', label: 'Balls faced', type: 'number' },
    { key: 'wickets', label: 'Wickets', type: 'number' },
    { key: 'oversBowled', label: 'Overs bowled', type: 'number' },
    { key: 'runsConceded', label: 'Runs conceded', type: 'number' },
    { key: 'catches', label: 'Catches', type: 'number' },
    { key: 'stumpings', label: 'Stumpings', type: 'number' },
];

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

    const submitMatchPerformance = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = Object.fromEntries(
                Object.entries(matchForm).map(([k, v]) => [k, v === '' ? 0 : v])
            );
            await progressAPI.submitMatchPerformance(payload);
            toast.success('Match logged and analysed');
            setMatchForm(initialMatchForm);
            await fetchProgress();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Could not save the match performance');
        } finally {
            setSubmitting(false);
        }
    };

    const improvement = useMemo(() => {
        if (!entries.length) return 0;
        return (entries[entries.length - 1]?.overallScore || 0) - (entries[0]?.overallScore || 0);
    }, [entries]);

    const tabLabel = TAB_META[tab].label;
    const best = entries.length ? Math.max(...entries.map(e => e.overallScore || 0)) : 0;
    const latestScore = entries[entries.length - 1]?.overallScore || 0;
    const improvementText = `${improvement >= 0 ? '+' : ''}${Math.round(improvement * 10) / 10}`;

    const board = [
        { label: 'Sessions', value: entries.length, band: '' },
        { label: 'Best score', value: best, band: scoreBand(best) },
        { label: 'Latest score', value: latestScore, band: scoreBand(latestScore) },
        { label: 'Improvement', value: improvementText, band: improvement > 0 ? 'good' : improvement < 0 ? 'poor' : '' },
    ];

    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <div className="page">
                    <PageHeader
                        eyebrow="Progress"
                        title="Your form over time"
                        description="Every analysed clip adds to the record. Log real match figures to see how the work in the nets carries into games."
                        actions={<Link href="/upload" className="btn btn-primary"><Upload size={16} /> Analyse a clip</Link>}
                    />

                    <div className="segmented rise rise-1" role="tablist" aria-label="Progress category" style={{ marginBottom: 20 }}>
                        {TABS.map(t => {
                            const Icon = TAB_META[t].icon;
                            return (
                                <button key={t} type="button" role="tab" aria-selected={tab === t}
                                    className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
                                    <Icon size={15} /> {TAB_META[t].label}
                                </button>
                            );
                        })}
                    </div>

                    {tab === 'match' && (
                        <section className="card card-pad rise rise-2" style={{ marginBottom: 20 }}>
                            <div className="card-head">
                                <div>
                                    <h3>Log a match</h3>
                                    <p className="muted small" style={{ marginTop: 4 }}>Leave a field blank if it doesn&apos;t apply — it counts as zero.</p>
                                </div>
                            </div>
                            <form onSubmit={submitMatchPerformance}>
                                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))', gap: 14, marginBottom: 18 }}>
                                    {MATCH_FIELDS.map((f) => (
                                        <div key={f.key} className="field">
                                            <label className="input-label" htmlFor={`match-${f.key}`}>{f.label}</label>
                                            <input
                                                id={`match-${f.key}`}
                                                type={f.type}
                                                className="input tnum"
                                                inputMode={f.type === 'number' ? 'numeric' : undefined}
                                                value={(matchForm as any)[f.key]}
                                                onChange={(e) => setMatchForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button className="btn btn-primary" type="submit" disabled={submitting}>
                                    {submitting ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Analysing…</> : <><Send size={15} /> Save and analyse</>}
                                </button>
                            </form>
                        </section>
                    )}

                    {loading ? <LoadingSpinner label="Loading your record" /> : entries.length === 0 ? (
                        <div className="card">
                            <EmptyState
                                icon={tab === 'match' ? <ClipboardList size={24} /> : <TrendingUp size={24} />}
                                title={`No ${tab} data yet`}
                                description={tab === 'match'
                                    ? 'Log your recent match figures above to unlock growth analysis.'
                                    : 'Upload and analyse a clip to start building your record.'}
                                action={tab === 'match'
                                    ? undefined
                                    : <Link href="/upload" className="btn btn-primary"><Upload size={15} /> Analyse a clip</Link>} />
                        </div>
                    ) : (
                        <div className="stack rise rise-2" style={{ gap: 20 }}>
                            {/* Scoreboard strip */}
                            <section className="panel-black crease" style={{ padding: 0, overflow: 'hidden' }}>
                                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 0 }}>
                                    {board.map((b, i) => (
                                        <div key={b.label} style={{ padding: '20px 22px', borderLeft: i ? '1px solid var(--line)' : 0 }}>
                                            <div className="label">{b.label}</div>
                                            <div className={`stat-value ${b.band ? `score-${b.band}` : ''}`} style={{ fontSize: 44 }}>{b.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {tab === 'match' && matchAnalysis && (
                                <div className="grid-4">
                                    <MetricCard label="Trend" value={String(matchAnalysis.trend || 'stable').replace(/^\w/, c => c.toUpperCase())} note="Across logged matches" />
                                    <MetricCard label="Average score" value={matchAnalysis.averageScore || 0} score={matchAnalysis.averageScore || 0} />
                                    <MetricCard label="Latest score" value={matchAnalysis.latestScore || 0} score={matchAnalysis.latestScore || 0} />
                                    <MetricCard label="Improvement" value={matchAnalysis.improvement || 0} note="Since first match logged" />
                                </div>
                            )}

                            <section className="card card-pad">
                                <div className="card-head">
                                    <h3>Overall {tabLabel.toLowerCase()} score</h3>
                                    <span className="label">Out of 100</span>
                                </div>
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                        <CartesianGrid stroke={CHART.grid} vertical={false} />
                                        <XAxis dataKey="date" {...axisProps} />
                                        <YAxis domain={[0, 100]} {...axisProps} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: CHART.grid }} />
                                        <Area type="monotone" dataKey="overall" stroke={CHART.primary} strokeWidth={1.75} fill={CHART.areaFill}
                                            name="Overall score" dot={{ fill: CHART.dotFill, stroke: CHART.primary, strokeWidth: 1.5, r: 3 }}
                                            activeDot={{ fill: CHART.primary, stroke: CHART.primary, r: 4 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </section>

                            <section className="card card-pad">
                                <div className="card-head">
                                    <h3>Component breakdown</h3>
                                </div>
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                        <CartesianGrid stroke={CHART.grid} vertical={false} />
                                        <XAxis dataKey="date" {...axisProps} />
                                        <YAxis {...axisProps} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: CHART.grid }} />
                                        <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: CHART.axis, paddingTop: 8 }} />
                                        {SERIES[tab].map((s, idx) => (
                                            <Line key={s.key} type="monotone" dataKey={s.key} name={s.name}
                                                strokeWidth={1.5} {...SERIES_STYLE[idx]}
                                                dot={{ r: 2.5, fill: CHART.dotFill, stroke: SERIES_STYLE[idx].stroke, strokeWidth: 1.5 }}
                                                activeDot={{ r: 4 }} />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </section>

                            {tab === 'match' && matchAnalysis && (
                                <section className="card card-pad">
                                    <div className="card-head">
                                        <h3>Growth analysis</h3>
                                        {matchAnalysis.trend && <span className="badge" style={{ textTransform: 'capitalize' }}>{matchAnalysis.trend}</span>}
                                    </div>
                                    <div className="grid-3">
                                        <div>
                                            <div className="label" style={{ marginBottom: 12 }}>Strengths</div>
                                            {(matchAnalysis.strengths || []).length
                                                ? <ul className="ticks">{(matchAnalysis.strengths || []).map((item: string, idx: number) => <li key={idx}>{item}</li>)}</ul>
                                                : <p className="muted small">None identified yet.</p>}
                                        </div>
                                        <div>
                                            <div className="label" style={{ marginBottom: 12 }}>Areas to work on</div>
                                            {(matchAnalysis.weaknesses || []).length
                                                ? <ul className="ticks warn">{(matchAnalysis.weaknesses || []).map((item: string, idx: number) => <li key={idx}>{item}</li>)}</ul>
                                                : <p className="muted small">Nothing flagged.</p>}
                                        </div>
                                        <div>
                                            <div className="label" style={{ marginBottom: 12 }}>Coach&apos;s suggestions</div>
                                            {(matchAnalysis.suggestions || []).length
                                                ? <ul className="ticks dots">{(matchAnalysis.suggestions || []).map((item: string, idx: number) => <li key={idx}>{item}</li>)}</ul>
                                                : <p className="muted small">Log a few more matches for suggestions.</p>}
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
