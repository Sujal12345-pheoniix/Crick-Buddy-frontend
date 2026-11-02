'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, Target, Film, PersonStanding, Upload, ScanLine, ClipboardCheck, Check } from 'lucide-react';
import { BrandMark, BrandName } from '@/components/Sidebar';

const MEASURES = [
    {
        icon: Target, title: 'Batting', lead: 'From trigger to follow-through.',
        items: ['Front-foot timing into the swing', 'Head stability in the downswing', 'Balance at contact', 'Stride length and set-up stance', 'Follow-through and swing plane'],
    },
    {
        icon: Film, title: 'Bowling', lead: 'The gather, the arc and the release.',
        items: ['Release height and arm extension', 'Smoothness of the bowling arm', 'Wrist position at release', 'Balance over the front foot', 'Ball speed when the ball is tracked'],
    },
    {
        icon: PersonStanding, title: 'Posture', lead: 'The ready position, from one photo.',
        items: ['Shoulder alignment', 'Knee bend', 'Hip balance', 'Spine position'],
    },
];

const STEPS = [
    { icon: Upload, title: 'Film one action', text: 'A single shot or delivery, side-on at hip height, whole body in frame. Your phone is enough.' },
    { icon: ScanLine, title: 'We track 33 points', text: 'Every frame of the key moment is measured — joints, angles, timing — then checked against coaching thresholds.' },
    { icon: ClipboardCheck, title: 'Train what matters', text: 'A scored report with the faults it found, the evidence for each, and the drills that fix them.' },
];

const PLANS = [
    { name: 'Starter', price: 'Free', period: 'forever', features: ['5 video analyses / month', 'Batting & bowling analysis', 'AI coach chat', 'Progress tracking'], cta: 'Get started', highlight: false },
    { name: 'Pro', price: '₹799', period: '/ month', features: ['Unlimited analyses', 'Advanced metrics', 'Shot classification', 'Priority processing', 'PDF reports', 'Equipment picks'], cta: 'Start Pro trial', highlight: true },
    { name: 'Academy', price: '₹2,999', period: '/ month', features: ['Everything in Pro', 'Up to 50 players', 'Coach dashboard', 'Leaderboard', 'CSV exports', 'Dedicated support'], cta: 'Contact sales', highlight: false },
];

const TICKER = ['Front-foot timing', 'Head stability', 'Balance at contact', 'Release height', 'Arm smoothness', 'Wrist position', 'Follow-through', 'Stride length', 'Swing plane', 'Knee drive'];

// Clearly labelled illustration of a report — not a real player's data.
const EXAMPLE = [
    { label: 'Timing', value: 82, band: 'good' },
    { label: 'Head stability', value: 74, band: 'fair' },
    { label: 'Balance at contact', value: 88, band: 'good' },
    { label: 'Follow-through', value: 61, band: 'fair' },
];

