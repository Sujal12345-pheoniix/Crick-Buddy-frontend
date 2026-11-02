'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard, Upload, LineChart, Dumbbell, ShoppingBag, MessageSquare,
    Trophy, Radio, Settings, LogOut, Menu, X, Users, Shield,
} from 'lucide-react';

const NAV = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/upload', icon: Upload, label: 'Analyse a clip' },
    { href: '/progress', icon: LineChart, label: 'Progress' },
    { href: '/training', icon: Dumbbell, label: 'Training drills' },
    { href: '/chatbot', icon: MessageSquare, label: 'AI coach' },
];
const COMMUNITY = [
    { href: '/events', icon: Radio, label: 'Live & tournaments' },
    { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { href: '/equipment', icon: ShoppingBag, label: 'Equipment' },
];

export function BrandMark({ size = 36 }: { size?: number }) {
    return (
        <span className="brand-mark" style={{ width: size, height: size }}>
            <img src="/icon.png" alt="" width={size} height={size} style={{ objectFit: 'cover' }} />
        </span>
    );
}

export function BrandName() {
    return <span className="brand-name">Crick<span>Buddy</span></span>;
}

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);

    useEffect(() => { setOpen(false); }, [pathname]);
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
    const item = ({ href, icon: Icon, label }: { href: string; icon: typeof LayoutDashboard; label: string }) => (
        <Link key={href} href={href} className={`sidebar-link ${isActive(href) ? 'active' : ''}`} aria-current={isActive(href) ? 'page' : undefined}>
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
        </Link>
    );

    const staff = user?.role === 'coach' || user?.role === 'admin';

    return (
        <>
            <div className="mobile-bar">
                <Link href="/dashboard" className="row" style={{ gap: 10 }}><BrandMark size={30} /><BrandName /></Link>
                <button className="btn btn-navy btn-icon" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
                    {open ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <div className={`sidebar-overlay ${open ? 'visible' : ''}`} onClick={() => setOpen(false)} />

            <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
                <Link href="/dashboard" className="sidebar-brand"><BrandMark /><BrandName /></Link>

                <nav style={{ flex: 1, overflowY: 'auto' }}>
                    <div className="sidebar-section">
                        <span className="label">Your game</span>
                        {NAV.map(item)}
                    </div>
                    <div className="sidebar-section">
                        <span className="label">Cricket</span>
                        {COMMUNITY.map(item)}
                    </div>
                    {staff && (
                        <div className="sidebar-section">
                            <span className="label">{user?.role === 'admin' ? 'Admin' : 'Coaching'}</span>
                            {item({ href: '/academy', icon: Users, label: 'Academy' })}
                            {user?.role === 'admin' && item({ href: '/admin', icon: Shield, label: 'Admin console' })}
                        </div>
                    )}
                </nav>

                {user && (
                    <div className="sidebar-profile">
                        <div className="row">
                            <span className="avatar">{user.name?.charAt(0).toUpperCase()}</span>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                                <div className="muted" style={{ fontSize: 12, textTransform: 'capitalize' }}>
                                    {user.experienceLevel || 'beginner'} · {user.playerType || 'player'}
                                </div>
                            </div>
                        </div>
                        <div className="row" style={{ marginTop: 12, gap: 6 }}>
                            <Link href="/settings" className="btn btn-ghost btn-sm" style={{ flex: 1 }}><Settings size={15} /> Settings</Link>
                            <button className="btn btn-ghost btn-sm" onClick={logout} style={{ flex: 1 }}><LogOut size={15} /> Sign out</button>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
