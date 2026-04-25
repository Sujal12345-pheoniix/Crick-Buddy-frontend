'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { academyAPI } from '@/lib/api';
import { LoadingSpinner, ScoreBadge, EmptyState } from '@/components/ui';
import { Users, Trophy, ChevronRight, Eye } from 'lucide-react';
import Link from 'next/link';

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

    const rankClass = (i: number) => i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ padding: '32px 40px' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Academy Mode 🎓</h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {user?.role === 'coach' ? 'Monitor your players and track team progress' : 'View all players and leaderboard'}
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
                    {[{ key: 'players', icon: <Users size={15} />, label: 'All Players' }, { key: 'leaderboard', icon: <Trophy size={15} />, label: 'Leaderboard' }].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key as any)} style={{
                            padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
                            border: `1.5px solid ${tab === t.key ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
                            background: tab === t.key ? 'rgba(0,255,136,0.1)' : 'transparent',
                            color: tab === t.key ? '#00ff88' : 'rgba(255,255,255,0.5)',
                            display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                        }}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {loading ? <LoadingSpinner /> : tab === 'players' ? (
                    <div className="card" style={{ overflow: 'hidden' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Player</th>
                                    <th>Type</th>
                                    <th>Level</th>
                                    <th>Reports</th>
                                    <th>Latest Score</th>
                                    <th>Last Active</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {players.length === 0 ? (
                                    <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>
                                        No players registered yet
                                    </td></tr>
                                ) : players.map((p: any) => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #00ff88, #00c864)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#0a0e1a', flexShrink: 0 }}>
                                                    {p.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{p.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{p.playerType}</td>
                                        <td><span style={{ fontSize: 12, color: p.experienceLevel === 'professional' ? '#f59e0b' : p.experienceLevel === 'intermediate' ? '#3b82f6' : '#00ff88', textTransform: 'capitalize' }}>
                                            {p.experienceLevel}
                                        </span></td>
                                        <td style={{ fontSize: 13 }}>{p.totalReports}</td>
                                        <td><ScoreBadge score={p.latestReport?.overallScore || 0} size="sm" /></td>
                                        <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                                            {p.lastLogin ? new Date(p.lastLogin).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td>
                                            <Link href={`/academy/player/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#00ff88', textDecoration: 'none', fontSize: 13 }}>
                                                <Eye size={14} /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* Leaderboard */
                    <div style={{ maxWidth: 700 }}>
                        {leaderboard.map((player: any, i: number) => (
                            <div key={player.id} className="card" style={{ padding: '16px 20px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' }}>
                                <div className={`leaderboard-rank ${rankClass(i)}`}>{i + 1}</div>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #00ff88, #00c864)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0a0e1a' }}>
                                    {player.name?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 15 }}>{player.name}</div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>
                                        {player.playerType} · {player.experienceLevel}
                                    </div>
                                </div>
                                <ScoreBadge score={player.overallScore || 0} size="sm" />
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#00ff88' }}>{player.totalReports}</div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>reports</div>
                                </div>
                            </div>
                        ))}
                        {leaderboard.length === 0 && (
                            <EmptyState icon="🏆" title="No rankings yet" description="Players will appear here once they complete analyses" />
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
