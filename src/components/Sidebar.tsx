'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard, Upload, BarChart3, Dumbbell, ShoppingBag,
    MessageCircle, Trophy, Settings, LogOut, Menu, X,
    Shield, ChevronRight, Star, Zap
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#22c55e' },
    { href: '/upload',    icon: Upload,          label: 'Upload & Analyze', color: '#6366f1' },
    { href: '/progress',  icon: BarChart3,        label: 'Progress',   color: '#f97316' },
    { href: '/events',    icon: Trophy,           label: 'Live & Tournaments', color: '#eab308' },
    { href: '/training',  icon: Dumbbell,         label: 'Training Drills', color: '#14b8a6' },
    { href: '/equipment', icon: ShoppingBag,      label: 'Equipment',  color: '#ec4899' },
    { href: '/chatbot',   icon: MessageCircle,    label: 'AI Coach',   color: '#22c55e' },
    { href: '/leaderboard', icon: Trophy,         label: 'Leaderboard', color: '#eab308' },
];

const coachItems = [
    { href: '/academy', icon: Star, label: 'Academy Mode', color: '#f97316' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close drawer on route change
    useEffect(() => { setMobileOpen(false); }, [pathname]);

    // Prevent body scroll when mobile drawer is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const NavLink = ({ href, icon: Icon, label, color }: { href: string; icon: any; label: string; color: string }) => {
        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
            <Link
                href={href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                style={isActive ? { color } : {}}
                onClick={() => setMobileOpen(false)}
            >
                <Icon size={17} style={{ color: isActive ? color : undefined }} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={13} style={{ opacity: 0.6 }} />}
            </Link>
        );
    };

    const levelColors: Record<string, string> = {
        beginner: '#22c55e',
        intermediate: '#6366f1',
        professional: '#eab308',
    };
    const levelColor = levelColors[user?.experienceLevel || 'beginner'] || '#22c55e';

    const SidebarContent = () => (
        <aside className="sidebar" style={{ width: 'var(--sidebar-width)' }}>
            {/* Logo */}
            <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)' }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: 'rgba(34,197,94,0.1)',
                        border: '1px solid rgba(34,197,94,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', flexShrink: 0,
                        boxShadow: '0 4px 16px rgba(34,197,94,0.12)'
                    }}>
                        <img src="/icon.png" alt="Crick Buddy" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                            Crick-Buddy
                        </div>
                    </div>
                </Link>
            </div>

            {/* User XP card */}
            {user && (
                <div style={{ padding: '12px 12px 10px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                background: `linear-gradient(135deg, ${levelColor}, ${levelColor}88)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, fontSize: 13, color: '#0a0e1a'
                            }}>
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user.name}
                                </div>
                                <div style={{ fontSize: 11, color: levelColor, fontWeight: 600, textTransform: 'capitalize' }}>
                                    {user.experienceLevel || 'Beginner'}
                                </div>
                            </div>
                            <Zap size={14} style={{ color: '#eab308', flexShrink: 0, marginLeft: 'auto' }} />
                        </div>
                        {/* XP bar */}
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                            <span>XP Progress</span>
                            <span style={{ color: levelColor }}>{user.totalUploads || 0} analyses</span>
                        </div>
                        <div className="xp-bar-container">
                            <div className="xp-bar-fill" style={{ '--xp-width': `${Math.min((user.totalUploads || 0) * 10, 100)}%` } as any} />
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
                <div className="section-label">Main Menu</div>
                {navItems.map(item => <NavLink key={item.href} {...item} />)}

                {(user?.role === 'coach' || user?.role === 'admin') && (
                    <>
                        <div className="section-label" style={{ marginTop: 8 }}>Coach Tools</div>
                        {coachItems.map(item => <NavLink key={item.href} {...item} />)}
                    </>
                )}

                {user?.role === 'admin' && (
                    <>
                        <div className="section-label" style={{ marginTop: 8, color: 'rgba(239,68,68,0.5)' }}>Admin</div>
                        <Link href="/admin"
                            className={`sidebar-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
                            style={pathname.startsWith('/admin') ? { color: '#f87171', background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' } : {}}
                            onClick={() => setMobileOpen(false)}>
                            <Shield size={17} style={{ color: '#f87171' }} />
                            <span style={{ flex: 1 }}>Admin Panel</span>
                        </Link>
                    </>
                )}
            </nav>

            {/* Bottom actions */}
            <div style={{ padding: '8px 8px 12px', borderTop: '1px solid var(--border)' }}>
                <Link href="/settings" className="sidebar-link" onClick={() => setMobileOpen(false)}>
                    <Settings size={17} />
                    <span>Settings</span>
                </Link>
                <button className="sidebar-link" onClick={logout}
                    style={{ color: '#f87171', border: 'none', background: 'none', cursor: 'pointer' }}>
                    <LogOut size={17} style={{ color: '#f87171' }} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <div className="hide-mobile">
                <SidebarContent />
            </div>

            {/* Mobile floating menu toggle */}
            <div className="show-mobile" style={{ position: 'fixed', top: 16, right: 16, zIndex: 120 }}>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    style={{
                        background: 'rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 12, padding: '10px',
                        cursor: 'pointer', color: 'var(--text-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="sidebar-overlay visible"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar drawer */}
            <div
                className="show-mobile"
                style={{
                    position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 150,
                    width: 'var(--sidebar-width)',
                    maxWidth: '82vw',
                    transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: 'transform',
                }}
            >
                <SidebarContent />
            </div>
        </>
    );
}