const NAV = [['How it works', '#how'], ['What we measure', '#measure'], ['Pricing', '#pricing']];

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div style={{ background: 'var(--navy-1000)' }}>
            {/* ── Nav ── */}
            <nav className="site-nav">
                <div className="container row-between">
                    <Link href="/" className="row" style={{ gap: 10 }}><BrandMark size={32} /><BrandName /></Link>
                    <div className="row hide-mobile" style={{ gap: 4 }}>
                        {NAV.map(([label, href]) => <a key={href} href={href} className="btn btn-ghost btn-sm">{label}</a>)}
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                        <Link href="/login" className="btn btn-ghost btn-sm hide-mobile">Sign in</Link>
                        <Link href="/register" className="btn btn-primary btn-sm">Get started</Link>
                        <button className="btn btn-navy btn-icon btn-sm show-mobile" style={{ width: 34 }} onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
                            {menuOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
            </nav>
            {menuOpen && (
                <div className="show-mobile" style={{ position: 'fixed', top: 68, left: 0, right: 0, zIndex: 49, background: 'var(--navy-1000)', borderBottom: '1px solid var(--line)', padding: 16 }}>
                    <div className="stack" style={{ gap: 4 }}>
                        {NAV.map(([label, href]) => <a key={href} href={href} className="btn btn-ghost btn-full" style={{ justifyContent: 'flex-start' }} onClick={() => setMenuOpen(false)}>{label}</a>)}
                        <Link href="/login" className="btn btn-secondary btn-full" style={{ marginTop: 8 }}>Sign in</Link>
                    </div>
                </div>
            )}

            {/* ── Hero ── */}
            <header className="hero pitch-stripes">
                <div className="container" style={{ padding: 'clamp(56px, 9vw, 120px) clamp(16px, 4vw, 32px) clamp(64px, 9vw, 112px)' }}>
                    <div className="hero-grid">
                        <div className="rise">
                            <div className="eyebrow">Cricket technique analysis</div>
                            <h1 style={{ marginTop: 22 }}>Every shot.<br /><span style={{ color: 'var(--navy-300)' }}>Measured.</span></h1>
                            <p className="lede" style={{ marginTop: 24, fontSize: 18 }}>
                                Film one shot or one delivery on your phone. CrickBuddy tracks your body frame by frame and tells you exactly where the runs and wickets are being lost — with the drills to fix it.
                            </p>
                            <div className="row wrap" style={{ marginTop: 34, gap: 12 }}>
                                <Link href="/register" className="btn btn-primary btn-xl">Analyse your first clip <ArrowRight size={18} /></Link>
                                <a href="#how" className="btn btn-secondary btn-xl">See how it works</a>
                            </div>
                            <div className="row wrap muted small" style={{ marginTop: 28, gap: 22 }}>
                                <span className="row" style={{ gap: 8 }}><Check size={15} /> Free to start</span>
                                <span className="row" style={{ gap: 8 }}><Check size={15} /> Works with any phone video</span>
                                <span className="row" style={{ gap: 8 }}><Check size={15} /> Batting, bowling & posture</span>
                            </div>
                        </div>

                        {/* Example report card */}
                        <div className="panel-black rise rise-2" style={{ padding: 0, boxShadow: 'var(--shadow-3)', overflow: 'hidden' }} aria-label="Example report">
                            <div className="row-between wrap" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', gap: 8 }}>
                                <span className="label">Example report · Cover drive</span>
                                <span className="badge badge-white">Batting</span>
                            </div>
                            <div className="crease" style={{ padding: '26px 20px 22px' }}>
                                <div className="row" style={{ gap: 18, alignItems: 'flex-end' }}>
                                    <div className="stat-value score-good" style={{ fontSize: 88, marginTop: 0 }}>81</div>
                                    <div style={{ paddingBottom: 10 }}>
                                        <div className="label">Overall</div>
                                        <div style={{ fontWeight: 600 }}>Strong</div>
                                    </div>
                                </div>
                                <div className="stack" style={{ gap: 14, marginTop: 22 }}>
                                    {EXAMPLE.map(m => (
                                        <div key={m.label}>
                                            <div className="row-between small" style={{ marginBottom: 6 }}>
                                                <span style={{ color: 'var(--text-2)' }}>{m.label}</span>
                                                <span className="tnum" style={{ fontWeight: 600 }}>{m.value}</span>
                                            </div>
                                            <div className="stat-meter" style={{ marginTop: 0 }}><i className={m.band} style={{ width: `${m.value}%` }} /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)' }} className="small">
                                <span className="badge badge-fair" style={{ marginRight: 10 }}>Fault</span>
                                <span style={{ color: 'var(--text-2)' }}>Follow-through cut short — hands finish below the shoulder</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Ticker ── */}
            <div className="section-black" style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', overflow: 'hidden', padding: '18px 0' }} aria-hidden>
                <div className="ticker">
                    {[...TICKER, ...TICKER].map((t, i) => (
                        <span key={i} className="row" style={{ gap: 28, paddingRight: 28, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: i % 2 ? 'var(--text-3)' : 'var(--text)', whiteSpace: 'nowrap' }}>
                            {t}<span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--navy-500)' }} />
                        </span>
                    ))}
                </div>
            </div>

            {/* ── What we measure (light) ── */}
            <section id="measure" className="section section-light">
                <div className="container">
                    <div style={{ maxWidth: 640 }}>
                        <div className="eyebrow">What we measure</div>
                        <h2 style={{ marginTop: 14, fontSize: 'clamp(34px, 5vw, 56px)' }}>The moments that decide the ball.</h2>
                        <p className="lede" style={{ marginTop: 16 }}>Not a vague score. Each number comes from a specific moment in your clip — the front foot landing, the instant of release — and every fault shows the measurement behind it.</p>
                    </div>
                    <div className="grid-3" style={{ marginTop: 48, gap: 20 }}>
                        {MEASURES.map(({ icon: Icon, title, lead, items }) => (
                            <article key={title} style={{ background: '#FFFFFF', border: '1px solid #DCE4F3', borderRadius: 'var(--radius-lg)', padding: 28 }}>
                                <span style={{ width: 46, height: 46, borderRadius: 12, display: 'grid', placeItems: 'center', background: '#0A1428', color: '#FFFFFF' }}><Icon size={21} /></span>
                                <h3 style={{ marginTop: 20, fontSize: 28, color: '#0A1428' }}>{title}</h3>
                                <p className="muted" style={{ marginTop: 4 }}>{lead}</p>
                                <div style={{ height: 1, background: '#DCE4F3', margin: '20px 0' }} />
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {items.map(i => (
                                        <li key={i} className="row" style={{ gap: 10, alignItems: 'flex-start', color: '#1C2F55', fontSize: 14.5 }}>
                                            <Check size={16} style={{ flexShrink: 0, marginTop: 3 }} /> {i}
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it works ── */}
            <section id="how" className="section" style={{ background: 'var(--navy-950)' }}>
                <div className="container">
                    <div className="row-between wrap" style={{ alignItems: 'flex-end', gap: 24 }}>
                        <div>
                            <div className="eyebrow">How it works</div>
                            <h2 style={{ marginTop: 14, fontSize: 'clamp(34px, 5vw, 56px)' }}>Nets to notes in three steps.</h2>
                        </div>
                        <Link href="/register" className="btn btn-secondary btn-lg">Create a free account <ArrowRight size={17} /></Link>
                    </div>
                    <hr className="seam" style={{ margin: '40px 0' }} />
                    <div className="grid-3" style={{ gap: 'clamp(20px, 3vw, 40px)' }}>
                        {STEPS.map(({ icon: Icon, title, text }, i) => (
                            <div key={title}>
                                <div className="row" style={{ gap: 16, alignItems: 'baseline' }}>
                                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 64, lineHeight: 0.8, color: 'var(--navy-600)' }}>0{i + 1}</span>
                                    <Icon size={22} style={{ color: 'var(--navy-300)' }} />
                                </div>
                                <h3 style={{ marginTop: 20, fontSize: 24 }}>{title}</h3>
                                <p style={{ marginTop: 10, color: 'var(--text-2)' }}>{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Pricing ── */}
            <section id="pricing" className="section section-black">
                <div className="container">
                    <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
                        <div className="eyebrow">Pricing</div>
                        <h2 style={{ marginTop: 14, fontSize: 'clamp(34px, 5vw, 56px)' }}>Start free. Upgrade for the season.</h2>
                    </div>
                    <div className="grid-3" style={{ marginTop: 48, gap: 18, alignItems: 'stretch' }}>
                        {PLANS.map(plan => (
                            <div key={plan.name} className="card card-pad" style={{
                                display: 'flex', flexDirection: 'column', gap: 18, padding: 28,
                                background: plan.highlight ? 'var(--navy-850)' : 'var(--navy-900)',
                                borderColor: plan.highlight ? 'var(--white)' : 'var(--line)',
                            }}>
                                <div className="row-between">
                                    <h3 style={{ fontSize: 24 }}>{plan.name}</h3>
                                    {plan.highlight && <span className="badge badge-white">Most popular</span>}
                                </div>
                                <div>
                                    <span className="stat-value" style={{ fontSize: 52 }}>{plan.price}</span>
                                    <span className="muted" style={{ marginLeft: 8 }}>{plan.period}</span>
                                </div>
                                <ul className="ticks" style={{ flex: 1 }}>{plan.features.map(f => <li key={f}>{f}</li>)}</ul>
                                <Link href="/register" className={`btn ${plan.highlight ? 'btn-primary' : 'btn-secondary'} btn-lg btn-full`}>{plan.cta}</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="hero pitch-stripes section">
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'clamp(40px, 7vw, 84px)' }}>Your next net session<br /><span style={{ color: 'var(--navy-300)' }}>starts with the evidence.</span></h2>
                    <Link href="/register" className="btn btn-primary btn-xl" style={{ marginTop: 36 }}>Get started free <ArrowRight size={18} /></Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{ borderTop: '1px solid var(--line)', padding: '28px 0' }}>
                <div className="container row-between wrap muted small" style={{ gap: 16 }}>
                    <span className="row" style={{ gap: 10 }}><BrandMark size={24} /> © {new Date().getFullYear()} CrickBuddy</span>
                    <span className="row" style={{ gap: 18 }}>
                        <a href="#measure">What we measure</a><a href="#pricing">Pricing</a><Link href="/login">Sign in</Link>
                    </span>
                </div>
            </footer>
        </div>
    );
}
