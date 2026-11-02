'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PageHeader } from '@/components/ui';
import { uploadsAPI } from '@/lib/api';
import { Upload, X, Film, Target, PersonStanding, Camera, Ruler, Sun } from 'lucide-react';
import toast from 'react-hot-toast';

const UPLOAD_TYPES = [
    {
        value: 'batting', label: 'Batting', icon: Target, accept: 'video/*',
        desc: 'One shot, side-on, under 30 seconds',
        points: ['Front-foot timing into the swing', 'Head stability in the downswing', 'Balance at contact', 'Stride length', 'Follow-through', 'Set-up stance and shot family'],
    },
    {
        value: 'bowling', label: 'Bowling', icon: Film, accept: 'video/*',
        desc: 'One delivery, side-on, under 30 seconds',
        points: ['Release height and arm extension', 'Smoothness of the arm through the arc', 'Wrist position at release', 'Balance over the front foot', 'Ball speed, when the ball is tracked', 'Bowling arm detection'],
    },
    {
        value: 'posture', label: 'Posture', icon: PersonStanding, accept: 'image/*,video/*',
        desc: 'A photo or short clip of your ready position',
        points: ['Shoulder alignment', 'Knee bend', 'Hip balance', 'Spine position'],
    },
];

const TIPS = [
    { icon: Camera, title: 'Side-on, hip height', text: 'Square of the pitch, phone held steady. Front-on footage hides footwork.' },
    { icon: Ruler, title: 'Whole body in frame', text: 'Head to feet, with a little space above the bat or bowling arm.' },
    { icon: Sun, title: 'Good light, one action', text: 'Daylight or bright nets. Trim to the single shot or delivery.' },
];

const formatSize = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default function UploadPage() {
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);
    const [selectedType, setSelectedType] = useState('batting');
    const [file, setFile] = useState<File | null>(null);
    const [notes, setNotes] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) setFile(f);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return toast.error('Choose a clip first');
        setUploading(true);
        setProgress(0);
        // Text fields first: the server reads `type` while the file is still streaming in.
        const fd = new FormData();
        fd.append('type', selectedType);
        if (notes) fd.append('notes', notes);
        fd.append('file', file);
        try {
            const res = await uploadsAPI.upload(fd, setProgress);
            setProgress(100);
            toast.success('Uploaded — analysis has started');
            router.push(`/analysis/${res.data.upload.id}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Upload failed');
            setProgress(0);
            setUploading(false);
        }
    };

    const typeData = UPLOAD_TYPES.find(t => t.value === selectedType)!;

    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <div className="page">
                    <PageHeader
                        eyebrow="New analysis"
                        title="Analyse a clip"
                        description="Upload one shot or one delivery. We track 33 points on your body frame by frame and measure the moments that decide the outcome."
                    />

                    <div className="split rise rise-1">
                        <section className="stack">
                            <div>
                                <div className="label" style={{ marginBottom: 10 }}>1 · What are we looking at?</div>
                                <div className="grid-3" style={{ gap: 10 }} role="radiogroup" aria-label="Analysis type">
                                    {UPLOAD_TYPES.map(t => (
                                        <button key={t.value} type="button" role="radio" aria-checked={selectedType === t.value}
                                            className={`choice ${selectedType === t.value ? 'on' : ''}`}
                                            onClick={() => { setSelectedType(t.value); setFile(null); }}
                                            style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
                                            <span className="choice-icon"><t.icon size={20} /></span>
                                            <span>
                                                <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{t.label}</span>
                                                <span className="muted small">{t.desc}</span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="label" style={{ marginBottom: 10 }}>2 · Your clip</div>
                                <div
                                    className={`upload-zone pitch-stripes ${dragOver ? 'drag-over' : ''}`}
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => !file && !uploading && fileRef.current?.click()}
                                    role="button" tabIndex={0} aria-label="Choose a file to upload"
                                    onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !file) fileRef.current?.click(); }}
                                >
                                    <input ref={fileRef} type="file" accept={typeData.accept} hidden onChange={handleFileChange} />
                                    {file ? (
                                        <div className="stack" style={{ alignItems: 'center', gap: 12, width: '100%', maxWidth: 420 }}>
                                            <span className="choice-icon" style={{ background: 'var(--white)', color: 'var(--navy-950)' }}><Film size={20} /></span>
                                            <div>
                                                <div style={{ fontWeight: 600, wordBreak: 'break-all' }}>{file.name}</div>
                                                <div className="muted small">{formatSize(file.size)}</div>
                                            </div>
                                            {uploading ? (
                                                <div style={{ width: '100%' }}>
                                                    <div className="row-between small" style={{ marginBottom: 8 }}>
                                                        <span className="muted">{progress < 100 ? 'Uploading' : 'Starting analysis'}</span>
                                                        <span className="tnum" style={{ fontWeight: 600 }}>{progress}%</span>
                                                    </div>
                                                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                                                </div>
                                            ) : (
                                                <button type="button" className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setFile(null); }}>
                                                    <X size={14} /> Choose a different file
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="stack" style={{ alignItems: 'center', gap: 10 }}>
                                            <span className="choice-icon"><Upload size={20} /></span>
                                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, textTransform: 'uppercase' }}>Drop your {typeData.label.toLowerCase()} clip</div>
                                            <div className="muted small">or click to browse · MP4, MOV, WebM up to 500 MB</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="field">
                                <label className="input-label" htmlFor="notes">3 · Notes (optional)</label>
                                <textarea id="notes" className="input" rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                                    placeholder="e.g. Nets session, working on getting forward to full balls" style={{ resize: 'vertical' }} />
                            </div>

                            <button className="btn btn-primary btn-xl btn-full" onClick={handleUpload} disabled={uploading || !file}>
                                {uploading ? <><span className="spinner" style={{ width: 18, height: 18, borderTopColor: 'var(--navy-950)' }} /> Uploading…</> : <><Upload size={18} /> Start analysis</>}
                            </button>
                        </section>

                        <aside className="stack">
                            <div className="card card-pad">
                                <div className="eyebrow" style={{ marginBottom: 14 }}>What we measure</div>
                                <ul className="ticks">{typeData.points.map(p => <li key={p}>{p}</li>)}</ul>
                            </div>
                            <div className="panel-black card-pad">
                                <div className="eyebrow" style={{ marginBottom: 16 }}>Film it right</div>
                                <div className="stack" style={{ gap: 18 }}>
                                    {TIPS.map(({ icon: Icon, title, text }) => (
                                        <div key={title} className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
                                            <span className="choice-icon" style={{ width: 36, height: 36 }}><Icon size={17} /></span>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
                                                <div className="muted small">{text}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}
