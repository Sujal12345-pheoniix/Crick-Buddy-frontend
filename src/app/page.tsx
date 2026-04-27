'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, Play, ChevronRight, Zap, Target, BarChart3, MessageCircle, Star, Shield, Users, Award, Menu, X } from 'lucide-react';

const features = [
  {
    icon: Play, color: '#00ff88', href: '/upload',
    title: 'Batting Analysis',
    desc: 'AI analyzes stance, bat swing angle, head position, timing, and follow-through frame by frame.',
    metrics: ['Bat Swing Angle', 'Head Position', 'Timing Score', 'Shot Type']
  },
  {
    icon: Zap, color: '#3b82f6', href: '/upload',
    title: 'Bowling Analysis',
    desc: 'MediaPipe detects wrist position, arm rotation, release point. OpenCV calculates ball speed.',
    metrics: ['Ball Speed (km/h)', 'Arm Rotation', 'Wrist Position', 'Bowling Style']
  },
  {
    icon: Target, color: '#f59e0b', href: '/upload',
    title: 'Posture Analysis',
    desc: 'Analyze shoulder alignment, knee bend, balance and spine position from a single image.',
    metrics: ['Shoulder Alignment', 'Knee Bend Angle', 'Balance Score', 'Spine Position']
  },
  {
    icon: BarChart3, color: '#8b5cf6', href: '/progress',
    title: 'Progress Tracking',
    desc: 'Track improvement over time with beautiful charts. See your swing speed, accuracy and balance improve.',
    metrics: ['Weekly Progress', 'Skill Trends', 'KPI Charts', 'Comparison']
  },
  {
    icon: MessageCircle, color: '#ec4899', href: '/chatbot',
    title: 'AI Cricket Coach',
    desc: 'Chat with your personal AI coach 24/7. Get personalized advice on technique, fitness and strategy.',
    metrics: ['Batting Tips', 'Bowling Drills', 'Fitness Plans', 'Strategy']
  },
  {
    icon: Users, color: '#14b8a6', href: '/academy',
    title: 'Academy Mode',
    desc: 'Coaches can monitor all players, compare stats, assign drills and track team progress holistically.',
    metrics: ['Player Monitoring', 'Team Dashboard', 'Drills Assignment', 'Leaderboard']
  },
];

