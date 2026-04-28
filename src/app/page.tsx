'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Play, Zap, Target, BarChart3, MessageCircle, Users, Star, Shield, Award, Menu, X, TrendingUp, CheckCircle } from 'lucide-react';

const features = [
  { icon: '🏏', color: '#22c55e', href: '/upload', title: 'Batting Analysis', desc: 'AI analyzes stance, swing angle, head position & timing frame-by-frame.', metrics: ['Bat Swing Angle', 'Head Position', 'Timing Score', 'Shot Type'] },
  { icon: '⚡', color: '#6366f1', href: '/upload', title: 'Bowling Analysis', desc: 'Detects wrist position, arm rotation, release point & calculates ball speed.', metrics: ['Ball Speed km/h', 'Arm Rotation', 'Wrist Position', 'Bowling Style'] },
  { icon: '📸', color: '#f97316', href: '/upload', title: 'Posture Analysis', desc: 'Analyze shoulder alignment, knee bend, balance from a single image.', metrics: ['Shoulder Alignment', 'Knee Bend Angle', 'Balance Score', 'Spine Position'] },
  { icon: '📊', color: '#8b5cf6', href: '/progress', title: 'Progress Tracking', desc: 'Beautiful charts show your improvement over time with weekly breakdowns.', metrics: ['Weekly Progress', 'Skill Trends', 'KPI Charts', 'Comparison'] },
  { icon: '🤖', color: '#ec4899', href: '/chatbot', title: 'AI Cricket Coach', desc: 'Chat with your personal AI coach 24/7. Get personalized drills & advice.', metrics: ['Batting Tips', 'Bowling Drills', 'Fitness Plans', 'Strategy'] },
  { icon: '🏆', color: '#14b8a6', href: '/academy', title: 'Academy Mode', desc: 'Coaches can monitor all players, compare stats and assign drills.', metrics: ['Player Monitoring', 'Team Dashboard', 'Drills Assignment', 'Leaderboard'] },
];

const stats = [
  { num: '10K+', label: 'Videos Analyzed' },
  { num: '94%', label: 'Accuracy Rate' },
  { num: '2.3x', label: 'Average Improvement' },
  { num: '500+', label: 'Academies Using' },
];

const testimonials = [
  { name: 'Rahul Sharma', role: 'Batsman · Semi-Pro', avatar: 'R', rating: 5, text: 'Found a stance flaw I had for 3 years. My average jumped from 28 to 47 in 6 weeks.', color: '#22c55e' },
  { name: 'Priya Coach', role: 'Coach · Mumbai Academy', avatar: 'P', rating: 5, text: 'Academy Mode is a game-changer. I track 40 players from one dashboard instead of notebooks.', color: '#6366f1' },
  { name: 'Arjun Mehta', role: 'Fast Bowler · Under-19', avatar: 'A', rating: 5, text: 'Ball speed went from 118 to 134 km/h in 8 weeks. Wrist correction made all the difference.', color: '#f97316' },
];

