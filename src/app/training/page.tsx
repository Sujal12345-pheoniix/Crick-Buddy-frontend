'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

const drills = {
    batting: [
        { title: 'Shadow Batting Drill', duration: '15 min', difficulty: 'Easy', desc: 'Practice your stance and swing motion without a ball. Focus on front foot movement and bat path.', icon: '🏏', tips: ['Stand in front of a mirror', 'Repeat 50 shadow drives', 'Check head position each time'] },
        { title: 'Hanging Ball Trainer', duration: '20 min', difficulty: 'Easy', desc: 'Suspended cricket ball on elastic string. Practice eye-hand coordination and timing.', icon: '🎾', tips: ['Set ball at stump height', 'Focus on watching the ball closely', 'Try 100 hits minimum per session'] },
        { title: 'Throwdown Sessions', duration: '30 min', difficulty: 'Medium', desc: 'Coach or partner throws at different lengths. Focus on shot selection and weight transfer.', icon: '⚾', tips: ['Start with full tosses', 'Gradually move to good length', 'Call your shot before playing'] },
        { title: 'Batting Tee Work', duration: '20 min', difficulty: 'Easy', desc: 'Hit from a stationary tee to perfect bat swing angle and impact position.', icon: '🎯', tips: ['Place tee at different heights', 'Film yourself for technique review', 'Focus on bat speed at impact'] },
    ],
    bowling: [
        { title: 'Run-Up Acceleration Drill', duration: '15 min', difficulty: 'Medium', desc: 'Shorten your run-up by 3 steps and focus on rhythm and momentum into the crease.', icon: '🏃', tips: ['Mark your take-off point', 'Accelerate through the last 4 steps', 'Drive hard with the back leg'] },
        { title: 'Wall Bowling (Release Drill)', duration: '15 min', difficulty: 'Easy', desc: 'Bowl at a wall target from 5 meters. Perfect your wrist position and seam alignment.', icon: '🧱', tips: ['Draw a target circle on the wall', 'Check seam is upright at release', 'Film from behind to check wrist'] },
        { title: 'Resistance Band Shoulder Work', duration: '10 min', difficulty: 'Easy', desc: 'Rotator cuff strengthening to increase pace and prevent injury.', icon: '💪', tips: ['External rotation: 3 x 15 reps', 'Internal rotation: 3 x 15 reps', 'Rest 60 seconds between sets'] },
        { title: 'Off-stump Line Drill', duration: '25 min', difficulty: 'Medium', desc: 'Bowl a chalk line on off stump. Score points for hitting good length on / outside off.', icon: '📏', tips: ['Bowl 30 deliveries minimum', 'Track your accuracy percentage', 'Aim for 70%+ on target'] },
    ],
    fitness: [
        { title: 'Sprint Training', duration: '20 min', difficulty: 'Hard', desc: '6 x 22-yard sprints (wicket to wicket) with 30 seconds rest. Build between-wickets speed.', icon: '⚡', tips: ['Drive through with your arms', 'Start from a crouched position', 'Progress to 8 then 10 reps over weeks'] },
        { title: 'Core Stability Circuit', duration: '15 min', difficulty: 'Medium', desc: 'Plank, side plank, dead bug, bird dog. Foundation of all cricket movement.', icon: '🧘', tips: ['30 seconds each exercise', '3 rounds total', 'Focus on spine neutrality'] },
        { title: 'Lateral Agility Ladder', duration: '15 min', difficulty: 'Medium', desc: 'Side-step patterns through agility ladder. Improves fielding movement and batting footwork.', icon: '🔄', tips: ['In-in-out-out pattern', '5 reps each direction', 'Increase speed each rep'] },
    ]
};

export default function TrainingPage() {
    const tabs = Object.keys(drills) as (keyof typeof drills)[];
    const [tab, setTab] = useState<keyof typeof drills>('batting');
    const colors: Record<string, string> = { batting: '#00ff88', bowling: '#3b82f6', fitness: '#f59e0b' };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ padding: '32px 40px' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Training Drills 🏋️</h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)' }}>AI-recommended drills based on your weaknesses. Complete consistently for best results.</p>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
                    {tabs.map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
                            border: `1.5px solid ${tab === t ? colors[t] : 'rgba(255,255,255,0.1)'}`,
                            background: tab === t ? `${colors[t]}14` : 'transparent',
                            color: tab === t ? colors[t] : 'rgba(255,255,255,0.5)',
                            textTransform: 'capitalize', transition: 'all 0.2s'
                        }}>
                            {t === 'batting' ? '🏏' : t === 'bowling' ? '⚡' : '🏃'} {t}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                    {drills[tab].map((drill, i) => (
                        <div key={i} className="card" style={{ padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                <span style={{ fontSize: 32 }}>{drill.icon}</span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <span style={{ background: `${colors[tab]}14`, color: colors[tab], border: `1px solid ${colors[tab]}30`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{drill.duration}</span>
                                    <span style={{ background: drill.difficulty === 'Easy' ? 'rgba(0,255,136,0.1)' : drill.difficulty === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(255,71,87,0.1)', color: drill.difficulty === 'Easy' ? '#00ff88' : drill.difficulty === 'Medium' ? '#f59e0b' : '#ff4757', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{drill.difficulty}</span>
                                </div>
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{drill.title}</h3>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 14, lineHeight: 1.7 }}>{drill.desc}</p>
                            <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, borderLeft: `3px solid ${colors[tab]}` }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: colors[tab], marginBottom: 6 }}>Coach Tips:</div>
                                {drill.tips.map((tip, j) => (
                                    <div key={j} style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 4, display: 'flex', gap: 6 }}>
                                        <span style={{ color: colors[tab] }}>•</span> {tip}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
