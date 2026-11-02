'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { academyAPI } from '@/lib/api';
import { LoadingSpinner, EmptyState, PageHeader, scoreBand } from '@/components/ui';
import { Trophy } from 'lucide-react';

const initial = (name?: string) => (name?.trim().charAt(0) || '?').toUpperCase();
const hasScore = (v: any) => typeof v === 'number' && !Number.isNaN(v);

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

export default function LeaderboardPage() {
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        academyAPI.getLeaderboard()
            .then(r => setPlayers(r.data.leaderboard || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const rankClass = (i: number) => i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';

    // Podium order: second, first, third — first stands tallest in the middle.
    const podium = players.length >= 3
        ? [{ p: players[1], pos: 2, h: 92 }, { p: players[0], pos: 1, h: 132 }, { p: players[2], pos: 3, h: 64 }]
        : [];

    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <div className="page">
                    <PageHeader
                        eyebrow="Leaderboard"
                        title="Player rankings"
                        description="Every player ranked by overall technique score across their analysed clips."
                    />

                    {loading ? <LoadingSpinner label="Loading rankings" /> : players.length === 0 ? (
                        <section className="card rise rise-1">
                            <EmptyState icon={<Trophy size={24} />} title="No rankings yet"
                                description="Complete an analysis to take your place on the table." />
                        </section>
                    ) : (
                        <>
                            {/* Podium */}
                            {podium.length === 3 && (
                                <section className="panel-black pitch-stripes rise rise-1" style={{ padding: 'clamp(18px, 3vw, 32px) clamp(12px, 3vw, 32px) 0', marginBottom: 24, overflow: 'hidden' }}>
                                    <div className="label" style={{ textAlign: 'center', marginBottom: 20 }}>Top of the table</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 'clamp(8px, 2vw, 18px)', alignItems: 'end', maxWidth: 640, margin: '0 auto' }}>
                                        {podium.map(({ p, pos, h }) => (
                                            <div key={p.id} style={{ textAlign: 'center', minWidth: 0 }}>
                                                <div className="avatar" style={{ margin: '0 auto 10px', width: pos === 1 ? 56 : 46, height: pos === 1 ? 56 : 46, fontSize: pos === 1 ? 24 : 19 }}>
                                                    {initial(p.name)}
                                                </div>
                                                <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name?.split(' ')[0]}</div>
                                                <div className="muted small" style={{ textTransform: 'capitalize', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.playerType || '—'}</div>
                                                <div style={{ marginBottom: 10 }}><Score value={p.totalReports ? p.overallScore : null} size={pos === 1 ? 36 : 28} /></div>
                                                <div className={`rank rank-${pos}`} aria-label={`Position ${pos}`}
                                                    style={{ width: '100%', height: h, borderRadius: '10px 10px 0 0', fontSize: pos === 1 ? 48 : 36, alignItems: 'start', paddingTop: 10 }}>
                                                    {pos}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Full table */}
                            <section className="card rise rise-2" style={{ overflow: 'hidden' }}>
                                <div className="table-scroll">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: 64 }}>Pos</th>
                                                <th>Player</th>
                                                <th className="hide-mobile">Level</th>
                                                <th style={{ textAlign: 'right' }}>Analyses</th>
                                                <th style={{ textAlign: 'right' }}>Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {players.map((player: any, i: number) => (
                                                <tr key={player.id}>
                                                    <td><span className={`rank ${rankClass(i)}`}>{i + 1}</span></td>
                                                    <td>
                                                        <div className="row" style={{ gap: 12, minWidth: 0 }}>
                                                            <span className="avatar hide-mobile" style={{ width: 34, height: 34, fontSize: 15 }} aria-hidden="true">{initial(player.name)}</span>
                                                            <div style={{ minWidth: 0 }}>
                                                                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{player.name}</div>
                                                                <div className="muted small" style={{ textTransform: 'capitalize' }}>
                                                                    {player.playerType || '—'}<span className="show-mobile"> · {player.experienceLevel}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="hide-mobile" style={{ textTransform: 'capitalize' }}>{player.experienceLevel || '—'}</td>
                                                    <td className="tnum" style={{ textAlign: 'right' }}>{player.totalReports ?? 0}</td>
                                                    <td style={{ textAlign: 'right' }}><Score value={player.totalReports ? player.overallScore : null} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
