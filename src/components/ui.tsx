'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/** Score bands used everywhere a 0–100 score is coloured. */
export function scoreBand(score?: number | null): 'good' | 'fair' | 'poor' | '' {
    if (score === null || score === undefined || Number.isNaN(score)) return '';
    return score >= 75 ? 'good' : score >= 55 ? 'fair' : 'poor';
}

export function scoreWord(score?: number | null): string {
    const band = scoreBand(score);
    return band === 'good' ? 'Strong' : band === 'fair' ? 'Developing' : band === 'poor' ? 'Needs work' : 'Not measured';
}

interface MetricCardProps {
    label: string;
    value: string | number | null | undefined;
    unit?: string;
    score?: number | null;
    trend?: 'up' | 'down' | 'neutral';
    trendVal?: string;
    /** Kept for compatibility; colour now comes from the score band. */
    color?: string;
    icon?: React.ReactNode;
    note?: string;
}

/** Scoreboard-style metric tile. */
export function MetricCard({ label, value, unit, score, trend, trendVal, icon, note }: MetricCardProps) {
    const shown = value === null || value === undefined || value === '' ? '—' : value;
    const band = scoreBand(score);
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    return (
        <div className="stat">
            <div className="label">
                <span>{label}</span>
                {icon && <span style={{ color: 'var(--text-3)', display: 'inline-flex' }}>{icon}</span>}
            </div>
            <div className="stat-value">
                {shown}
                {unit && shown !== '—' && <span className="stat-unit">{unit}</span>}
            </div>
            {typeof score === 'number' && (
                <div className="stat-meter"><i className={band} style={{ width: `${Math.max(2, Math.min(100, score))}%` }} /></div>
            )}
            {(note || typeof score === 'number') && (
                <div className="stat-foot">{note ?? scoreWord(score)}</div>
            )}
            {trend && trendVal && (
                <div className="stat-foot row" style={{ gap: 6, color: trend === 'up' ? 'var(--good)' : trend === 'down' ? 'var(--poor)' : 'var(--text-3)' }}>
                    <TrendIcon size={13} /> {trendVal}
                </div>
            )}
        </div>
    );
}

interface ScoreBadgeProps { score: number; size?: 'sm' | 'md' | 'lg' | 'xl'; caption?: string; }

/** Circular score dial. */
export function ScoreBadge({ score, size = 'md', caption = 'Score' }: ScoreBadgeProps) {
    const px = { sm: 56, md: 76, lg: 112, xl: 148 }[size];
    const stroke = size === 'sm' ? 5 : size === 'xl' ? 9 : 7;
    const r = (px - stroke) / 2;
    const c = 2 * Math.PI * r;
    const value = Math.max(0, Math.min(100, Math.round(score || 0)));
    const band = scoreBand(value);
    const color = band === 'good' ? 'var(--good)' : band === 'fair' ? 'var(--fair)' : 'var(--poor)';
    return (
        <div className="dial" style={{ width: px, height: px }} aria-label={`${caption} ${value} out of 100`}>
            <svg width={px} height={px}>
                <circle className="dial-track" cx={px / 2} cy={px / 2} r={r} fill="none" strokeWidth={stroke} />
                <circle cx={px / 2} cy={px / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: 'stroke-dashoffset 1s var(--ease)' }} />
            </svg>
            <div className="dial-value">
                <div>
                    <div className="dial-num" style={{ fontSize: px * 0.36 }}>{value}</div>
                    {size !== 'sm' && <div className="dial-cap">{caption}</div>}
                </div>
            </div>
        </div>
    );
}

const STATUS: Record<string, { cls: string; text: string }> = {
    completed: { cls: 'badge-good', text: 'Completed' },
    processing: { cls: 'badge-info', text: 'Analysing' },
    pending: { cls: 'badge-fair', text: 'Queued' },
    failed: { cls: 'badge-poor', text: 'Failed' },
};

export function StatusBadge({ status }: { status: string }) {
    const s = STATUS[status] || { cls: '', text: status };
    return <span className={`badge badge-dot ${s.cls}`}>{s.text}</span>;
}

export function LoadingSpinner({ label }: { size?: number; label?: string }) {
    return (
        <div className="empty" role="status">
            <div className="spinner" />
            {label && <div className="muted small">{label}</div>}
        </div>
    );
}

export function EmptyState({ icon, title, description, action }: {
    icon: React.ReactNode; title: string; description: string; action?: React.ReactNode;
}) {
    return (
        <div className="empty">
            <div className="empty-icon">{icon}</div>
            <h3 style={{ fontSize: 18 }}>{title}</h3>
            <p className="muted small" style={{ maxWidth: 340 }}>{description}</p>
            {action && <div style={{ marginTop: 8 }}>{action}</div>}
        </div>
    );
}

/** Standard page heading: eyebrow, title, optional description and actions. */
export function PageHeader({ eyebrow, title, description, actions }: {
    eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode;
}) {
    return (
        <header className="page-header rise">
            <div>
                {eyebrow && <div className="eyebrow">{eyebrow}</div>}
                <h1>{title}</h1>
                {description && <p className="lede">{description}</p>}
            </div>
            {actions && <div className="row wrap">{actions}</div>}
        </header>
    );
}

/** Shell for signed-in pages: sidebar + main column. */
export function AppShell({ children, sidebar }: { children: React.ReactNode; sidebar: React.ReactNode }) {
    return (
        <div className="app">
            {sidebar}
            <main className="main-content"><div className="page">{children}</div></main>
        </div>
    );
}
