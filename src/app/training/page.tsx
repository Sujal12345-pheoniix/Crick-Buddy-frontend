'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { PageHeader } from '@/components/ui';
import {
    Move, CircleDot, Repeat, Target, Footprints, Crosshair, Dumbbell, Ruler, Zap, Activity, Shuffle,
    Clock, Swords, Wind, HeartPulse, type LucideIcon,
} from 'lucide-react';

const drills = {
    batting: [
        { title: 'Shadow Batting Drill', duration: '15 min', difficulty: 'Easy', desc: 'Practice your stance and swing motion without a ball. Focus on front foot movement and bat path.', icon: Move, tips: ['Stand in front of a mirror', 'Repeat 50 shadow drives', 'Check head position each time'] },
        { title: 'Hanging Ball Trainer', duration: '20 min', difficulty: 'Easy', desc: 'Suspended cricket ball on elastic string. Practice eye-hand coordination and timing.', icon: CircleDot, tips: ['Set ball at stump height', 'Focus on watching the ball closely', 'Try 100 hits minimum per session'] },
        { title: 'Throwdown Sessions', duration: '30 min', difficulty: 'Medium', desc: 'Coach or partner throws at different lengths. Focus on shot selection and weight transfer.', icon: Repeat, tips: ['Start with full tosses', 'Gradually move to good length', 'Call your shot before playing'] },
        { title: 'Batting Tee Work', duration: '20 min', difficulty: 'Easy', desc: 'Hit from a stationary tee to perfect bat swing angle and impact position.', icon: Target, tips: ['Place tee at different heights', 'Film yourself for technique review', 'Focus on bat speed at impact'] },
    ],
    bowling: [
        { title: 'Run-Up Acceleration Drill', duration: '15 min', difficulty: 'Medium', desc: 'Shorten your run-up by 3 steps and focus on rhythm and momentum into the crease.', icon: Footprints, tips: ['Mark your take-off point', 'Accelerate through the last 4 steps', 'Drive hard with the back leg'] },
        { title: 'Wall Bowling (Release Drill)', duration: '15 min', difficulty: 'Easy', desc: 'Bowl at a wall target from 5 metres. Perfect your wrist position and seam alignment.', icon: Crosshair, tips: ['Draw a target circle on the wall', 'Check seam is upright at release', 'Film from behind to check wrist'] },
        { title: 'Resistance Band Shoulder Work', duration: '10 min', difficulty: 'Easy', desc: 'Rotator cuff strengthening to increase pace and prevent injury.', icon: Dumbbell, tips: ['External rotation: 3 x 15 reps', 'Internal rotation: 3 x 15 reps', 'Rest 60 seconds between sets'] },
        { title: 'Off-stump Line Drill', duration: '25 min', difficulty: 'Medium', desc: 'Bowl a chalk line on off stump. Score points for hitting good length on / outside off.', icon: Ruler, tips: ['Bowl 30 deliveries minimum', 'Track your accuracy percentage', 'Aim for 70%+ on target'] },
    ],
    fitness: [
        { title: 'Sprint Training', duration: '20 min', difficulty: 'Hard', desc: '6 x 22-yard sprints (wicket to wicket) with 30 seconds rest. Build between-wickets speed.', icon: Zap, tips: ['Drive through with your arms', 'Start from a crouched position', 'Progress to 8 then 10 reps over weeks'] },
        { title: 'Core Stability Circuit', duration: '15 min', difficulty: 'Medium', desc: 'Plank, side plank, dead bug, bird dog. Foundation of all cricket movement.', icon: Activity, tips: ['30 seconds each exercise', '3 rounds total', 'Focus on spine neutrality'] },
        { title: 'Lateral Agility Ladder', duration: '15 min', difficulty: 'Medium', desc: 'Side-step patterns through agility ladder. Improves fielding movement and batting footwork.', icon: Shuffle, tips: ['In-in-out-out pattern', '5 reps each direction', 'Increase speed each rep'] },
    ]
};

const TAB_META: Record<keyof typeof drills, { label: string; icon: LucideIcon; blurb: string }> = {
    batting: { label: 'Batting', icon: Swords, blurb: 'Head still, bat straight, weight through the ball.' },
    bowling: { label: 'Bowling', icon: Wind, blurb: 'Rhythm in the run-up, a repeatable action, a tidy seam.' },
    fitness: { label: 'Fitness', icon: HeartPulse, blurb: 'Pace between the wickets and a strong, stable core.' },
};

const DIFFICULTY_CLASS: Record<string, string> = { Easy: 'badge-good', Medium: 'badge-fair', Hard: 'badge-poor' };

export default function TrainingPage() {
    const tabs = Object.keys(drills) as (keyof typeof drills)[];
    const [tab, setTab] = useState<keyof typeof drills>('batting');

    const current = drills[tab];
    const totalMinutes = current.reduce((sum, d) => sum + (parseInt(d.duration, 10) || 0), 0);

    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <div className="page">
                    <PageHeader
                        eyebrow="Training"
                        title="Drills for the nets"
                        description="Focused sessions to sharpen technique and fitness. Little and often beats one long session."
                    />

                    <div className="row-between wrap rise rise-1" style={{ marginBottom: 20 }}>
                        <div className="segmented" role="tablist" aria-label="Drill category">
                            {tabs.map(t => {
                                const Icon = TAB_META[t].icon;
                                return (
                                    <button key={t} type="button" role="tab" aria-selected={tab === t}
                                        className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
                                        <Icon size={15} /> {TAB_META[t].label}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="muted small tnum">
                            {current.length} drills · {totalMinutes} min in total
                        </div>
                    </div>

                    <section className="panel-black pitch-stripes rise rise-2" style={{ padding: '18px 22px', marginBottom: 20 }}>
                        <div className="label">{TAB_META[tab].label} focus</div>
                        <div style={{ marginTop: 6, fontSize: 15.5, color: 'var(--text-2)' }}>{TAB_META[tab].blurb}</div>
                    </section>

                    <div className="grid-auto rise rise-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))' }}>
                        {current.map((drill, i) => {
                            const Icon = drill.icon;
                            return (
                                <article key={i} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <div className="row-between" style={{ alignItems: 'flex-start' }}>
                                        <span className="choice-icon"><Icon size={20} /></span>
                                        <div className="row wrap" style={{ gap: 6, justifyContent: 'flex-end' }}>
                                            <span className="badge"><Clock size={12} /> {drill.duration}</span>
                                            <span className={`badge ${DIFFICULTY_CLASS[drill.difficulty] || ''}`}>{drill.difficulty}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="label" style={{ marginBottom: 6 }}>Drill {String(i + 1).padStart(2, '0')}</div>
                                        <h3>{drill.title}</h3>
                                        <p className="muted" style={{ fontSize: 14, marginTop: 8, lineHeight: 1.65 }}>{drill.desc}</p>
                                    </div>
                                    <hr className="seam" />
                                    <div>
                                        <div className="label" style={{ marginBottom: 10 }}>Coaching points</div>
                                        <ul className="ticks dots">
                                            {drill.tips.map((tip, j) => <li key={j} style={{ fontSize: 13.5 }}>{tip}</li>)}
                                        </ul>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
