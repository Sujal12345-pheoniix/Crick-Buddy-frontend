'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { academyAPI } from '@/lib/api';
import { ScoreBadge, LoadingSpinner, EmptyState } from '@/components/ui';
import { Trophy } from 'lucide-react';

export default function LeaderboardPage() {
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        academyAPI.getLeaderboard()
            .then(r => setPlayers(r.data.leaderboard || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const rankClass = (i: number) => i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
    const medal = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ padding: '32px 40px' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Leaderboard 🏆</h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)' }}>Top players ranked by overall AI performance score</p>
                </div>

                {loading ? <LoadingSpinner /> : players.length === 0 ? (
                    <EmptyState icon="🏆" title="No rankings yet" description="Complete video analyses to appear on the leaderboard" />
                ) : (
                    <div style={{ maxWidth: 720 }}>
                        {/* Top 3 podium */}
                        {players.length >= 3 && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 16, marginBottom: 32, alignItems: 'flex-end' }}>
                                {[players[1], players[0], players[2]].map((p, vi) => {
                                    const rank = vi === 0 ? 2 : vi === 1 ? 1 : 3;
                                    const height = vi === 1 ? 160 : 110;
                                    const color = rank === 1 ? '#f59e0b' : rank === 2 ? '#9ca3af' : '#cd7f32';
                                    return (
                                        <div key={p.id} style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 28, marginBottom: 8 }}>{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</div>
                                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, ${color}, ${color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 22, color: '#0a0e1a', margin: '0 auto 8px' }}>
                                                {p.name?.charAt(0)}
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{p.name?.split(' ')[0]}</div>
                                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize', marginBottom: 8 }}>{p.playerType}</div>
                                            <div style={{ height, background: `${color}20`, border: `2px solid ${color}40`, borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div style={{ fontSize: 24, fontWeight: 900, color }}>{p.overallScore}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Full list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {players.map((player: any, i: number) => (
                                <div key={player.id} className="card" style={{
                                    padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
                                    background: i < 3 ? 'linear-gradient(145deg, #141e36, #111829)' : undefined,
                                    border: i === 0 ? '1px solid rgba(245,158,11,0.3)' : i === 1 ? '1px solid rgba(156,163,175,0.3)' : i === 2 ? '1px solid rgba(205,127,50,0.3)' : undefined
                                }}>
                                    <div className={`leaderboard-rank ${rankClass(i)}`}>{medal(i)}</div>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #00ff88, #00c864)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0a0e1a', fontSize: 16 }}>
                                        {player.name?.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 15 }}>{player.name}</div>
                                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>
                                            {player.playerType} · {player.experienceLevel}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{player.totalReports} reports</div>
                                        <ScoreBadge score={player.overallScore || 0} size="sm" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
