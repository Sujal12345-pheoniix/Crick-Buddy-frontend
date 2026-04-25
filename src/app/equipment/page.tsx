'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { equipmentAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui';
import { Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function EquipmentPage() {
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'bats' | 'gloves' | 'training'>('bats');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await equipmentAPI.get(user?.experienceLevel);
                setData(res.data.recommendations);
            } catch { setData(null); }
            finally { setLoading(false); }
        };
        if (user) fetch();
    }, [user]);

    const tabs = [
        { key: 'bats', label: '🏏 Bats', items: data?.bats },
        { key: 'gloves', label: '🧤 Gloves', items: data?.gloves },
        { key: 'training', label: '💪 Training', items: data?.training },
    ] as const;

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ padding: '32px 40px' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Equipment Recommendations 🏏</h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
                        AI-recommended gear for <span style={{ color: '#00ff88', fontWeight: 600 }}>{user?.experienceLevel}</span> level {user?.playerType}s
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key as any)} style={{
                            padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
                            border: `1.5px solid ${tab === t.key ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
                            background: tab === t.key ? 'rgba(0,255,136,0.1)' : 'transparent',
                            color: tab === t.key ? '#00ff88' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s'
                        }}>{t.label}</button>
                    ))}
                </div>

                {loading ? <LoadingSpinner /> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                        {(tabs.find(t => t.key === tab)?.items || []).map((item: any) => (
                            <div key={item.id} className="card" style={{ padding: 24 }}>
                                {/* Image placeholder */}
                                <div style={{ width: '100%', height: 180, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 48 }}>
                                    {tab === 'bats' ? '🏏' : tab === 'gloves' ? '🧤' : '💪'}
                                </div>

                                {/* Brand badge */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <span style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(0,255,136,0.2)' }}>
                                        {item.brand}
                                    </span>
                                    {item.type && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{item.type}</span>}
                                </div>

                                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{item.name}</h3>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12, lineHeight: 1.6 }}>{item.description}</p>

                                {/* Rating */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} size={14} fill={i < Math.floor(item.rating) ? '#f59e0b' : 'transparent'} color="#f59e0b" />
                                    ))}
                                    <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>{item.rating}</span>
                                </div>

                                {item.weight && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>⚖️ Weight: {item.weight}</div>}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 20, fontWeight: 900, color: '#00ff88' }}>{item.price}</span>
                                    <a href={item.amazonLink || '#'} target="_blank" rel="noopener noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13, cursor: 'pointer' }}>
                                        Buy Now <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Disclaimer */}
                <div style={{ marginTop: 32, padding: '14px 20px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                    💡 Recommendations are based on your experience level ({user?.experienceLevel}) and player type ({user?.playerType}). Prices are approximate. Affiliate links help support Crick-Buddy.
                </div>
            </main>
        </div>
    );
}
