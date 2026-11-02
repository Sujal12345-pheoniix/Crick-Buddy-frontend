'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { MetricCard, ScoreBadge, StatusBadge, LoadingSpinner, scoreWord } from '@/components/ui';
import { uploadsAPI, reportsAPI } from '@/lib/api';
import { ArrowLeft, Upload, LineChart as LineIcon, RotateCcw, Check, AlertTriangle, Gauge } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

// recharts needs literal colours: white, navy-300 and the hairline grid from globals.css.
const CHART = { primary: '#FFFFFF', secondary: '#8AA2CF', grid: 'rgba(255,255,255,0.08)', axis: 'rgba(245,247,251,0.48)', tooltip: '#0E1A33' };

// Backend progress values → human stages
const STAGES = [
    { at: 10, title: 'Clip received', text: 'Your video is stored safely.' },
    { at: 15, title: 'Starting the engine', text: 'The analysis server wakes up if it was idle — up to a minute.' },
    { at: 30, title: 'Tracking your movement', text: 'Finding the key moment and measuring 33 body points frame by frame. This is the long step — usually 1–4 minutes.' },
    { at: 80, title: 'Building your report', text: 'Scoring, fault checks and coaching notes.' },
];

const fmtElapsed = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function Section({ title, items, variant, empty }: { title: string; items?: string[]; variant?: 'warn' | 'dots'; empty?: string }) {
    if (!items?.length && !empty) return null;
    return (
        <section className="card card-pad">
            <h3 style={{ fontSize: 17, marginBottom: 16 }}>{title}</h3>
            {items?.length ? <ul className={`ticks ${variant ?? ''}`}>{items.map((s, i) => <li key={i}>{s}</li>)}</ul>
                : <p className="muted small">{empty}</p>}
        </section>
    );
}

