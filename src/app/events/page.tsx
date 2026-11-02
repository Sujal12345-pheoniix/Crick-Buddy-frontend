'use client';

import { useCallback, useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { API_BASE, matchesAPI, tournamentsAPI } from '@/lib/api';
import { LoadingSpinner, EmptyState, PageHeader } from '@/components/ui';
import { RefreshCw, MapPin, CalendarDays, Radio, Trophy, LocateFixed, Navigation, Search } from 'lucide-react';

const SCOPES: MatchScope[] = ['all', 'national', 'international'];
const STATUSES: MatchStatus[] = ['all', 'live', 'upcoming', 'completed'];
const SCOPE_LABEL: Record<MatchScope, string> = { all: 'All cricket', national: 'National', international: 'International' };
const STATUS_LABEL: Record<MatchStatus, string> = { all: 'Any status', live: 'Live', upcoming: 'Upcoming', completed: 'Results' };

const fmtDateTime = (v: string) => {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? 'Date TBC'
        : d.toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};
const fmtDate = (v: string) => {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? 'TBC' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

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
            return { label: 'Live feed', cls: 'badge-good' };
        }
        if (matches.some((m) => m.source === 'local-fallback')) {
            return { label: 'Fallback data', cls: 'badge-fair' };
        }
        return { label: 'Stored data', cls: 'badge-info' };
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

    const statusBadge = (s: string) => {
        if (s === 'live') return 'badge-live';
        if (s === 'ongoing') return 'badge-white badge-dot';
        if (s === 'upcoming') return 'badge-info';
        return '';
    };

    const handleLocationChange = (value: string) => {
        setLocation(value);
        window.localStorage.setItem('events_city', value);
    };

    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <div className="page">
                    <PageHeader
                        eyebrow="Fixtures & results"
                        title="Live scores & tournaments"
                        description="Follow national and international cricket ball by ball, and find tournaments to enter near you."
                        actions={
                            <>
                                {liveSource && (
                                    <div className="row wrap" style={{ gap: 10 }}>
                                        <span className={`badge badge-dot ${liveSource.cls}`}>
                                            {liveSource.label} · {streamLive ? 'Streaming' : 'Polling'}
                                        </span>
                                        {lastUpdatedAt && (
                                            <span className="muted small tnum">Updated {new Date(lastUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                        )}
                                    </div>
                                )}
                                <button type="button" className="btn btn-secondary" onClick={() => fetchData(true)} disabled={refreshing}>
                                    <RefreshCw size={15} className={refreshing ? 'animate-spin' : undefined} />
                                    {refreshing ? 'Refreshing' : 'Refresh'}
                                </button>
                            </>
                        }
                    />

                    {/* Controls */}
                    <section className="card card-pad rise rise-1" style={{ marginBottom: 20 }}>
                        <div className="segmented" role="tablist" aria-label="Event type" style={{ marginBottom: 18 }}>
                            <button type="button" role="tab" aria-selected={tab === 'matches'} className={tab === 'matches' ? 'on' : ''} onClick={() => setTab('matches')}>
                                <Radio size={15} /> Live scores
                            </button>
                            <button type="button" role="tab" aria-selected={tab === 'tournaments'} className={tab === 'tournaments' ? 'on' : ''} onClick={() => setTab('tournaments')}>
                                <Trophy size={15} /> Tournaments
                            </button>
                        </div>

                        <div className="row wrap" style={{ alignItems: 'flex-end', gap: 12 }}>
                            <div className="field" style={{ flex: '1 1 240px' }}>
                                <label className="input-label" htmlFor="events-location">{tab === 'matches' ? 'Search by city or venue' : 'Your city'}</label>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                                    <input
                                        id="events-location"
                                        value={location}
                                        onChange={(e) => handleLocationChange(e.target.value)}
                                        placeholder="e.g. Mumbai"
                                        className="input"
                                        style={{ paddingLeft: 40 }}
                                    />
                                </div>
                            </div>

                            {tab === 'tournaments' && (
                                <>
                                    <div className="field" style={{ width: 130 }}>
                                        <label className="input-label" htmlFor="events-radius">Radius (km)</label>
                                        <input
                                            id="events-radius"
                                            type="number"
                                            className="input tnum"
                                            value={radiusKm}
                                            min={5}
                                            max={500}
                                            onChange={(e) => setRadiusKm(Math.max(5, Math.min(500, Number(e.target.value) || 100)))}
                                        />
                                    </div>
                                    <button type="button" className="btn btn-navy" onClick={useMyLocation} disabled={geoLoading} style={{ height: 46 }}>
                                        {geoLoading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <LocateFixed size={16} />}
                                        {geoLoading ? 'Locating…' : 'Use my location'}
                                    </button>
                                </>
                            )}
                        </div>

                        {tab === 'tournaments' && (
                            <div className="row wrap" style={{ marginTop: 14, gap: 10 }}>
                                {latitude !== null && longitude !== null && (
                                    <span className="badge badge-good badge-dot">Location on</span>
                                )}
                                <span className="muted small">
                                    Add your city or share your location to sort by distance and limit results to your radius.
                                </span>
                            </div>
                        )}

                        {geoError && (
                            <div className="notice notice-error small" role="alert" style={{ marginTop: 14, padding: '12px 14px' }}>{geoError}</div>
                        )}

                        {tab === 'matches' && (
                            <div className="row wrap" style={{ marginTop: 16, gap: 18, alignItems: 'flex-start' }}>
                                <div>
                                    <div className="label" style={{ marginBottom: 8 }}>Competition</div>
                                    <div className="row wrap" style={{ gap: 6 }} role="group" aria-label="Competition">
                                        {SCOPES.map((s) => (
                                            <button key={s} type="button" aria-pressed={scope === s}
                                                className={`chip ${scope === s ? 'on' : ''}`} onClick={() => setScope(s)}>
                                                {SCOPE_LABEL[s]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="label" style={{ marginBottom: 8 }}>Status</div>
                                    <div className="row wrap" style={{ gap: 6 }} role="group" aria-label="Status">
                                        {STATUSES.map((s) => (
                                            <button key={s} type="button" aria-pressed={status === s}
                                                className={`chip ${status === s ? 'on' : ''}`} onClick={() => setStatus(s)}>
                                                {STATUS_LABEL[s]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {loading ? (
                        <LoadingSpinner label={tab === 'matches' ? 'Fetching scores' : 'Finding tournaments'} />
                    ) : tab === 'matches' ? (
                        matches.length === 0 ? (
                            <div className="card">
                                <EmptyState icon={<Radio size={24} />} title="No matches found" description="Clear the filters or try another city." />
                            </div>
                        ) : (
                            <div className="grid-auto rise rise-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))' }}>
                                {matches.map((m) => {
                                    const lines = toScoreLines(m);
                                    return (
                                        <article key={m.id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                            <div className="card-pad" style={{ paddingBottom: 16 }}>
                                                <div className="row-between" style={{ marginBottom: 12 }}>
                                                    <span className={`badge ${statusBadge(m.status)}`}>{m.status}</span>
                                                    {m.scope && <span className="label">{m.scope}</span>}
                                                </div>
                                                <h3 style={{ lineHeight: 1.15 }}>{m.title}</h3>
                                                <div className="stack muted small" style={{ gap: 6, marginTop: 12 }}>
                                                    <span className="row" style={{ gap: 8 }}><CalendarDays size={14} /> {fmtDateTime(m.date)}</span>
                                                    <span className="row" style={{ gap: 8 }}><MapPin size={14} /> {m.location || 'Venue TBC'}</span>
                                                </div>
                                            </div>

                                            <div className="panel-black" style={{ marginTop: 'auto', borderRadius: 0, border: 0, borderTop: '1px solid var(--line)', padding: '14px 20px 16px' }}>
                                                <div className="row-between" style={{ marginBottom: 8 }}>
                                                    <span className="label">Scorecard</span>
                                                    <span className="muted small">{formatAgeLabel(m.updatedAt || lastUpdatedAt || undefined)}</span>
                                                </div>
                                                {lines.length ? (
                                                    <div className="stack" style={{ gap: 4 }}>
                                                        {lines.map((line, idx) => (
                                                            <div key={`${m.id}-line-${idx}`} className="display tnum" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '0.02em', color: idx === 0 ? 'var(--text)' : 'var(--text-2)' }}>
                                                                {line}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="muted small">Scores appear here once play starts.</div>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )
                    ) : tournaments.length === 0 ? (
                        <div className="card">
                            <EmptyState icon={<Trophy size={24} />} title="No tournaments found" description="Try another city, widen the radius or check back later." />
                        </div>
                    ) : (
                        <div className="grid-auto rise rise-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))' }}>
                            {tournaments.map((t) => (
                                <article key={t.id} className="card card-pad card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div className="row-between">
                                        <span className={`badge ${statusBadge(t.status)}`}>{t.status}</span>
                                        {typeof t.distanceKm === 'number' && (
                                            <span className="badge tnum"><Navigation size={11} /> {t.distanceKm.toFixed(1)} km</span>
                                        )}
                                    </div>
                                    <h3 style={{ lineHeight: 1.15 }}>{t.name}</h3>
                                    <div className="stack muted small" style={{ gap: 6 }}>
                                        <span className="row tnum" style={{ gap: 8 }}><CalendarDays size={14} /> {fmtDate(t.startDate)} – {fmtDate(t.endDate)}</span>
                                        <span className="row" style={{ gap: 8 }}><MapPin size={14} /> {t.location}</span>
                                    </div>
                                    {t.description && (
                                        <p className="muted small" style={{ lineHeight: 1.6, paddingTop: 12, borderTop: '1px solid var(--line)' }}>{t.description}</p>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
