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
            <main className="main-content" style={{ padding: '32px 40px' }}>
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
                        <div className="card" style={{ padding: 24, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                {isCompleted && report && <ScoreBadge score={report.overallScore || 0} size="lg" />}
                                <div>
                                    <div style={{ fontSize: 20, fontWeight: 800, textTransform: 'capitalize', marginBottom: 4 }}>
                                        {type} Analysis — {isCompleted ? 'Complete' : upload?.status}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
                                        {upload?.originalName || 'Uploaded file'} · {createdAtText}
                                    </div>
                                    <div style={{ marginTop: 8 }}><StatusBadge status={upload?.status} /></div>
                                </div>
                            </div>
                            {!isCompleted && upload?.status !== 'failed' && (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                                        Processing... {upload?.processingProgress || 0}%
                                    </div>
                                    <div className="progress-bar" style={{ width: 200 }}>
                                        <div className="progress-fill" style={{ width: `${upload?.processingProgress || 0}%` }} />
                                    </div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>Auto-refreshing...</div>
                                </div>
                            )}
                            {upload?.status === 'failed' && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                                    <div style={{ color: '#ff4757', fontSize: 14 }}>❌ {upload?.errorMessage || 'Analysis failed'}</div>
                                    <button className="btn-secondary" onClick={retryAnalysis} disabled={retrying}>
                                        {retrying ? 'Retrying...' : 'Retry Analysis'}
                                    </button>
                                </div>
                            )}
                        </div>
                        )}

                        {isStaleProcessing && (
                            <div style={{ marginBottom: 24 }}>
                                <div className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Processing is taking longer than expected</div>
                                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                                            Retry to regenerate the report if the worker was interrupted.
                                        </div>
                                    </div>
                                    <button className="btn-secondary" onClick={retryAnalysis} disabled={retrying}>
                                        {retrying ? 'Retrying...' : 'Retry Analysis'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Report details */}
                        {isCompleted && report && (
                            <>
                                {/* Batting metrics */}
                                {type === 'batting' && report.battingMetrics && (
                                    <div style={{ marginBottom: 24 }}>
                                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🏏 Batting Metrics</h2>
                                        <div className="metric-grid">
                                            <MetricCard label="Stance" value={report.battingMetrics.stanceScore} unit="pts" score={report.battingMetrics.stanceScore} />
                                            <MetricCard label="Bat Swing Angle" value={report.battingMetrics.batSwingAngle?.toFixed(1) || '—'} unit="°" />
                                            <MetricCard label="Head Position" value={report.battingMetrics.headPositionScore} unit="pts" score={report.battingMetrics.headPositionScore} />
                                            <MetricCard label="Timing" value={report.battingMetrics.timingScore} unit="pts" score={report.battingMetrics.timingScore} />
                                            <MetricCard label="Follow-Through" value={report.battingMetrics.followThroughScore} unit="pts" score={report.battingMetrics.followThroughScore} />
                                            <MetricCard label="Shot Type" value={report.battingMetrics.shotType || '—'} />
                                        </div>
                                        {report.battingMetrics.headPosition && (
                                            <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(0,255,136,0.06)', borderRadius: 8, border: '1px solid rgba(0,255,136,0.15)', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                                                🎯 <strong>Head Position:</strong> {report.battingMetrics.headPosition}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Bowling metrics */}
                                {type === 'bowling' && report.bowlingMetrics && (
                                    <div style={{ marginBottom: 24 }}>
                                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>⚡ Bowling Metrics</h2>
                                        <div className="metric-grid">
                                            <MetricCard label="Wrist Position" value={report.bowlingMetrics.wristPositionScore} unit="pts" score={report.bowlingMetrics.wristPositionScore} color="#3b82f6" />
                                            <MetricCard label="Arm Rotation" value={report.bowlingMetrics.armRotationAngle?.toFixed(1) || '—'} unit="°" color="#3b82f6" />
                                            <MetricCard label="Release Point" value={report.bowlingMetrics.releasePointScore} unit="pts" score={report.bowlingMetrics.releasePointScore} color="#3b82f6" />
                                            <MetricCard label="Ball Speed" value={report.bowlingMetrics.estimatedBallSpeed || '—'} unit="km/h" color="#00ff88" />
                                            <MetricCard label="Balance" value={report.bowlingMetrics.balanceScore} unit="pts" score={report.bowlingMetrics.balanceScore} color="#3b82f6" />
                                            <MetricCard label="Bowling Style" value={report.bowlingMetrics.bowlingStyle || '—'} color="#f59e0b" />
                                        </div>
                                        {report.bowlingMetrics.releasePointNote && (
                                            <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(59,130,246,0.06)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.15)', fontSize: 14 }}>
                                                🎯 {report.bowlingMetrics.releasePointNote}
                                            </div>
                                        )}
                                        {/* Speed gauge */}
                                        <div style={{ marginTop: 16, padding: 20, background: 'rgba(0,255,136,0.04)', borderRadius: 12, border: '1px solid rgba(0,255,136,0.1)', display: 'flex', alignItems: 'center', gap: 24 }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: 48, fontWeight: 900, color: '#00ff88' }}>{report.bowlingMetrics.estimatedBallSpeed || 0}</div>
                                                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>km/h</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Ball Speed Estimation</div>
                                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                                                    Calculated using OpenCV optical flow analysis across video frames
                                                </div>
                                                <div className="progress-bar" style={{ marginTop: 10, width: 300 }}>
                                                    <div className="progress-fill" style={{ width: `${Math.min(100, ((report.bowlingMetrics.estimatedBallSpeed || 0) / 160) * 100)}%` }} />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                                                    <span>80 km/h</span><span>160 km/h</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Posture metrics */}
                                {type === 'posture' && report.postureMetrics && (
                                    <div style={{ marginBottom: 24 }}>
                                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📸 Posture Metrics</h2>
                                        <div className="metric-grid">
                                            <MetricCard label="Shoulder Alignment" value={report.postureMetrics.shoulderAlignmentScore} unit="pts" score={report.postureMetrics.shoulderAlignmentScore} color="#f59e0b" />
                                            <MetricCard label="Knee Bend Angle" value={report.postureMetrics.kneeBendAngle?.toFixed(1) || '—'} unit="°" color="#f59e0b" />
                                            <MetricCard label="Knee Bend Score" value={report.postureMetrics.kneeBendScore} unit="pts" score={report.postureMetrics.kneeBendScore} color="#f59e0b" />
                                            <MetricCard label="Balance" value={report.postureMetrics.balanceScore} unit="pts" score={report.postureMetrics.balanceScore} color="#f59e0b" />
                                            <MetricCard label="Spine Position" value={report.postureMetrics.spinePosScore} unit="pts" score={report.postureMetrics.spinePosScore} color="#f59e0b" />
                                        </div>
                                    </div>
                                )}

                                {/* AI Report */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                                    <div className="card" style={{ padding: 24 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#00ff88', marginBottom: 16 }}>💪 Strengths</h3>
                                        {(report.strengths || []).map((s: string, i: number) => (
                                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                                                <span style={{ color: '#00ff88', marginTop: 2, flexShrink: 0 }}>✓</span>
                                                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="card" style={{ padding: 24 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ff4757', marginBottom: 16 }}>⚠️ Weaknesses</h3>
                                        {(report.weaknesses || []).map((w: string, i: number) => (
                                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                                                <span style={{ color: '#ff4757', marginTop: 2, flexShrink: 0 }}>!</span>
                                                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{w}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="card" style={{ padding: 24 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ff6b6b', marginBottom: 16 }}>❌ Mistakes Identified</h3>
                                        {(report.mistakes || []).map((m: string, i: number) => (
                                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                                                <span style={{ color: '#ff6b6b', marginTop: 2 }}>✕</span>
                                                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{m}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="card" style={{ padding: 24 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6', marginBottom: 16 }}>💡 Improvement Tips</h3>
                                        {(report.improvementSuggestions || []).map((s: string, i: number) => (
                                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                                                <span style={{ color: '#3b82f6', marginTop: 2 }}>→</span>
                                                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="card" style={{ padding: 24 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', marginBottom: 16 }}>🏋️ Training Drills</h3>
                                        {(report.trainingDrills || []).map((d: string, i: number) => (
                                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                                                <span style={{ color: '#f59e0b', marginTop: 2 }}>▶</span>
                                                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{d}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="card" style={{ padding: 24 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#10b981', marginBottom: 16 }}>🛡️ Best Practices</h3>
                                        {(report.bestPractices || []).map((p: string, i: number) => (
                                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                                                <span style={{ color: '#10b981', marginTop: 2 }}>⭐</span>
                                                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{p}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="card" style={{ padding: 24, gridColumn: 'span 2' }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#8b5cf6', marginBottom: 16 }}>🎒 Equipment & Strategy Recommendations</h3>
                                        {(report.recommendations || []).map((r: string, i: number) => (
                                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                                                <span style={{ color: '#8b5cf6', marginTop: 2 }}>✓</span>
                                                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{r}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 12 }}>
                                    <Link href="/upload" className="btn-primary">Upload Another Video</Link>
                                    <Link href="/progress" className="btn-secondary">View Progress Charts</Link>
                                </div>
                            </>
                        )}

                        {/* Processing or failed state */}
                        {(upload && (!isCompleted || !report) && upload?.status !== 'failed') && (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <div style={{ fontSize: 64, marginBottom: 20 }}>🤖</div>
                                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>AI is Analyzing Your {type}</h2>
                                <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>
                                    {upload?.status === 'completed' ? 'Finishing report generation and storing your analysis...' : 'MediaPipe is extracting pose landmarks from your video frames...'}
                                </p>
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>This page will update automatically every 4 seconds.</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
