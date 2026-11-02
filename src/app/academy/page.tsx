'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { academyAPI } from '@/lib/api';
import { LoadingSpinner, EmptyState, PageHeader, scoreBand } from '@/components/ui';
import { Users, Trophy, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const initial = (name?: string) => (name?.trim().charAt(0) || '?').toUpperCase();
const hasScore = (v: any) => typeof v === 'number' && !Number.isNaN(v);
const fmtDate = (v: any) => {
    const d = v ? new Date(v) : null;
    return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never';
};

/** Display-type score, coloured by band. */
function Score({ value, size = 26 }: { value: any; size?: number }) {
    const shown = hasScore(value) ? Math.round(value) : null;
    const band = scoreBand(shown);
    return (
        <span className={`stat-value ${band ? `score-${band}` : 'muted'}`} style={{ fontSize: size, marginTop: 0, display: 'inline-block' }}>
            {shown ?? '—'}
        </span>
    );
}

export default function AcademyPage() {
    const { user } = useAuth();
    const [players, setPlayers] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'players' | 'leaderboard'>('players');

    useEffect(() => {
        const fetch = async () => {
            try {
                const [p, l] = await Promise.all([academyAPI.getPlayers(), academyAPI.getLeaderboard()]);
                setPlayers(p.data.players || []);
                setLeaderboard(l.data.leaderboard || []);
            } catch { }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const rankClass = (i: number) => i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';

    // Squad summary for the scoreboard strip (presentation only).
    const latestScores = players.map(p => p.latestReport?.overallScore).filter(hasScore);
    const squadAverage = latestScores.length ? Math.round(latestScores.reduce((a: number, b: number) => a + b, 0) / latestScores.length) : null;
    const totalAnalyses = players.reduce((n: number, p: any) => n + (p.totalReports || 0), 0);
    const board = [
        { label: 'Players', value: players.length, band: '' },
        { label: 'Analyses', value: totalAnalyses, band: '' },
        { label: 'Squad average', value: squadAverage ?? '—', band: scoreBand(squadAverage) },
    ];

    const tabs = [
        { key: 'players', icon: Users, label: 'Roster' },
        { key: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    ] as const;

    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <div className="page">
                    <PageHeader
                        eyebrow="Academy"
                        title={user?.role === 'coach' ? 'Your squad' : 'Academy'}
                        description={user?.role === 'coach' ? 'Monitor your players and track team progress.' : 'Every registered player and the academy rankings.'}
                    />

                    {/* Scoreboard strip */}
                    <section className="panel-black crease rise rise-1" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 0 }}>
                            {board.map((b, i) => (
                                <div key={b.label} style={{ padding: '20px 22px', borderLeft: i ? '1px solid var(--line)' : 0 }}>
                                    <div className="label">{b.label}</div>
                                    <div className={`stat-value ${b.band ? `score-${b.band}` : ''}`} style={{ fontSize: 44 }}>
                                        {loading ? <span className="skeleton" style={{ display: 'inline-block', width: 54, height: 36 }} /> : b.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Tabs */}
                    <div className="segmented rise rise-2" role="tablist" aria-label="Academy views" style={{ marginBottom: 20 }}>
                        {tabs.map(t => (
                            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key}
                                className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>
                                <t.icon size={15} /> {t.label}
                            </button>
                        ))}
                    </div>

                    {loading ? <LoadingSpinner label="Loading squad" /> : tab === 'players' ? (
                        <section className="card rise rise-3" style={{ overflow: 'hidden' }}>
                            {players.length === 0 ? (
                                <EmptyState icon={<Users size={24} />} title="No players yet"
                                    description="Players appear here as soon as they register." />
                            ) : (
                                <div className="table-scroll">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Player</th>
                                                <th>Role</th>
                                                <th>Level</th>
                                                <th style={{ textAlign: 'right' }}>Analyses</th>
                                                <th style={{ textAlign: 'right' }}>Latest</th>
                                                <th>Last active</th>
                                                <th><span className="sr-only">Actions</span></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {players.map((p: any) => (
                                                <tr key={p.id}>
                                                    <td>
                                                        <div className="row" style={{ gap: 12 }}>
                                                            <span className="avatar" style={{ width: 34, height: 34, fontSize: 15 }} aria-hidden="true">{initial(p.name)}</span>
                                                            <div style={{ minWidth: 0 }}>
                                                                <div style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{p.name}</div>
                                                                <div className="muted small" style={{ whiteSpace: 'nowrap' }}>{p.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{p.playerType || '—'}</td>
                                                    <td>{p.experienceLevel ? <span className="badge">{p.experienceLevel}</span> : <span className="muted">—</span>}</td>
                                                    <td className="tnum" style={{ textAlign: 'right' }}>{p.totalReports ?? 0}</td>
                                                    <td style={{ textAlign: 'right' }}><Score value={p.latestReport?.overallScore} /></td>
                                                    <td className="muted small" style={{ whiteSpace: 'nowrap' }}>{fmtDate(p.lastLogin)}</td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <Link href={`/academy/player/${p.id}`} className="btn btn-ghost btn-sm" aria-label={`View ${p.name}`}>
                                                            View <ArrowUpRight size={14} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    ) : (
                        /* Leaderboard */
                        <section className="card rise rise-3" style={{ overflow: 'hidden' }}>
                            {leaderboard.length === 0 ? (
                                <EmptyState icon={<Trophy size={24} />} title="No rankings yet"
                                    description="Players appear here once they complete an analysis." />
                            ) : (
                                <div className="table-scroll">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: 64 }}>Pos</th>
                                                <th>Player</th>
                                                <th style={{ textAlign: 'right' }}>Analyses</th>
                                                <th style={{ textAlign: 'right' }}>Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaderboard.map((player: any, i: number) => (
                                                <tr key={player.id}>
                                                    <td><span className={`rank ${rankClass(i)}`}>{i + 1}</span></td>
                                                    <td>
                                                        <div className="row" style={{ gap: 12 }}>
                                                            <span className="avatar hide-mobile" style={{ width: 34, height: 34, fontSize: 15 }} aria-hidden="true">{initial(player.name)}</span>
                                                            <div style={{ minWidth: 0 }}>
                                                                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{player.name}</div>
                                                                <div className="muted small" style={{ textTransform: 'capitalize' }}>
                                                                    {player.playerType || '—'} · {player.experienceLevel || '—'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="tnum" style={{ textAlign: 'right' }}>{player.totalReports ?? 0}</td>
                                                    <td style={{ textAlign: 'right' }}><Score value={player.totalReports ? player.overallScore : null} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
