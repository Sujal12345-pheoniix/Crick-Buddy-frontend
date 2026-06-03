'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { MetricCard, ScoreBadge, StatusBadge, LoadingSpinner } from '@/components/ui';
import { uploadsAPI, reportsAPI } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnalysisPage() {
    const { id } = useParams() as { id: string };
    const { user } = useAuth();
    const [upload, setUpload] = useState<any>(null);
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [retrying, setRetrying] = useState(false);
    const [loadError, setLoadError] = useState<string>('');

    const fetchData = async (isInitial = false) => {
        try {
            const u = await uploadsAPI.getOne(id);
            if (!u.data.upload) {
                setLoadError('Upload data not available yet.');
                if (isInitial) toast.error('Upload record is empty');
                return;
            }
            setLoadError('');
            setUpload(u.data.upload);
            
            if (u.data.upload.status === 'completed') {
                try {
                    const r = await reportsAPI.byUpload(id);
                    if (r.data.report) {
                        setReport(r.data.report);
                    }
                } catch (err) {
                    console.warn('Report not ready yet even though upload is marked complete');
                }
            }
        } catch (err: any) {
            setLoadError(err.response?.data?.message || 'Could not load this analysis.');
            // Only show toast on initial load, otherwise stay silent during polling
            if (isInitial) {
                toast.error(err.response?.data?.message || 'Upload not found — make sure the backend is running on port 5000');
            }
            console.error('Error fetching analysis data:', err);
        } finally {
            // Always release loading state, not just on initial — prevents eternal spinner
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(true); }, [id]);

    // Poll while processing
    useEffect(() => {
        if (!upload) return;
        const shouldPoll = upload.status === 'pending' || upload.status === 'processing' || (upload.status === 'completed' && !report);
        if (!shouldPoll) return;
        const interval = setInterval(() => fetchData(), 4000);
        return () => clearInterval(interval);
    }, [upload?.status, report]);

    const m = report;
    const isCompleted = upload?.status === 'completed';
    const type = upload?.type || 'analysis';
    const isStaleProcessing = (() => {
        if (!upload?.createdAt) return false;
        if (!['pending', 'processing'].includes(upload?.status)) return false;
        const createdAt = new Date(upload.createdAt).getTime();
        if (Number.isNaN(createdAt)) return false;
        const minutesElapsed = (Date.now() - createdAt) / (1000 * 60);
        return minutesElapsed >= 10;
    })();

    const retryAnalysis = async () => {
        if (!id || retrying) return;
        try {
            setRetrying(true);
            await uploadsAPI.retryAnalysis(id);
            toast.success('Analysis restarted. Please wait for fresh report generation.');
            await fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Could not restart analysis');
        } finally {
            setRetrying(false);
        }
    };

    const createdAtText = (() => {
        if (!upload?.createdAt) return '—';
        const parsed = new Date(upload.createdAt);
        return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleString();
    })();

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ padding: 'clamp(16px,3vw,32px) clamp(16px,3.5vw,40px)', width: '100%' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                    <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 14 }}>
                        <ArrowLeft size={16} /> Dashboard
                    </Link>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
                    <span style={{ color: '#fff', fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>
                        {type} Analysis
                    </span>
                </div>

                {loading ? <LoadingSpinner /> : (
                    <>
                        {!upload && (
                            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Could not load analysis</div>
                                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 14 }}>
                                    {loadError || 'The upload id may be invalid or the backend service is unavailable.'}
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button className="btn-secondary" onClick={() => fetchData(true)}>Retry</button>
                                    <Link href="/upload" className="btn-primary">Upload New Video</Link>
                                </div>
                            </div>
                        )}

                        {/* Status card */}
                        {upload && (
                        <div className="card-glass analysis-status-card" style={{ padding: 'clamp(16px,2.5vw,28px) clamp(16px,3vw,32px)', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.2)', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                                {isCompleted && report && <ScoreBadge score={report.overallScore || 0} size="lg" />}
                                <div>
                                    <div style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 900, textTransform: 'capitalize', marginBottom: 6, letterSpacing: '-0.02em' }}>
                                        {type} Analysis <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>—</span> {isCompleted ? <span style={{ color: 'var(--accent-green-bright)' }}>Success</span> : <span style={{ color: 'var(--accent-gold)' }}>{upload?.status}</span>}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{upload?.originalName || 'Analysis Record'}</span>
                                        <span style={{ opacity: 0.3 }}>|</span>
                                        <span>{createdAtText}</span>
                                    </div>
                                    <div style={{ marginTop: 12 }}><StatusBadge status={upload?.status} /></div>
                                </div>
                            </div>
                            {!isCompleted && upload?.status !== 'failed' && (
                                <div style={{ textAlign: 'right', minWidth: 220 }}>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>
                                        AI ENGINE PROCESSING... {upload?.processingProgress || 0}%
                                    </div>
                                    <div className="xp-bar-container" style={{ height: 10 }}>
                                        <div className="xp-bar-fill" style={{ width: `${upload?.processingProgress || 0}%` }} />
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--accent-green-bright)', marginTop: 8, fontWeight: 500, animation: 'glow-pulse 2s infinite' }}>
                                        Analyzing pose biomechanics...
                                    </div>
                                </div>
                            )}
                            {upload?.status === 'failed' && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                                    <div style={{ color: 'var(--accent-red)', fontSize: 14, fontWeight: 600, background: 'rgba(239,68,68,0.1)', padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
                                        ⚠️ {upload?.errorMessage || 'Analysis failed'}
                                    </div>
                                    <button className="btn btn-secondary" onClick={retryAnalysis} disabled={retrying}>
                                        {retrying ? 'Retrying...' : 'Restart Analysis Engine'}
                                    </button>
                                </div>
                            )}
                        </div>
                        )}

                        {isStaleProcessing && (
                            <div style={{ marginBottom: 32 }}>
                                <div className="card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', border: '1px solid var(--accent-gold)' }}>
                                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                        <div style={{ fontSize: 24 }}>⏳</div>
                                        <div>
                                            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>Analysis Timeout</div>
                                            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                                                The analysis is taking longer than usual. You can try restarting the process.
                                            </div>
                                        </div>
                                    </div>
                                    <button className="btn btn-secondary" onClick={retryAnalysis} disabled={retrying} style={{ borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}>
                                        {retrying ? 'Retrying...' : 'Restart Analysis'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Report details */}
                        {isCompleted && report && (
                            <div className="animate-fadeUp">
                                {/* Batting metrics */}
                                {type === 'batting' && report.battingMetrics && (
                                    <div style={{ marginBottom: 40 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                            <div style={{ fontSize: 28 }}>🏏</div>
                                            <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>Technical Batting Performance</h2>
                                        </div>
                                        <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                                            <MetricCard label="Stance Alignment" value={report.battingMetrics.stanceScore} unit="pts" score={report.battingMetrics.stanceScore} />
                                            <MetricCard label="Swing Plane Angle" value={report.battingMetrics.batSwingAngle?.toFixed(1) || '—'} unit="°" />
                                            <MetricCard label="Head Stability" value={report.battingMetrics.headPositionScore} unit="pts" score={report.battingMetrics.headPositionScore} />
                                            <MetricCard label="Impact Timing" value={report.battingMetrics.timingScore} unit="pts" score={report.battingMetrics.timingScore} />
                                            <MetricCard label="Power Follow-Through" value={report.battingMetrics.followThroughScore} unit="pts" score={report.battingMetrics.followThroughScore} />
                                            <MetricCard label="Detected Shot" value={report.battingMetrics.shotType || '—'} color="var(--accent-secondary)" />
                                        </div>
                                        {report.battingMetrics.headPosition && (
                                            <div style={{ marginTop: 20, padding: '16px 20px', background: 'var(--accent-green-dim)', borderRadius: 12, border: '1px solid var(--border-green)', fontSize: 15, color: 'var(--text-primary)', display: 'flex', gap: 12, alignItems: 'center' }}>
                                                <span style={{ fontSize: 20 }}>🎯</span>
                                                <div><strong>Coach's Observation:</strong> {report.battingMetrics.headPosition}</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Bowling metrics */}
                                {type === 'bowling' && report.bowlingMetrics && (
                                    <div style={{ marginBottom: 40 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                            <div style={{ fontSize: 28 }}>⚡</div>
                                            <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>Pace & Delivery Metrics</h2>
                                        </div>
                                        <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                                            <MetricCard label="Seam Position (Wrist)" value={report.bowlingMetrics.wristPositionScore} unit="pts" score={report.bowlingMetrics.wristPositionScore} color="var(--accent-blue)" />
                                            <MetricCard label="Arm Extension" value={report.bowlingMetrics.armRotationAngle?.toFixed(1) || '—'} unit="°" color="var(--accent-blue)" />
                                            <MetricCard label="Release Elevation" value={report.bowlingMetrics.releasePointScore} unit="pts" score={report.bowlingMetrics.releasePointScore} color="var(--accent-blue)" />
                                            <MetricCard label="Calculated Speed" value={report.bowlingMetrics.estimatedBallSpeed || '—'} unit="km/h" color="var(--accent-green-bright)" />
                                            <MetricCard label="Delivery Balance" value={report.bowlingMetrics.balanceScore} unit="pts" score={report.bowlingMetrics.balanceScore} color="var(--accent-blue)" />
                                            <MetricCard label="Action Style" value={report.bowlingMetrics.bowlingStyle || '—'} color="var(--accent-gold)" />
                                        </div>
                                        
                                        {/* Enhanced Speed Gauge */}
                                        <div style={{ marginTop: 24, padding: 28, background: 'linear-gradient(145deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))', borderRadius: 20, border: '1px solid var(--border-green)', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
                                            <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '20px 30px', borderRadius: 16, border: '1px solid rgba(16,185,129,0.2)' }}>
                                                <div style={{ fontSize: 56, fontWeight: 900, color: 'var(--accent-green-bright)', lineHeight: 1 }}>{report.bowlingMetrics.estimatedBallSpeed || 0}</div>
                                                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, fontWeight: 700 }}>KM/H</div>
                                            </div>
                                            <div style={{ flex: 1, minWidth: 280 }}>
                                                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Ball Speed Analysis</div>
                                                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                                    {report.bowlingMetrics.releasePointNote || 'High-precision optical flow motion tracking across video sequence.'}
                                                </div>
                                                <div className="xp-bar-container" style={{ marginTop: 16, height: 12 }}>
                                                    <div className="xp-bar-fill" style={{ width: `${Math.min(100, ((report.bowlingMetrics.estimatedBallSpeed || 0) / 160) * 100)}%` }} />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontWeight: 700, letterSpacing: '0.05em' }}>
                                                    <span>MIN (80 KM/H)</span>
                                                    <span>ELITE (160 KM/H)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Posture metrics */}
                                {type === 'posture' && report.postureMetrics && (
                                    <div style={{ marginBottom: 40 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                            <div style={{ fontSize: 28 }}>📸</div>
                                            <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>Athletic Posture Analysis</h2>
                                        </div>
                                        <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                                            <MetricCard label="Shoulder Parallelism" value={report.postureMetrics.shoulderAlignmentScore} unit="pts" score={report.postureMetrics.shoulderAlignmentScore} color="var(--accent-gold)" />
                                            <MetricCard label="Knee Flexion" value={report.postureMetrics.kneeBendAngle?.toFixed(1) || '—'} unit="°" color="var(--accent-gold)" />
                                            <MetricCard label="Kinetic Balance" value={report.postureMetrics.balanceScore} unit="pts" score={report.postureMetrics.balanceScore} color="var(--accent-gold)" />
                                            <MetricCard label="Spinal Alignment" value={report.postureMetrics.spinePosScore} unit="pts" score={report.postureMetrics.spinePosScore} color="var(--accent-gold)" />
                                        </div>
                                    </div>
                                )}

                                {/* AI Expert Report - Grid Layout */}
                                <div className="ai-report-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 40 }}>
                                    <div className="card" style={{ padding: 28, background: 'rgba(16,185,129,0.03)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green-bright)' }}>💪</div>
                                            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Key Technical Strengths</h3>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                            {(report.strengths || []).map((s: string, i: number) => (
                                                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--accent-green-bright)', flexShrink: 0, marginTop: 2 }}>✓</div>
                                                    <span style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="card" style={{ padding: 28, background: 'rgba(239,68,68,0.03)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-red)' }}>⚠️</div>
                                            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Areas for Development</h3>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                            {(report.weaknesses || []).map((w: string, i: number) => (
                                                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--accent-red)', flexShrink: 0, marginTop: 2 }}>!</div>
                                                    <span style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{w}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="card" style={{ padding: 28 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>💡</div>
                                            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Coaching Cues</h3>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                            {(report.improvementSuggestions || []).map((s: string, i: number) => (
                                                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                                    <div style={{ color: 'var(--accent-primary)', marginTop: 2, flexShrink: 0 }}>→</div>
                                                    <span style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="card" style={{ padding: 28 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>🏋️</div>
                                            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Drills to Master</h3>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                            {(report.trainingDrills || []).map((d: string, i: number) => (
                                                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-gold)', flexShrink: 0, marginTop: 9 }}></div>
                                                    <span style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{d}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="card-glass" style={{ padding: 32, gridColumn: '1 / -1', background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.2)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🛡️</div>
                                            <div>
                                                <h3 style={{ fontSize: 20, fontWeight: 900 }}>Pro Strategy & Habits</h3>
                                                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Expert advice on recovery, gear, and elite best practices.</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                                            <div>
                                                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Recommendations</h4>
                                                {(report.recommendations || []).map((r: string, i: number) => (
                                                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                        <span style={{ color: 'var(--accent-secondary)' }}>•</span> {r}
                                                    </div>
                                                ))}
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent-green-bright)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Elite Best Practices</h4>
                                                {(report.bestPractices || []).map((p: string, i: number) => (
                                                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                        <span style={{ color: 'var(--accent-green-bright)' }}>★</span> {p}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="btn-group-mobile" style={{ display: 'flex', gap: 16, paddingBottom: 60, flexWrap: 'wrap' }}>
                                    <Link href="/upload" className="btn btn-primary btn-lg">
                                        Analyze Another Video
                                    </Link>
                                    <Link href="/progress" className="btn btn-secondary btn-lg">
                                        View Improvement Roadmap
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Processing or failed state */}
                        {(upload && (!isCompleted || !report) && upload?.status !== 'failed') && (
                            <div className="animate-fadeIn" style={{ textAlign: 'center', padding: '100px 0' }}>
                                <div style={{ fontSize: 80, marginBottom: 24, animation: 'float 4s ease-in-out infinite' }}>🤖</div>
                                <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 16, letterSpacing: '-0.02em' }}>AI Engine is Processing Your {type}</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: 12, fontSize: 17, maxWidth: 600, margin: '0 auto 12px', lineHeight: 1.7 }}>
                                    {upload?.status === 'completed' ? 'Finalizing report generation and synchronizing with your athlete profile...' : 'MediaPipe is performing frame-by-frame biomechanical extraction...'}
                                </p>
                                <div style={{ color: 'var(--accent-green-bright)', fontSize: 14, fontWeight: 600 }}>
                                    Auto-refreshing in 4s...
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
