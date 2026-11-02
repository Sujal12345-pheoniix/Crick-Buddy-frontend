'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { equipmentAPI } from '@/lib/api';
import { LoadingSpinner, EmptyState, PageHeader } from '@/components/ui';
import { Star, ExternalLink, Swords, Hand, Dumbbell, Scale, Info, PackageOpen } from 'lucide-react';

const TAB_ICONS = { bats: Swords, gloves: Hand, training: Dumbbell } as const;

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
        { key: 'bats', label: 'Bats', items: data?.bats },
        { key: 'gloves', label: 'Gloves', items: data?.gloves },
        { key: 'training', label: 'Training aids', items: data?.training },
    ] as const;

    const items: any[] = tabs.find(t => t.key === tab)?.items || [];
    const ItemIcon = TAB_ICONS[tab];

    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <div className="page">
                    <PageHeader
                        eyebrow="Kit room"
                        title="Equipment"
                        description={
                            <>Gear picked for <span style={{ color: 'var(--text)', fontWeight: 600, textTransform: 'capitalize' }}>{user?.experienceLevel || 'your'}</span>{' '}
                                level <span style={{ textTransform: 'lowercase' }}>{user?.playerType ? `${user.playerType}s` : 'players'}</span> — weight, balance and build matched to your game.</>
                        }
                    />

                    <div className="segmented rise rise-1" role="tablist" aria-label="Equipment category" style={{ marginBottom: 20 }}>
                        {tabs.map(t => {
                            const Icon = TAB_ICONS[t.key];
                            return (
                                <button key={t.key} type="button" role="tab" aria-selected={tab === t.key}
                                    className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key as any)}>
                                    <Icon size={15} /> {t.label}
                                </button>
                            );
                        })}
                    </div>

                    {loading ? <LoadingSpinner label="Fetching recommendations" /> : items.length === 0 ? (
                        <div className="card">
                            <EmptyState icon={<PackageOpen size={24} />} title="Nothing to show yet"
                                description="We couldn't load recommendations for this category. Try again shortly." />
                        </div>
                    ) : (
                        <div className="grid-auto rise rise-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(290px, 100%), 1fr))' }}>
                            {items.map((item: any) => {
                                const levels: string[] = Array.isArray(item.for) ? item.for : [];
                                const rating = Number(item.rating) || 0;
                                return (
                                    <article key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <div className="panel-black pitch-stripes" style={{ height: 150, borderRadius: 0, border: 0, borderBottom: '1px solid var(--line)', display: 'grid', placeItems: 'center', position: 'relative' }}>
                                            <ItemIcon size={44} strokeWidth={1.25} style={{ color: 'var(--navy-300)' }} aria-hidden="true" />
                                            <span className="badge badge-white" style={{ position: 'absolute', top: 14, left: 14 }}>{item.brand}</span>
                                            {item.type && <span className="label" style={{ position: 'absolute', top: 19, right: 16 }}>{item.type}</span>}
                                        </div>

                                        <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                                            <h3>{item.name}</h3>
                                            <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>{item.description}</p>

                                            <div className="row wrap" style={{ gap: 14 }}>
                                                <div className="row" style={{ gap: 3 }} aria-label={`Rated ${rating} out of 5`}>
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} size={14} aria-hidden="true"
                                                            fill={i < Math.floor(rating) ? 'var(--white)' : 'transparent'}
                                                            style={{ color: i < Math.floor(rating) ? 'var(--white)' : 'var(--text-4)' }} />
                                                    ))}
                                                    <span className="small tnum" style={{ marginLeft: 6, fontWeight: 600 }}>{item.rating}</span>
                                                </div>
                                                {item.weight && (
                                                    <span className="muted small row" style={{ gap: 6 }}><Scale size={14} /> {item.weight}</span>
                                                )}
                                            </div>

                                            {levels.length > 0 && (
                                                <div className="row wrap" style={{ gap: 6 }}>
                                                    {levels.map(l => (
                                                        <span key={l} className={`badge ${l === user?.experienceLevel ? 'badge-white' : ''}`} style={{ textTransform: 'capitalize' }}>{l}</span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="row-between" style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                                                <span className="display tnum" style={{ fontSize: 28 }}>{item.price}</span>
                                                <a href={item.amazonLink || '#'} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                                                    View deal <ExternalLink size={13} />
                                                </a>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    <div className="notice rise rise-3" style={{ marginTop: 28 }}>
                        <Info size={18} style={{ color: 'var(--navy-300)', flexShrink: 0, marginTop: 2 }} />
                        <p className="muted small">
                            Based on your experience level ({user?.experienceLevel}) and player type ({user?.playerType}). Prices are approximate. Affiliate links help support CrickBuddy.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
