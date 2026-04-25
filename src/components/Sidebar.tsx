'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard, Upload, BarChart3, Dumbbell, ShoppingBag,
    MessageCircle, Users, Trophy, Settings, LogOut, Menu, X,
    Activity, ChevronRight, Shield
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/upload', icon: Upload, label: 'Upload & Analyze' },
    { href: '/progress', icon: BarChart3, label: 'Progress' },
    { href: '/events', icon: Trophy, label: 'Live & Tournaments' },
    { href: '/training', icon: Dumbbell, label: 'Training' },
    { href: '/equipment', icon: ShoppingBag, label: 'Equipment' },
    { href: '/chatbot', icon: MessageCircle, label: 'AI Coach Chat' },
    { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

const coachItems = [
    { href: '/academy', icon: Users, label: 'Academy Mode' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
        const isActive = pathname.startsWith(href);
        return (
            <Link href={href} className={`sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                <Icon size={18} />
                <span>{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto" />}
            </Link>
        );
    };

    const SidebarContent = () => (
        <div className="sidebar" style={{ width: mobileOpen ? '100vw' : undefined }}>
            {/* Logo */}
            <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(0,255,136,0.2)',
                        boxShadow: '0 4px 16px rgba(0,255,136,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        <img src="/icon.png" alt="Crick Buddy Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em' }}>Crick-Buddy</div>
                        <div style={{ fontSize: 12, color: '#00ff88', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 2 }}>Cricket AI</div>
                    </div>
                </Link>
            </div>

            {/* Nav Links */}
            <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
                <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Main Menu
                </div>
                {navItems.map(item => <NavLink key={item.href} {...item} />)}

                {(user?.role === 'coach' || user?.role === 'admin') && (
                    <>
                        <div style={{ padding: '16px 16px 4px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Coach
                        </div>
                        {coachItems.map(item => <NavLink key={item.href} {...item} />)}
                    </>
                )}

                {user?.role === 'admin' && (
                    <>
                        <div style={{ padding: '16px 16px 4px', fontSize: 11, fontWeight: 700, color: 'rgba(255,71,87,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Admin
                        </div>
                        <Link href="/admin" className={`sidebar-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                            style={{ color: pathname.startsWith('/admin') ? '#ff4757' : undefined }}>
                            <Shield size={18} />
                            <span>Admin Panel</span>
                            {pathname.startsWith('/admin') && <ChevronRight size={14} className="ml-auto" />}
                        </Link>
                    </>
                )}
            </nav>

            {/* User info */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Link href="/settings" className="sidebar-link" style={{ marginBottom: 4 }}>
                    <Settings size={18} />
                    <span>Settings</span>
                </Link>
                <button className="sidebar-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#ff4757' }}
                    onClick={logout}>
                    <LogOut size={18} />
                    <span>Sign out</span>
                </button>
                <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #00ff88, #00c864)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#0a0e1a', flexShrink: 0 }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{user?.role} · {user?.experienceLevel}</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <SidebarContent />
            </div>

            {/* Mobile toggle */}
            <button
                className="md:hidden"
                style={{
                    position: 'fixed', top: 16, left: 16, zIndex: 200,
                    background: 'rgba(15,21,39,0.95)', border: '1px solid rgba(0,255,136,0.2)',
                    borderRadius: 8, padding: '8px', cursor: 'pointer', color: '#fff'
                }}
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Sidebar */}
            {mobileOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 150 }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setMobileOpen(false)} />
                    <SidebarContent />
                </div>
            )}
        </>
    );
}
