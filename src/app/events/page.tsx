'use client';

import { useCallback, useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { API_BASE, matchesAPI, tournamentsAPI } from '@/lib/api';
import { LoadingSpinner, EmptyState } from '@/components/ui';
import { RefreshCw, MapPin, CalendarDays, Radio } from 'lucide-react';

type MatchScope = 'all' | 'national' | 'international';
type MatchStatus = 'all' | 'live' | 'upcoming' | 'completed';

type EventTab = 'matches' | 'tournaments';

type MatchItem = {
    id: string;
    title: string;
    date: string;
    updatedAt?: string;
    location?: string | null;
    status: 'live' | 'upcoming' | 'completed' | string;
    scope?: MatchScope;
    scoreData?: unknown[] | null;
    scoreSummary?: string[];
    source?: string | null;
};

type TournamentItem = {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    location: string;
    description?: string | null;
    status: 'upcoming' | 'ongoing' | 'completed' | string;
    distanceKm?: number | null;
};

function toScoreLines(match: MatchItem): string[] {
    if (Array.isArray(match.scoreSummary) && match.scoreSummary.length) {
        return match.scoreSummary;
    }

    if (!Array.isArray(match.scoreData)) {
        return [];
    }

    return match.scoreData
        .map((entry) => {
            if (typeof entry === 'string') return entry;
            if (entry && typeof entry === 'object') {
                const e = entry as Record<string, unknown>;
                return (
                    (typeof e.inning === 'string' && e.inning) ||
                    (typeof e.score === 'string' && e.score) ||
                    (typeof e.summary === 'string' && e.summary) ||
                    (typeof e.status === 'string' && e.status) ||
                    null
                );
            }
            return null;
        })
        .filter((line): line is string => Boolean(line))
        .slice(0, 4);
}

function sortMatches(rows: MatchItem[]): MatchItem[] {
    const rank = (status: string) => {
        if (status === 'live') return 0;
        if (status === 'upcoming') return 1;
        if (status === 'completed') return 2;
        return 3;
    };

    return [...rows].sort((a, b) => {
        const statusRank = rank(a.status) - rank(b.status);
        if (statusRank !== 0) return statusRank;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
}

function formatAgeLabel(iso?: string): string {
    if (!iso) return 'updated recently';
    const diffMs = Date.now() - new Date(iso).getTime();
    if (!Number.isFinite(diffMs) || diffMs < 0) return 'updated recently';
    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}

export default function EventsPage() {
    const [tab, setTab] = useState<EventTab>('matches');
    const [scope, setScope] = useState<MatchScope>('all');
    const [status, setStatus] = useState<MatchStatus>('all');
    const [location, setLocation] = useState('');
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [radiusKm, setRadiusKm] = useState(100);
    const [geoLoading, setGeoLoading] = useState(false);
    const [geoError, setGeoError] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [matches, setMatches] = useState<MatchItem[]>([]);
    const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
    const [streamLive, setStreamLive] = useState(false);

    const liveSource = (() => {
        if (tab !== 'matches') return null;
        if (matches.some((m) => m.source === 'cricapi')) {
            return { label: 'Live API connected', color: '#00ff88', bg: 'rgba(0,255,136,0.12)' };
        }
        if (matches.some((m) => m.source === 'local-fallback')) {
            return { label: 'Fallback data mode', color: '#f59e0b', bg: 'rgba(245,158,11,0.14)' };
        }
        return { label: 'Database mode', color: '#3b82f6', bg: 'rgba(59,130,246,0.14)' };
    })();

    const fetchMatches = useCallback(async () => {
        const res = await matchesAPI.list({ scope, status, q: location || undefined });
        setMatches(sortMatches(res.data.matches || []));
        setLastUpdatedAt(res.data.updatedAt || new Date().toISOString());
    }, [scope, status, location]);

    const fetchTournaments = useCallback(async () => {
        const res = await tournamentsAPI.discover({
            location: location || undefined,
            latitude: latitude ?? undefined,
            longitude: longitude ?? undefined,
            radiusKm,
        });
        setTournaments(res.data.tournaments || []);
    }, [location, latitude, longitude, radiusKm]);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            if (tab === 'matches') {
                await fetchMatches();
            } else {
                await fetchTournaments();
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [tab, fetchMatches, fetchTournaments]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const saved = window.localStorage.getItem('events_city');
        if (saved) {
            setLocation(saved);
        }
    }, []);

    useEffect(() => {
        if (tab !== 'matches') return;
        const timer = setInterval(() => {
            if (!streamLive) {
                fetchData(true);
            }
        }, 20000);
        return () => clearInterval(timer);
    }, [tab, fetchData, streamLive]);

    useEffect(() => {
        if (tab !== 'matches') return;
        if (typeof window === 'undefined') return;

        const token = window.localStorage.getItem('crick_token');
        if (!token) return;

        const params = new URLSearchParams({
            token,
            scope,
            status,
            ...(location ? { q: location } : {})
        });
        const streamUrl = `${API_BASE}/matches/stream?${params.toString()}`;
        const source = new EventSource(streamUrl);

        source.addEventListener('matches', (event) => {
            try {
                const payload = JSON.parse((event as MessageEvent).data || '{}');
                if (payload.success) {
                    setMatches(sortMatches(payload.matches || []));
                    setLastUpdatedAt(payload.updatedAt || new Date().toISOString());
                    setStreamLive(true);
                    setLoading(false);
                    setRefreshing(false);
                }
            } catch {
                setStreamLive(false);
            }
        });

        source.addEventListener('error', () => {
            setStreamLive(false);
        });

        return () => {
            setStreamLive(false);
            source.close();
        };
    }, [tab, scope, status, location]);

    useEffect(() => {
        if (tab !== 'tournaments') return;
        fetchData(true);
    }, [tab, fetchData]);

    const useMyLocation = () => {
        setGeoError('');
        if (!navigator.geolocation) {
            setGeoError('Geolocation is not supported in this browser.');
            return;
        }
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
                setGeoLoading(false);
            },
            (error) => {
                setGeoLoading(false);
                setGeoError(error.message || 'Could not get your location.');
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    };

    const statusColor = (s: string) => {
        if (s === 'live') return '#ff4757';
        if (s === 'ongoing') return '#3b82f6';
        if (s === 'upcoming') return '#00ff88';
        return 'rgba(255,255,255,0.6)';
    };

    const handleLocationChange = (value: string) => {
        setLocation(value);
        window.localStorage.setItem('events_city', value);
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ padding: '32px 40px' }}>
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Live Scores & Tournaments</h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
                        Discover nearby events and track national/international cricket scoreboards.
                    </p>
                    {liveSource && (
                        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '6px 10px',
                                    borderRadius: 999,
                                    background: liveSource.bg,
                                    border: `1px solid ${liveSource.color}55`,
                                    color: liveSource.color,
                                    fontSize: 12,
                                    fontWeight: 700
                                }}
                            >
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: liveSource.color }} />
                                {streamLive ? `${liveSource.label} • Stream On` : `${liveSource.label} • Polling`}
                            </div>
                            {lastUpdatedAt && (
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                                    Last updated: {new Date(lastUpdatedAt).toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {(['matches', 'tournaments'] as EventTab[]).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    style={{
                                        borderRadius: 8,
                                        border: `1px solid ${tab === t ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
                                        background: tab === t ? 'rgba(0,255,136,0.1)' : 'transparent',
                                        color: tab === t ? '#00ff88' : 'rgba(255,255,255,0.65)',
                                        padding: '8px 14px',
                                        cursor: 'pointer',
                                        fontSize: 13,
                                        fontWeight: 700,
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                                value={location}
                                onChange={(e) => handleLocationChange(e.target.value)}
                                placeholder="Enter your city (e.g. Mumbai)"
                                className="input"
                                style={{ minWidth: 240, margin: 0 }}
                            />

                            {tab === 'tournaments' && (
                                <button className="btn-ghost" onClick={useMyLocation} style={{ padding: '10px 14px' }}>
                                    {geoLoading ? 'Locating...' : 'Use My Location'}
                                </button>
                            )}

                            <button className="btn-secondary" onClick={() => fetchData(true)} style={{ padding: '10px 14px' }}>
                                <RefreshCw size={14} style={{ animation: refreshing ? 'spin-slow 0.9s linear infinite' : 'none' }} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {tab === 'tournaments' && (
                        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Radius (km)</label>
                            <input
                                type="number"
                                className="input"
                                value={radiusKm}
                                min={5}
                                max={500}
                                onChange={(e) => setRadiusKm(Math.max(5, Math.min(500, Number(e.target.value) || 100)))}
                                style={{ width: 110, margin: 0, padding: '8px 12px' }}
                            />
                            {latitude !== null && longitude !== null && (
                                <span style={{ fontSize: 12, color: 'rgba(0,255,136,0.8)' }}>
                                    Geo-enabled discovery is active
                                </span>
                            )}
                        </div>
                    )}

                    {geoError && (
                        <div style={{ marginTop: 10, fontSize: 12, color: '#ff6b6b' }}>{geoError}</div>
                    )}

                    {tab === 'matches' && (
                        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {(['all', 'national', 'international'] as MatchScope[]).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setScope(s)}
                                    style={{
                                        borderRadius: 999,
                                        border: `1px solid ${scope === s ? '#3b82f6' : 'rgba(255,255,255,0.12)'}`,
                                        background: scope === s ? 'rgba(59,130,246,0.12)' : 'transparent',
                                        color: scope === s ? '#3b82f6' : 'rgba(255,255,255,0.55)',
                                        padding: '6px 12px',
                                        fontSize: 12,
                                        cursor: 'pointer',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                            {(['all', 'live', 'upcoming', 'completed'] as MatchStatus[]).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s)}
                                    style={{
                                        borderRadius: 999,
                                        border: `1px solid ${status === s ? '#f59e0b' : 'rgba(255,255,255,0.12)'}`,
                                        background: status === s ? 'rgba(245,158,11,0.12)' : 'transparent',
                                        color: status === s ? '#f59e0b' : 'rgba(255,255,255,0.55)',
                                        padding: '6px 12px',
                                        fontSize: 12,
                                        cursor: 'pointer',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {tab === 'tournaments' && (
                        <div
                            style={{
                                marginTop: 12,
                                borderRadius: 10,
                                padding: 12,
                                border: '1px solid rgba(0,255,136,0.2)',
                                background: 'rgba(0,255,136,0.04)',
                                fontSize: 13,
                                color: 'rgba(255,255,255,0.65)'
                            }}
                        >
                            Browse all upcoming tournaments below. Add your city or use <strong style={{ color: 'rgba(0,255,136,0.95)' }}>Use My Location</strong> to sort by distance and filter within the radius.
                        </div>
                    )}
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : tab === 'matches' ? (
                    matches.length === 0 ? (
                        <EmptyState icon="📡" title="No matches found" description="Try clearing filters or searching another location" />
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                            {matches.map((m) => (
                                <div key={m.id} className="card" style={{ padding: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <span style={{
                                            borderRadius: 999,
                                            border: `1px solid ${statusColor(m.status)}33`,
                                            background: `${statusColor(m.status)}1a`,
                                            color: statusColor(m.status),
                                            padding: '4px 10px',
                                            fontSize: 11,
                                            textTransform: 'uppercase',
                                            fontWeight: 700
                                        }}>
                                            {m.status}
                                        </span>
                                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{m.scope}</span>
                                    </div>

                                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{m.title}</div>

                                    <div style={{ display: 'grid', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <CalendarDays size={14} />
                                            {new Date(m.date).toLocaleString()}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <MapPin size={14} />
                                            {m.location || 'TBD'}
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 14, padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                                            <Radio size={13} color="#ff4757" />
                                            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Scoreboard</span>
                                            <span
                                                style={{
                                                    marginLeft: 'auto',
                                                    fontSize: 11,
                                                    color: 'rgba(255,255,255,0.5)',
                                                    textTransform: 'none'
                                                }}
                                            >
                                                {formatAgeLabel(m.updatedAt || lastUpdatedAt || undefined)}
                                            </span>
                                        </div>
                                        {toScoreLines(m).length ? (
                                            <div style={{ display: 'grid', gap: 4 }}>
                                                {toScoreLines(m).map((line, idx) => (
                                                    <div key={`${m.id}-line-${idx}`} style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)' }}>
                                                        {line}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                                                Live score data will appear here when available.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : tournaments.length === 0 ? (
                    <EmptyState icon="🏆" title="No tournaments found" description="Try a different city name or check upcoming events later" />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                        {tournaments.map((t) => (
                            <div key={t.id} className="card" style={{ padding: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <span style={{
                                        borderRadius: 999,
                                        border: `1px solid ${statusColor(t.status)}33`,
                                        background: `${statusColor(t.status)}1a`,
                                        color: statusColor(t.status),
                                        padding: '4px 10px',
                                        fontSize: 11,
                                        textTransform: 'uppercase',
                                        fontWeight: 700
                                    }}>
                                        {t.status}
                                    </span>
                                </div>

                                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{t.name}</div>
                                <div style={{ display: 'grid', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <CalendarDays size={14} />
                                        {new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <MapPin size={14} />
                                        {t.location}
                                    </div>
                                    {typeof t.distanceKm === 'number' && (
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <MapPin size={14} />
                                            {t.distanceKm.toFixed(1)} km away
                                        </div>
                                    )}
                                </div>
                                {t.description && (
                                    <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{t.description}</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
