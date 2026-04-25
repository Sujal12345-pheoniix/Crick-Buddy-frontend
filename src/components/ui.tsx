'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
    label: string;
    value: string | number;
    unit?: string;
    score?: number;
    trend?: 'up' | 'down' | 'neutral';
    trendVal?: string;
    color?: string;
    icon?: React.ReactNode;
}

export function MetricCard({ label, value, unit, score, trend, trendVal, color = '#00ff88', icon }: MetricCardProps) {
    const trendIcon = trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />;
    const trendColor = trend === 'up' ? '#00ff88' : trend === 'down' ? '#ff4757' : '#9ca3af';

    return (
        <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                {icon && <div style={{ color }}>{icon}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: score !== undefined ? 12 : 0 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</span>
                {unit && <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>{unit}</span>}
            </div>
            {score !== undefined && (
                <div style={{ marginBottom: 8 }}>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Score</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color }}>{score}/100</span>
                    </div>
                </div>
            )}
            {trend && trendVal && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: trendColor, fontSize: 12 }}>
                    {trendIcon}
                    <span>{trendVal}</span>
                </div>
            )}
        </div>
    );
}

interface ScoreBadgeProps { score: number; size?: 'sm' | 'md' | 'lg'; }
export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
    const s = size === 'sm' ? 56 : size === 'lg' ? 100 : 72;
    const fs = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
    const color = score >= 80 ? '#00ff88' : score >= 60 ? '#f59e0b' : '#ff4757';

    return (
        <div style={{
            width: s, height: s, borderRadius: '50%',
            background: `conic-gradient(${color} ${score * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative'
        }}>
            <div style={{
                width: s - 8, height: s - 8, borderRadius: '50%',
                background: '#111829', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexDirection: 'column'
            }}>
                <span style={{ fontSize: fs, fontWeight: 900, color }}>{score}</span>
                {size !== 'sm' && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>SCORE</span>}
            </div>
        </div>
    );
}

export function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { cls: string; label: string }> = {
        pending: { cls: 'badge-yellow', label: '⏳ Pending' },
        processing: { cls: 'badge-blue', label: '⚙️ Processing' },
        completed: { cls: 'badge-green', label: '✅ Completed' },
        failed: { cls: 'badge-red', label: '❌ Failed' },
    };
    const { cls, label } = map[status] || { cls: 'badge-blue', label: status };
    return <span className={`badge ${cls}`}>{label}</span>;
}

export function LoadingSpinner({ size = 24 }: { size?: number }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div style={{
                width: size, height: size,
                border: `2px solid rgba(0,255,136,0.2)`,
                borderTop: `2px solid #00ff88`,
                borderRadius: '50%',
                animation: 'spin-slow 0.8s linear infinite'
            }} />
        </div>
    );
}

export function EmptyState({ icon, title, description, action }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>{description}</p>
            {action}
        </div>
    );
}
