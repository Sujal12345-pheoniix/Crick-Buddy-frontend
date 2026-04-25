'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { uploadsAPI } from '@/lib/api';
import { Upload, Video, Image, Activity, CheckCircle, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const UPLOAD_TYPES = [
    { value: 'batting', label: 'Batting Video', icon: '🏏', desc: 'MP4, MOV, AVI up to 500MB', accept: 'video/*', color: '#00ff88' },
    { value: 'bowling', label: 'Bowling Video', icon: '⚡', desc: 'MP4, MOV, AVI up to 500MB', accept: 'video/*', color: '#3b82f6' },
    { value: 'posture', label: 'Posture Image', icon: '📸', desc: 'JPG, PNG, WebP up to 50MB', accept: 'image/*', color: '#f59e0b' },
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

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleUpload = async () => {
        if (!file) return toast.error('Please select a file first');
        setUploading(true);
        setProgress(10);

        const fd = new FormData();
        fd.append('file', file);
        fd.append('type', selectedType);
        if (notes) fd.append('notes', notes);

        try {
            const progressInterval = setInterval(() => {
                setProgress(p => Math.min(p + 8, 85));
            }, 500);

            const res = await uploadsAPI.upload(fd);
            clearInterval(progressInterval);
            setProgress(100);
            setUploadedId(res.data.upload.id);
            toast.success('Upload successful! AI analysis started 🤖');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Upload failed');
            setProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const selectedTypeData = UPLOAD_TYPES.find(t => t.value === selectedType)!;

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ padding: '32px 40px' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Upload & Analyze 📹</h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>Upload your cricket video or posture image for AI analysis</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 32, maxWidth: 1000 }}>
                    {/* Left: type selection */}
                    <div>
                        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Select Analysis Type</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                            {UPLOAD_TYPES.map(t => (
                                <button key={t.value}
                                    onClick={() => { setSelectedType(t.value); setFile(null); }}
                                    style={{
                                        background: selectedType === t.value ? `${t.color}12` : 'rgba(255,255,255,0.03)',
                                        border: `1.5px solid ${selectedType === t.value ? t.color : 'rgba(255,255,255,0.08)'}`,
                                        borderRadius: 12, padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
                                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 14
                                    }}>
                                    <span style={{ fontSize: 24 }}>{t.icon}</span>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: selectedType === t.value ? t.color : '#fff', marginBottom: 2 }}>{t.label}</div>
                                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{t.desc}</div>
                                    </div>
                                    {selectedType === t.value && <CheckCircle size={18} color={t.color} style={{ marginLeft: 'auto' }} />}
                                </button>
                            ))}
                        </div>

                        {/* Analysis info */}
                        <div className="card" style={{ padding: 20 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: selectedTypeData.color }}>
                                What will be analyzed:
                            </h3>
                            <ul style={{ listStyle: 'none' }}>
                                {selectedType === 'batting' && [
                                    'Batting stance & foot positioning',
                                    'Bat swing angle (degrees)',
                                    'Head position & alignment',
                                    'Shot timing score',
                                    'Follow-through completeness',
                                    'Shot type classification',
                                ].map((item, i) => (
                                    <li key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                                        <span style={{ color: '#00ff88' }}>→</span> {item}
                                    </li>
                                ))}
                                {selectedType === 'bowling' && [
                                    'Wrist position at release',
                                    'Arm rotation angle',
                                    'Release point height',
                                    'Estimated ball speed (km/h)',
                                    'Body balance through delivery',
                                    'Bowling style classification',
                                ].map((item, i) => (
                                    <li key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                                        <span style={{ color: '#3b82f6' }}>→</span> {item}
                                    </li>
                                ))}
                                {selectedType === 'posture' && [
                                    'Shoulder alignment score',
                                    'Knee bend angle',
                                    'Balance assessment',
                                    'Spine position',
                                    'Athletic posture score',
                                ].map((item, i) => (
                                    <li key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                                        <span style={{ color: '#f59e0b' }}>→</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right: upload zone */}
                    <div>
                        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Upload File</h2>

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
                                    <input ref={fileRef} type="file" accept={selectedTypeData.accept} style={{ display: 'none' }} onChange={handleFileChange} />

                                    {file ? (
                                        <div>
                                            <div style={{ fontSize: 36, marginBottom: 12 }}>{selectedType === 'posture' ? '🖼️' : '🎬'}</div>
                                            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: selectedTypeData.color }}>{file.name}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 16 }}>{formatSize(file.size)}</div>
                                            <button
                                                onClick={e => { e.stopPropagation(); setFile(null); }}
                                                style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 8, padding: '6px 14px', color: '#ff4757', cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                <X size={14} /> Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{ fontSize: 48, marginBottom: 12 }}>
                                                {selectedType === 'posture' ? '📸' : '🎬'}
                                            </div>
                                            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Drop your file here</div>
                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 16 }}>or click to browse</div>
                                            <div style={{ display: 'inline-block', background: `${selectedTypeData.color}14`, border: `1px solid ${selectedTypeData.color}30`, borderRadius: 8, padding: '6px 16px', color: selectedTypeData.color, fontSize: 13 }}>
                                                {selectedTypeData.desc}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Notes */}
                                <div style={{ marginBottom: 20 }}>
                                    <label className="input-label">Notes (optional)</label>
                                    <textarea
                                        className="input"
                                        rows={3}
                                        placeholder="E.g. Practice session, match day, specific issue to focus on..."
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>

                                {/* Upload progress */}
                                {uploading && (
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Uploading & Analyzing...</span>
                                            <span style={{ fontSize: 13, color: '#00ff88' }}>{progress}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>
                                )}

                                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                                    onClick={handleUpload} disabled={uploading || !file}>
                                    {uploading ? (
                                        <><Loader size={16} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> Analyzing...</>
                                    ) : (
                                        <><Activity size={16} /> Start AI Analysis</>
                                    )}
                                </button>
                            </>
                        ) : (
                            /* Success state */
                            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                                <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Analysis Started!</h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
                                    Your AI analysis is running. This usually takes 30–90 seconds.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <button className="btn-primary" style={{ justifyContent: 'center' }}
                                        onClick={() => router.push(`/analysis/${uploadedId}`)}>
                                        View Analysis Status
                                    </button>
                                    <button className="btn-ghost" onClick={() => { setFile(null); setUploadedId(null); setProgress(0); }}>
                                        Upload Another
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