export default function AnalysisPage() {
    const { id } = useParams() as { id: string };
    const [upload, setUpload] = useState<any>(null);
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [retrying, setRetrying] = useState(false);
    const [loadError, setLoadError] = useState<string>('');
    const [now, setNow] = useState(Date.now());

    const formatErrorMessage = (msg: string) => {
        if (!msg) return 'Analysis failed';
        if (
            msg.includes('429') ||
            msg.includes('502') ||
            msg.toLowerCase().includes('bad gateway') ||
            msg.toLowerCase().includes('unavailable') ||
            msg.includes('503') ||
            msg.includes('504')
        ) {
            return 'The analysis server is unavailable right now. Your clip is saved — use Retry in a minute.';
        }
        return msg.replace(/^ERR_[A-Z_]+:\s*/, '');
    };

    const fetchData = async (isInitial = false) => {
        try {
            const u = await uploadsAPI.getOne(id);
            if (!u.data.upload) {
                setLoadError('Upload data not available yet.');
                return;
            }
            setLoadError('');
            setUpload(u.data.upload);

            if (u.data.upload.status === 'completed') {
                try {
                    const r = await reportsAPI.byUpload(id);
                    if (r.data.report) setReport(r.data.report);
                } catch {
                    console.warn('Report not ready yet even though upload is marked complete');
                }
            }
        } catch (err: any) {
            setLoadError(err.response?.data?.message || 'Could not load this analysis.');
            if (isInitial) toast.error(err.response?.data?.message || 'Upload not found');
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchData(true); }, [id]);

    // Poll while processing, and tick the elapsed timer
    useEffect(() => {
        if (!upload) return;
        const shouldPoll = upload.status === 'pending' || upload.status === 'processing' || (upload.status === 'completed' && !report);
        if (!shouldPoll) return;
        const poll = setInterval(() => fetchData(), 4000);
        const tick = setInterval(() => setNow(Date.now()), 1000);
        return () => { clearInterval(poll); clearInterval(tick); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [upload?.status, report]);

    const retryAnalysis = async () => {
        if (!id || retrying) return;
        try {
            setRetrying(true);
            await uploadsAPI.retryAnalysis(id);
            toast.success('Analysis restarted');
            setReport(null);
            await fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Could not restart analysis');
        } finally {
            setRetrying(false);
        }
    };

    const type = upload?.type || 'analysis';
    const isCompleted = upload?.status === 'completed';
    const isWorking = upload && !isCompleted && upload.status !== 'failed';
    const elapsedMs = upload?.createdAt ? now - new Date(upload.createdAt).getTime() : 0;
    // On a small server a long clip can take ~6 minutes; only suggest a restart well beyond that.
    const isStale = isWorking && elapsedMs > 15 * 60 * 1000;
    const stageIndex = STAGES.reduce((acc, s, i) => ((upload?.processingProgress || 0) >= s.at ? i : acc), 0);
    const created = upload?.createdAt ? new Date(upload.createdAt) : null;

    const b = report?.battingMetrics;
    const w = report?.bowlingMetrics;
    const p = report?.postureMetrics;

    const frames: any[] = (report?.rawFrameMetrics || []).map((f: any) => ({
        frame: f.frameIndex,
        a: type === 'bowling' ? f.rightElbowAngle : f.leftKneeAngle,
        b: type === 'bowling' ? f.leftElbowAngle : f.rightKneeAngle,
    }));
    const chartLabels = type === 'bowling' ? ['Right elbow', 'Left elbow'] : ['Left knee', 'Right knee'];

    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <div className="page">
                    <div className="crumbs" style={{ marginBottom: 18 }}>
                        <Link href="/dashboard" className="row" style={{ gap: 6 }}><ArrowLeft size={15} /> Dashboard</Link>
                        <span>/</span>
                        <span style={{ color: 'var(--text-2)', textTransform: 'capitalize' }}>{type} analysis</span>
                    </div>

                    {loading ? <LoadingSpinner label="Loading analysis" /> : !upload ? (
                        <div className="notice notice-error">
                            <AlertTriangle size={20} />
                            <div style={{ flex: 1 }}>
                                <strong>Could not load this analysis</strong>
                                <div className="muted small">{loadError || 'The link may be wrong, or the server is unavailable.'}</div>
                                <div className="row" style={{ marginTop: 12 }}>
                                    <button className="btn btn-secondary btn-sm" onClick={() => fetchData(true)}>Try again</button>
                                    <Link href="/upload" className="btn btn-ghost btn-sm">Upload a new clip</Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ── Hero ── */}
                            <section className="hero pitch-stripes rise" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', padding: 'clamp(22px, 3vw, 36px)', marginBottom: 20 }}>
                                <div className="row wrap" style={{ gap: 28, alignItems: 'center' }}>
                                    {isCompleted && report && <ScoreBadge score={report.overallScore || 0} size="xl" caption="Overall" />}
                                    <div style={{ flex: 1, minWidth: 240 }}>
                                        <div className="row wrap" style={{ gap: 10 }}>
                                            <StatusBadge status={upload.status} />
                                            {created && <span className="muted small">{created.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
                                        </div>
                                        <h1 style={{ marginTop: 12, textTransform: 'uppercase' }}>{type} analysis</h1>
                                        <p className="lede" style={{ marginTop: 6, wordBreak: 'break-all' }}>{upload.originalName}</p>
                                        {isCompleted && report && (
                                            <p style={{ marginTop: 10, fontWeight: 600 }}>
                                                {scoreWord(report.overallScore)}
                                                {b?.shotType && !b.shotType.startsWith('Unclassified') && <span className="muted"> · {b.shotType}</span>}
                                                {w?.bowlingStyle && <span className="muted"> · {w.bowlingStyle}</span>}
                                            </p>
                                        )}
                                    </div>
                                    {upload.status === 'failed' && (
                                        <button className="btn btn-primary" onClick={retryAnalysis} disabled={retrying}>
                                            <RotateCcw size={16} /> {retrying ? 'Restarting…' : 'Retry analysis'}
                                        </button>
                                    )}
                                </div>
                            </section>

                            {/* ── Failed ── */}
                            {upload.status === 'failed' && (
                                <div className="notice notice-error rise rise-1" style={{ marginBottom: 20 }}>
                                    <AlertTriangle size={20} style={{ color: 'var(--poor)', flexShrink: 0 }} />
                                    <div>
                                        <strong>We couldn&apos;t analyse this clip</strong>
                                        <div className="small" style={{ color: 'var(--text-2)', marginTop: 4 }}>{formatErrorMessage(upload.errorMessage)}</div>
                                    </div>
                                </div>
                            )}

                            {/* ── In progress: honest stage tracker ── */}
                            {isWorking && (
                                <section className="card card-pad rise rise-1" aria-live="polite">
                                    <div className="row-between wrap" style={{ marginBottom: 22 }}>
                                        <div>
                                            <div className="eyebrow">Analysing</div>
                                            <h2 style={{ marginTop: 8 }}>{STAGES[stageIndex].title}</h2>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div className="label">Elapsed</div>
                                            <div className="stat-value tnum" style={{ fontSize: 34, marginTop: 4 }}>{fmtElapsed(elapsedMs)}</div>
                                        </div>
                                    </div>
                                    <div className="progress-indeterminate" style={{ marginBottom: 24 }} />
                                    <ol className="stack" style={{ listStyle: 'none', gap: 14 }}>
                                        {STAGES.map((s, i) => {
                                            const done = i < stageIndex, current = i === stageIndex;
                                            return (
                                                <li key={s.title} className="row" style={{ alignItems: 'flex-start', gap: 14, opacity: done || current ? 1 : 0.45 }}>
                                                    <span className="rank" style={{ width: 28, height: 28, fontSize: 14, background: done ? 'var(--white)' : current ? 'var(--navy-700)' : 'var(--navy-850)', color: done ? 'var(--navy-950)' : 'var(--text)' }}>
                                                        {done ? <Check size={15} /> : current ? <span className="spinner" style={{ width: 14, height: 14 }} /> : i + 1}
                                                    </span>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{s.title}</div>
                                                        {current && <div className="muted small" style={{ marginTop: 2 }}>{s.text}</div>}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                    {isStale && (
                                        <div className="notice notice-warn" style={{ marginTop: 22, alignItems: 'center' }}>
                                            <AlertTriangle size={18} style={{ color: 'var(--fair)' }} />
                                            <div style={{ flex: 1 }} className="small">This is taking much longer than usual. You can restart it — your clip is kept.</div>
                                            <button className="btn btn-secondary btn-sm" onClick={retryAnalysis} disabled={retrying}>
                                                <RotateCcw size={14} /> {retrying ? 'Restarting…' : 'Restart'}
                                            </button>
                                        </div>
                                    )}
                                    <p className="muted small" style={{ marginTop: 20 }}>You can leave this page — the analysis keeps running and appears on your dashboard when it&apos;s done.</p>
                                </section>
                            )}

                            {/* ── Report ── */}
                            {isCompleted && report && (
                                <div className="stack" style={{ gap: 20 }}>
                                    <div className="grid-4 rise rise-1">
                                        {type === 'batting' && b && <>
                                            <MetricCard label="Timing" value={b.timingScore} score={b.timingScore} note="Front foot into the swing" />
                                            <MetricCard label="Head stability" value={b.headStabilityScore} score={b.headStabilityScore} note={b.headStabilityScore == null ? 'Face not visible — film side-on' : 'Downswing'} />
                                            <MetricCard label="Balance" value={b.balanceScore} score={b.balanceScore} note="At contact" />
                                            <MetricCard label="Follow-through" value={b.followThroughScore} score={b.followThroughScore} />
                                            <MetricCard label="Stride" value={b.strideScore} score={b.strideScore} note={b.strideScore == null ? 'Needs a side-on camera' : undefined} />
                                            <MetricCard label="Set-up stance" value={b.stanceScore} score={b.stanceScore} />
                                            <MetricCard label="Swing plane" value={b.batSwingAngle != null ? Math.round(b.batSwingAngle) : null} unit="°" note="90° is a vertical bat" />
                                            <MetricCard label="Knee range" value={b.rangeOfMotion != null ? Math.round(b.rangeOfMotion) : null} unit="°" note="Front-knee drive" />
                                        </>}
                                        {type === 'bowling' && w && <>
                                            <MetricCard label="Release point" value={w.releasePointScore} score={w.releasePointScore} note="Height and extension" />
                                            <MetricCard label="Arm smoothness" value={w.armSmoothnessScore} score={w.armSmoothnessScore} />
                                            <MetricCard label="Wrist at release" value={w.wristPositionScore} score={w.wristPositionScore} />
                                            <MetricCard label="Balance" value={w.balanceScore} score={w.balanceScore} note="At release" />
                                            <MetricCard label="Elbow at release" value={w.releaseArmAngle != null ? Math.round(w.releaseArmAngle) : null} unit="°" note="180° is fully straight" />
                                            <MetricCard label="Ball speed" value={w.estimatedBallSpeed} unit="km/h" note={w.estimatedBallSpeed ? w.speedClassification : 'Ball not tracked'} />
                                        </>}
                                        {type === 'posture' && p && <>
                                            <MetricCard label="Shoulders" value={p.shoulderAlignmentScore} score={p.shoulderAlignmentScore} />
                                            <MetricCard label="Knee bend" value={p.kneeBendScore} score={p.kneeBendScore} note={p.kneeBendAngle != null ? `${Math.round(p.kneeBendAngle)}° at the knee` : undefined} />
                                            <MetricCard label="Hip balance" value={p.balanceScore} score={p.balanceScore} />
                                            <MetricCard label="Spine" value={p.spinePosScore} score={p.spinePosScore} />
                                        </>}
                                    </div>

                                    {(b?.headPosition || w?.releasePointNote || p?.shoulderAlignmentNote) && (
                                        <div className="notice notice-info rise rise-2">
                                            <Gauge size={18} style={{ color: 'var(--info)', flexShrink: 0 }} />
                                            <div className="small" style={{ color: 'var(--text-2)' }}>
                                                {b?.headPosition && <div><strong style={{ color: 'var(--text)' }}>Head · </strong>{b.headPosition}</div>}
                                                {w?.releasePointNote && <div><strong style={{ color: 'var(--text)' }}>Release · </strong>{w.releasePointNote}</div>}
                                                {w?.wristPositionNote && <div><strong style={{ color: 'var(--text)' }}>Wrist · </strong>{w.wristPositionNote}</div>}
                                                {p?.shoulderAlignmentNote && <div><strong style={{ color: 'var(--text)' }}>Shoulders · </strong>{p.shoulderAlignmentNote}</div>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Faults */}
                                    <section className="card card-pad rise rise-2">
                                        <div className="card-head">
                                            <h3>Technique faults</h3>
                                            <span className="badge">{report.faultLog?.length || 0} found</span>
                                        </div>
                                        {report.faultLog?.length ? (
                                            <div className="list">
                                                {report.faultLog.map((f: any) => (
                                                    <div key={f.id} className="list-item" style={{ alignItems: 'flex-start' }}>
                                                        <span className={`badge ${f.severity === 'critical' ? 'badge-poor' : f.severity === 'moderate' ? 'badge-fair' : ''}`} style={{ flexShrink: 0 }}>{f.severity}</span>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 600 }}>{f.faultText}</div>
                                                            <div className="muted small tnum">Measured {f.metric} = {f.value} · threshold {f.threshold}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p className="muted small">No measured fault crossed its threshold in this clip.</p>}
                                    </section>

                                    {/* Frame-by-frame */}
                                    {frames.length > 3 && (
                                        <section className="card card-pad rise rise-3">
                                            <div className="card-head">
                                                <h3 className="row" style={{ gap: 10 }}><LineIcon size={18} /> Frame by frame</h3>
                                                <div className="row small muted" style={{ gap: 16 }}>
                                                    <span className="row" style={{ gap: 6 }}><i style={{ width: 14, height: 2, background: CHART.primary, display: 'inline-block' }} />{chartLabels[0]}</span>
                                                    <span className="row" style={{ gap: 6 }}><i style={{ width: 14, height: 2, background: CHART.secondary, display: 'inline-block' }} />{chartLabels[1]}</span>
                                                </div>
                                            </div>
                                            <div style={{ height: 220 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={frames} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                                                        <CartesianGrid stroke={CHART.grid} vertical={false} />
                                                        <XAxis dataKey="frame" stroke={CHART.axis} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                                        <YAxis stroke={CHART.axis} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} unit="°" domain={['auto', 'auto']} />
                                                        <Tooltip contentStyle={{ background: CHART.tooltip, border: `1px solid ${CHART.grid}`, borderRadius: 10, fontSize: 12 }} labelFormatter={v => `Frame ${v}`} formatter={(v: any, n: any) => [`${Math.round(v)}°`, n === 'a' ? chartLabels[0] : chartLabels[1]]} />
                                                        <Line type="monotone" dataKey="a" stroke={CHART.primary} strokeWidth={2} dot={false} connectNulls />
                                                        <Line type="monotone" dataKey="b" stroke={CHART.secondary} strokeWidth={1.5} dot={false} connectNulls />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <p className="muted small" style={{ marginTop: 10 }}>Joint angles measured on each analysed frame of the key moment.</p>
                                        </section>
                                    )}

                                    {/* Coaching */}
                                    <div className="grid-2">
                                        <Section title="Strengths" items={report.strengths} empty="No metric reached the strong band in this clip." />
                                        <Section title="Work-ons" items={report.weaknesses} variant="warn" empty="Nothing flagged — keep repeating this under pressure." />
                                        <Section title="Coaching cues" items={report.improvementSuggestions} variant="dots" />
                                        <Section title="Drills" items={report.trainingDrills} variant="dots" />
                                    </div>
                                    {(report.recommendations?.length > 0 || report.bestPractices?.length > 0) && (
                                        <section className="panel-black card-pad">
                                            <div className="grid-2" style={{ gap: 28 }}>
                                                <div>
                                                    <div className="eyebrow" style={{ marginBottom: 14 }}>Recommendations</div>
                                                    <ul className="ticks dots">{(report.recommendations || []).map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                                                </div>
                                                <div>
                                                    <div className="eyebrow" style={{ marginBottom: 14 }}>Good habits</div>
                                                    <ul className="ticks dots">{(report.bestPractices || []).map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    <div className="row wrap" style={{ paddingBottom: 12 }}>
                                        <Link href="/upload" className="btn btn-primary btn-lg"><Upload size={17} /> Analyse another clip</Link>
                                        <Link href="/progress" className="btn btn-secondary btn-lg">See your progress</Link>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