const testimonials = [
  { name: 'Rahul Sharma', role: 'Batting — Semi-Professional', rating: 5, text: 'The batting stance analysis found a flaw I had for 3 years. After 6 weeks of drills, my average went from 28 to 47.' },
  { name: 'Priya Coach', role: 'Coach — Mumbai Cricket Academy', rating: 5, text: 'Academy Mode is a game-changer. I can track 40 players from one dashboard instead of keeping notes.' },
  { name: 'Arjun Mehta', role: 'Fast Bowler — Under-19', rating: 5, text: 'Ball speed went from 118 to 134 km/h in 8 weeks. The wrist position correction made all the difference.' },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 clamp(16px, 4vw, 40px)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src="/icon.png" alt="Crick Buddy Logo" style={{ width: 34, height: 34, objectFit: 'contain' }} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Crick-Buddy</span>
          <span style={{ fontSize: 11, color: '#00ff88', background: 'rgba(0,255,136,0.1)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>AI</span>
        </div>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }} className="hidden md:flex">
          <nav style={{ display: 'flex', gap: 28 }}>
            {['Features', 'Pricing', 'Academy'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = '#fff'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}
              >{item}</a>
            ))}
          </nav>
          <Link href="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Login</Link>
          <Link href="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>
            Start Free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 8, padding: '7px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden" style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
          background: 'rgba(10,14,26,0.98)', borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8,
          backdropFilter: 'blur(20px)'
        }}>
          {['Features', 'Pricing', 'Academy'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 15, fontWeight: 500, padding: '10px 4px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {item}
            </a>
          ))}
          <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}
              style={{ flex: 1, textAlign: 'center', padding: '11px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Login
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary"
              style={{ flex: 1, textAlign: 'center', padding: '11px', fontSize: 14, justifyContent: 'center' }}>
              Start Free
            </Link>
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{ paddingTop: 160, paddingBottom: 80, paddingLeft: 'clamp(20px, 5vw, 40px)', paddingRight: 'clamp(20px, 5vw, 40px)', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 20, padding: '6px 14px', marginBottom: 24 }}>
          <span style={{ width: 6, height: 6, background: '#00ff88', borderRadius: '50%', animation: 'pulse-green 2s infinite' }} />
          <span style={{ fontSize: 13, color: '#00ff88', fontWeight: 600 }}>AI-Powered Cricket Analytics — Powered by MediaPipe & OpenCV</span>
        </div>

        <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, maxWidth: 800 }}>
          Analyze Your Cricket <br />
          <span style={{ background: 'linear-gradient(135deg, #00ff88, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Performance with AI
          </span>
        </h1>

        <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', maxWidth: 620, lineHeight: 1.7, marginBottom: 40 }}>
          Upload your batting or bowling video. Our AI analyzes stance, swing angle, ball speed and posture — then generates a professional performance report with actionable drills.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/register" className="btn-primary" style={{ fontSize: 'clamp(14px, 2vw, 16px)', padding: '14px 28px' }}>
            Analyze My Game <ChevronRight size={18} />
          </Link>
          <Link href="/login" className="btn-secondary" style={{ fontSize: 'clamp(14px, 2vw, 16px)', padding: '14px 28px' }}>
            Watch Demo
          </Link>
        </div>

      </section>

      {/* Features */}
      <section id="features" style={{ padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 40px)', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#00ff88', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Features</span>
          <h2 style={{ fontSize: 44, fontWeight: 900, marginTop: 8, marginBottom: 16 }}>Everything You Need <br />to Dominate the Pitch</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
            Professional-grade AI analysis tools trusted by players and academies worldwide.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(360px, 100%), 1fr))', gap: 24 }}>
          {features.map(f => (
            <Link key={f.title} href={f.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 24, cursor: 'pointer', transition: 'all 0.25s', height: '100%' }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(-4px)';
                  el.style.borderColor = f.color + '55';
                  el.style.boxShadow = `0 12px 40px ${f.color}18`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(0)';
                  el.style.borderColor = 'rgba(255,255,255,0.06)';
                  el.style.boxShadow = 'none';
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <f.icon size={24} color={f.color} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{f.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {f.metrics.map(m => (
                    <span key={m} style={{ fontSize: 11, fontWeight: 600, color: f.color, background: `${f.color}14`, padding: '3px 10px', borderRadius: 20, border: `1px solid ${f.color}30` }}>
                      {m}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: f.color, fontSize: 13, fontWeight: 700 }}>
                  Try it <ChevronRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: 'clamp(60px, 8vw, 80px) clamp(20px, 5vw, 40px)', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, marginBottom: 48 }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 32 }}>
            {[
              { num: '01', title: 'Upload Video', desc: 'Upload your batting or bowling video (any format)', icon: '📹' },
              { num: '02', title: 'AI Analysis', desc: 'MediaPipe + OpenCV analyze 30 frames per second', icon: '🤖' },
              { num: '03', title: 'Get Report', desc: 'Receive detailed performance metrics and scores', icon: '📊' },
              { num: '04', title: 'Train Smarter', desc: 'Follow AI-recommended drills to improve fast', icon: '🏏' },
            ].map(step => (
              <div key={step.num} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{step.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#00ff88', letterSpacing: '0.1em' }}>{step.num}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '8px 0' }}>{step.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 40px)', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, textAlign: 'center', marginBottom: 48 }}>Players Love Crick-Buddy</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 24 }}>
          {testimonials.map(t => (
            <div key={t.name} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', marginBottom: 12 }}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                <div style={{ fontSize: 13, color: '#00ff88' }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 40px)', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, marginBottom: 16 }}>Simple, Fair Pricing</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 48, fontSize: 17 }}>Start free. Scale as you grow.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: 24 }}>
            {[
              { name: 'Starter', price: 'Free', period: 'forever', features: ['5 video analyses/mo', 'Basic batting & bowling', 'AI Coach Chat', 'Progress tracking'], cta: 'Get Started', highlight: false },
              { name: 'Pro', price: '₹799', period: '/month', features: ['Unlimited analyses', 'Advanced metrics', 'Shot classification', 'Priority processing', 'PDF reports', 'Equipment recommendations'], cta: 'Start Pro', highlight: true },
              { name: 'Academy', price: '₹2,999', period: '/month', features: ['Everything in Pro', 'Up to 50 players', 'Coach dashboard', 'Leaderboard', 'CSV exports', 'Dedicated support'], cta: 'Contact Sales', highlight: false },
            ].map(plan => (
              <div key={plan.name} className="card" style={{
                padding: 32, textAlign: 'left',
                border: plan.highlight ? '1px solid rgba(0,255,136,0.5)' : undefined,
                background: plan.highlight ? 'linear-gradient(145deg, #0f1e2f, #111829)' : undefined,
                transform: plan.highlight ? 'scale(1.03)' : undefined,
                position: 'relative'
              }}>
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #00ff88, #00c864)', color: '#0a0e1a', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20 }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: plan.highlight ? '#00ff88' : '#fff' }}>{plan.price}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
                      <Shield size={14} color="#00ff88" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={plan.highlight ? 'btn-primary' : 'btn-secondary'}
                  style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '12px', borderRadius: 8 }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 40px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <Award size={48} color="#00ff88" style={{ marginBottom: 24, display: 'block', margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: 44, fontWeight: 900, marginBottom: 20 }}>Ready to Transform Your Cricket?</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 18, marginBottom: 40 }}>
            Join players and academies using Crick-Buddy to analyze, improve and dominate.
          </p>
          <Link href="/register" className="btn-primary" style={{ fontSize: 18, padding: '16px 48px' }}>
            Analyze My Game — It's Free <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
             <img src="/icon.png" alt="Crick Buddy Logo" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16 }}>Crick-Buddy Cricket AI</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
          © 2024 Crick-Buddy. Built with MediaPipe, OpenCV & Next.js
        </p>
      </footer>
    </div>
  );
}