const steps = [
  { num: '01', icon: '📹', title: 'Upload Video', desc: 'Upload batting/bowling video or posture image in any format' },
  { num: '02', icon: '🤖', title: 'AI Analyzes', desc: 'MediaPipe + OpenCV analyze 30 frames per second instantly' },
  { num: '03', icon: '📊', title: 'Get Report', desc: 'Receive detailed performance metrics with actionable scores' },
  { num: '04', icon: '🏏', title: 'Train Smarter', desc: 'Follow AI-recommended drills to improve fast' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 64,
        background: scrolled ? 'rgba(6,8,15,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        display: 'flex', alignItems: 'center',
        padding: '0 clamp(16px, 4vw, 48px)',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src="/icon.png" alt="Crick Buddy" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>Crick-Buddy</span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hide-mobile">
          {['Features', 'How It Works', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            >{item}</a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="hide-mobile">
          <Link href="/login" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '8px 16px' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>
            Sign In
          </Link>
          <Link href="/register" className="btn btn-primary" style={{ fontSize: 14, padding: '9px 20px' }}>
            Start Free <ChevronRight size={15} />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="show-mobile"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '8px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}
          aria-label="Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 199,
          background: 'rgba(6,8,15,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 20px 24px',
          animation: 'slideDown 0.2s ease',
        }}>
          {['Features', 'How It Works', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '13px 4px', color: 'rgba(255,255,255,0.75)', fontSize: 16, fontWeight: 500, borderBottom: '1px solid var(--border)', textDecoration: 'none' }}>
              {item}
            </a>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <Link href="/login" onClick={() => setMenuOpen(false)}
              style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: 10, border: '1px solid var(--border)', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>
              Sign In
            </Link>
            <Link href="/register" onClick={() => setMenuOpen(false)}
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: 15 }}>
              Start Free
            </Link>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: 'clamp(100px,14vw,140px) clamp(20px,5vw,60px) clamp(60px,8vw,100px)' }}>
        {/* Orbs */}
        <div className="hero-orb" style={{ width: 600, height: 600, background: 'rgba(34,197,94,0.06)', top: '-10%', right: '-10%' }} />
        <div className="hero-orb" style={{ width: 400, height: 400, background: 'rgba(99,102,241,0.05)', bottom: '5%', left: '-5%', animationDelay: '2s' }} />
        <div className="hero-orb" style={{ width: 200, height: 200, background: 'rgba(249,115,22,0.04)', top: '40%', right: '30%', animationDelay: '1s' }} />

        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1, width: '100%' }}>


          <h1 style={{ fontSize: 'clamp(38px,7vw,80px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-0.02em' }}>
            Your Cricket Coach<br />
            <span style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Level Up Your Game
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(16px,2.2vw,20px)', color: 'rgba(255,255,255,0.55)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.75 }}>
            Upload your batting or bowling video. Get a professional performance report with actionable drills in under 2 minutes.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <Link href="/register" className="btn btn-primary btn-xl">
              Analyze My Game <ChevronRight size={18} />
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Watch Demo <Play size={16} />
            </Link>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 700, margin: '0 auto' }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '16px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 'clamp(10px,1.5vw,12px)', color: 'rgba(255,255,255,0.45)', marginTop: 5, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>What You Get</span>
          <h2 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, marginTop: 10, marginBottom: 14, letterSpacing: '-0.02em' }}>
            Everything to Dominate<br />the Pitch
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17, maxWidth: 560, margin: '0 auto' }}>
            Professional-grade AI analysis tools used by players and coaches worldwide.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px,100%), 1fr))', gap: 20 }}>
          {features.map(f => (
            <Link key={f.title} href={f.href} style={{ textDecoration: 'none' }}>
              <div className="card card-interactive" style={{ padding: 24, height: '100%', cursor: 'pointer' }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#fff' }}>{f.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{f.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {f.metrics.map(m => (
                    <span key={m} style={{ fontSize: 11, fontWeight: 600, color: f.color, background: `${f.color}14`, padding: '3px 10px', borderRadius: 20, border: `1px solid ${f.color}28` }}>
                      {m}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: f.color, fontSize: 13, fontWeight: 700 }}>
                  Explore <ChevronRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, marginBottom: 52, letterSpacing: '-0.02em' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px,100%), 1fr))', gap: 36 }}>
            {steps.map((step, i) => (
              <div key={step.num} style={{ position: 'relative' }}>
                {i < steps.length - 1 && (
                  <div className="hide-mobile" style={{ position: 'absolute', top: 28, left: '60%', right: '-40%', height: 2, background: 'linear-gradient(90deg, rgba(34,197,94,0.3), transparent)' }} />
                )}
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 26 }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: '0.1em', marginBottom: 8 }}>{step.num}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, textAlign: 'center', marginBottom: 48, letterSpacing: '-0.02em' }}>
          Players Love Crick-Buddy 🏏
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px,100%), 1fr))', gap: 20 }}>
          {testimonials.map(t => (
            <div key={t.name} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', marginBottom: 14 }}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={15} fill="#eab308" color="#eab308" />
                ))}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>
                "{t.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${t.color}, ${t.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#0a0e1a', flexShrink: 0 }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: t.color, fontWeight: 600 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.02em' }}>Simple, Fair Pricing</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 52, fontSize: 17 }}>Start free. No credit card required.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(290px,100%), 1fr))', gap: 24, alignItems: 'start' }}>
            {[
              { name: 'Starter', price: 'Free', period: 'forever', features: ['5 video analyses/mo', 'Batting & bowling analysis', 'AI Coach Chat', 'Progress tracking'], cta: 'Get Started Free', highlight: false, color: '#22c55e' },
              { name: 'Pro', price: '₹799', period: '/month', features: ['Unlimited analyses', 'Advanced metrics', 'Shot classification', 'Priority processing', 'PDF reports', 'Equipment picks'], cta: 'Start Pro Trial', highlight: true, color: '#6366f1' },
              { name: 'Academy', price: '₹2,999', period: '/month', features: ['Everything in Pro', 'Up to 50 players', 'Coach dashboard', 'Leaderboard', 'CSV exports', 'Dedicated support'], cta: 'Contact Sales', highlight: false, color: '#f97316' },
            ].map(plan => (
              <div key={plan.name} className="card" style={{
                padding: '28px 24px', textAlign: 'left',
                border: plan.highlight ? `1px solid rgba(99,102,241,0.4)` : undefined,
                background: plan.highlight ? 'linear-gradient(145deg, #111626, #0e1230)' : undefined,
                position: 'relative',
                transform: plan.highlight ? 'scale(1.03)' : undefined,
              }}>
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--gradient-blue)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 16px', borderRadius: 20 }}>
                    🔥 MOST POPULAR
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: plan.color }} />
                  <div style={{ fontWeight: 800, fontSize: 17 }}>{plan.name}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 22 }}>
                  <span style={{ fontSize: 38, fontWeight: 900, color: plan.highlight ? '#818cf8' : '#fff' }}>{plan.price}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
                      <CheckCircle size={15} color={plan.color} style={{ flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`btn ${plan.highlight ? 'btn-secondary' : 'btn-ghost'} btn-full`}
                  style={{ justifyContent: 'center', borderColor: plan.highlight ? '#6366f1' : undefined, color: plan.highlight ? '#818cf8' : undefined }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: 'clamp(80px,10vw,120px) clamp(20px,5vw,60px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-orb" style={{ width: 500, height: 500, background: 'rgba(34,197,94,0.06)', top: '-20%', left: '50%', transform: 'translateX(-50%)' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🏆</div>
          <h2 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 900, marginBottom: 18, letterSpacing: '-0.02em' }}>
            Ready to Transform<br />Your Cricket?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, marginBottom: 40, lineHeight: 1.7 }}>
            Join thousands of players and academies using AI to analyze, improve and dominate.
          </p>
          <Link href="/register" className="btn btn-primary btn-xl">
            Analyze My Game — It's Free <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '36px clamp(20px,5vw,60px)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src="/icon.png" alt="Crick Buddy" style={{ width: 26, height: 26, objectFit: 'contain' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Crick-Buddy Cricket AI</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
          © 2026 Crick-Buddy · Your Digital Cricket Partner
        </p>
      </footer>
    </div>
  );
}
