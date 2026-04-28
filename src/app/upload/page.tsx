'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { uploadsAPI } from '@/lib/api';
import { Upload, CheckCircle, X, Loader, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const UPLOAD_TYPES = [
    { value: 'batting', label: 'Batting Video',  emoji: '🏏', desc: 'MP4, MOV, AVI · Max 500 MB', accept: 'video/*', color: '#22c55e', points: ['Bat swing angle', 'Stance & foot positioning', 'Head position & alignment', 'Shot timing score', 'Follow-through', 'Shot type classification'] },
    { value: 'bowling', label: 'Bowling Video',  emoji: '⚡', desc: 'MP4, MOV, AVI · Max 500 MB', accept: 'video/*', color: '#6366f1', points: ['Wrist position at release', 'Arm rotation angle', 'Release point height', 'Estimated ball speed km/h', 'Body balance', 'Bowling style classification'] },
    { value: 'posture', label: 'Posture Image',  emoji: '📸', desc: 'JPG, PNG, WebP · Max 50 MB',  accept: 'image/*', color: '#f97316', points: ['Shoulder alignment', 'Knee bend angle', 'Balance assessment', 'Spine position', 'Athletic posture score'] },
];

export default function UploadPage() {
    const { user } = useAuth();
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);
    const [selectedType, setSelectedType] = useState('batting');
    const [file, setFile] = useState<File | null>(null);
    const [notes, setNotes] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedId, setUploadedId] = useState<string | null>(null);
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

    const formatSize = (bytes: number) => bytes < 1024 * 1024
        ? `${(bytes / 1024).toFixed(0)} KB`
        : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

    const handleUpload = async () => {
        if (!file) return toast.error('Please select a file first');
        setUploading(true);
        setProgress(10);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('type', selectedType);
        if (notes) fd.append('notes', notes);
        try {
            const interval = setInterval(() => setProgress(p => Math.min(p + 6, 88)), 600);
            const res = await uploadsAPI.upload(fd);
            clearInterval(interval);
            setProgress(100);
            setUploadedId(res.data.upload.id);
            toast.success('Upload successful! AI analysis started 🤖');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Upload failed');
            setProgress(0);
        } finally { setUploading(false); }
    };

    const typeData = UPLOAD_TYPES.find(t => t.value === selectedType)!;

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ padding: 'clamp(16px,3vw,32px) clamp(16px,3vw,40px)', width: '100%' }}>
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 'clamp(20px,3.5vw,28px)', fontWeight: 800, marginBottom: 6, letterSpacing: '-0.01em' }}>
                        Upload & Analyze 📹
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Upload your cricket video or posture image for AI-powered analysis</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 24, maxWidth: 1040 }}>
                    {/* LEFT: Type selection + analysis info */}
                    <div>
                        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)' }}>Choose Analysis Type</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                            {UPLOAD_TYPES.map(t => (
                                <button key={t.value}
                                    onClick={() => { setSelectedType(t.value); setFile(null); }}
                                    style={{
                                        background: selectedType === t.value ? `${t.color}10` : 'rgba(255,255,255,0.03)',
                                        border: `1.5px solid ${selectedType === t.value ? t.color : 'var(--border)'}`,
                                        borderRadius: 12, padding: '14px 18px', cursor: 'pointer',
                                        textAlign: 'left', transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', gap: 14, width: '100%', fontFamily: 'inherit',
                                    }}>
                                    <span style={{ fontSize: 26 }}>{t.emoji}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: selectedType === t.value ? t.color : 'var(--text-primary)', marginBottom: 2 }}>{t.label}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.desc}</div>
                                    </div>
                                    {selectedType === t.value && <CheckCircle size={16} color={t.color} style={{ flexShrink: 0 }} />}
                                </button>
                            ))}
                        </div>

                        {/* What will be analyzed */}
                        <div className="card" style={{ padding: 18 }}>
                            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: typeData.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                What AI Analyzes
                            </h3>
                            <ul style={{ listStyle: 'none' }}>
                                {typeData.points.map((item, i) => (
                                    <li key={i} style={{ display: 'flex', gap: 10, marginBottom: 9, fontSize: 13, color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
                                        <span style={{ color: typeData.color, marginTop: 1, flexShrink: 0 }}>→</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* RIGHT: Upload zone */}
                    <div>
                        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)' }}>Upload File</h2>

                        {!uploadedId ? (
                            <>
                                {/* Drop zone */}
                                <div
                                    className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                                    style={{ marginBottom: 16 }}
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => !file && fileRef.current?.click()}
                                >
                                    <input ref={fileRef} type="file" accept={typeData.accept} style={{ display: 'none' }} onChange={handleFileChange} />

                                    {file ? (
                                        <div style={{ animation: 'bounce-in 0.3s ease' }}>
                                            <div style={{ fontSize: 44, marginBottom: 12 }}>{selectedType === 'posture' ? '🖼️' : '🎬'}</div>
                                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: typeData.color, wordBreak: 'break-all' }}>{file.name}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>{formatSize(file.size)}</div>
                                            <button
                                                onClick={e => { e.stopPropagation(); setFile(null); }}
                                                className="btn btn-danger btn-sm">
                                                <X size={13} /> Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{ fontSize: 48, marginBottom: 14 }}>{selectedType === 'posture' ? '📸' : '🎬'}</div>
                                            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Drop your file here</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>or tap to browse your device</div>
                                            <span style={{ display: 'inline-block', background: `${typeData.color}14`, border: `1px solid ${typeData.color}30`, borderRadius: 20, padding: '5px 14px', color: typeData.color, fontSize: 12, fontWeight: 600 }}>
                                                {typeData.desc}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Notes */}
                                <div style={{ marginBottom: 18 }}>
                                    <label className="input-label">Notes (optional)</label>
                                    <textarea className="input" rows={3}
                                        placeholder="E.g. Practice session, specific issue to focus on..."
                                        value={notes} onChange={e => setNotes(e.target.value)}
                                        style={{ resize: 'vertical', minHeight: 80 }} />
                                </div>

                                {/* Progress */}
                                {uploading && (
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>⚙️ Uploading & Analyzing...</span>
                                            <span style={{ fontSize: 13, color: typeData.color, fontWeight: 700 }}>{progress}%</span>
                                        </div>
                                        <div className="progress-bar" style={{ height: 8 }}>
                                            <div className="progress-fill" style={{ width: `${progress}%`, transition: 'width 0.4s ease', background: `linear-gradient(90deg, ${typeData.color}, ${typeData.color}cc)` }} />
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>AI is analyzing your performance...</div>
                                    </div>
                                )}

                                <button className="btn btn-primary btn-full btn-lg" style={{ justifyContent: 'center' }}
                                    onClick={handleUpload} disabled={uploading || !file}>
                                    {uploading
                                        ? <><Loader size={16} className="animate-spin" /> Analyzing...</>
                                        : <><Upload size={16} /> Start AI Analysis</>}
                                </button>

                                {!file && (
                                    <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                                        Analysis usually takes 30–90 seconds
                                    </p>
                                )}
                            </>
                        ) : (
                            /* Success */
                            <div className="card" style={{ padding: 40, textAlign: 'center', border: '1px solid rgba(34,197,94,0.25)' }}>
                                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36, animation: 'bounce-in 0.4s ease' }}>
                                    ✅
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Analysis Started!</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 14, lineHeight: 1.7 }}>
                                    Your AI analysis is running. Results are usually ready in 30–90 seconds.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <button className="btn btn-primary btn-full btn-lg" style={{ justifyContent: 'center' }}
                                        onClick={() => router.push(`/analysis/${uploadedId}`)}>
                                        View Analysis Status <ArrowRight size={16} />
                                    </button>
                                    <button className="btn btn-ghost btn-full" onClick={() => { setFile(null); setUploadedId(null); setProgress(0); }}>
                                        Upload Another Video
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
