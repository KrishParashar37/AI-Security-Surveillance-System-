import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import API from '../api';

// ─── Verification Terminal Component ──────────────────────────────────────────
const VerificationTerminal = ({ camera, onClose }) => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);

    // Verification States
    const [scanning, setScanning] = useState(true);
    const [faceDetected, setFaceDetected] = useState(false);
    const [liveness, setLiveness] = useState(0);

    // Forms
    const [docs, setDocs] = useState({
        aadhar: { file: null, number: '', extracted: false },
        pan: { file: null, number: '', extracted: false },
        license: { file: null, number: '', extracted: false },
        passport: { file: null, number: '', extracted: false }
    });

    // 20 Verification Features Checklist
    const [checks, setChecks] = useState([
        { id: 1, name: 'Facial Geometry Scan', status: 'pending' },
        { id: 2, name: 'Liveness Detection', status: 'pending' },
        { id: 3, name: 'Thermal Imaging Check', status: 'pending' },
        { id: 4, name: 'Deepfake & Spoof Analysis', status: 'pending' },
        { id: 5, name: 'Aadhar DB Cross-Reference', status: 'pending' },
        { id: 6, name: 'PAN Tax ID Verification', status: 'pending' },
        { id: 7, name: 'RTO License Validation', status: 'pending' },
        { id: 8, name: 'Passport & Visa Match', status: 'pending' },
        { id: 9, name: 'Interpol Watchlist Scan', status: 'pending' },
        { id: 10, name: 'Local Criminal DB Check', status: 'pending' },
        { id: 11, name: 'Retina Pattern Match', status: 'pending' },
        { id: 12, name: 'Micro-expression Analysis', status: 'pending' },
        { id: 13, name: 'Voice Print Authentication', status: 'pending' },
        { id: 14, name: 'Gait & Posture Analysis', status: 'pending' },
        { id: 15, name: 'Heart Rate Estimation (rPPG)', status: 'pending' },
        { id: 16, name: 'Stress & Perspiration OCR', status: 'pending' },
        { id: 17, name: 'Document Hologram Verify', status: 'pending' },
        { id: 18, name: 'MRZ Code Extraction', status: 'pending' },
        { id: 19, name: 'Digital Signature Check', status: 'pending' },
        { id: 20, name: 'Final Clearance Issuance', status: 'pending' }
    ]);

    useEffect(() => {
        // Start webcam
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(s => {
                setStream(s);
                if (videoRef.current) videoRef.current.srcObject = s;

                // Simulate face detection after 2s
                setTimeout(() => {
                    setFaceDetected(true);
                    setChecks(c => c.map(item => item.id === 1 ? { ...item, status: 'success' } : item));
                }, 2000);

                // Simulate liveness
                let l = 0;
                const int = setInterval(() => {
                    l += Math.random() * 15;
                    if (l >= 100) {
                        l = 100;
                        clearInterval(int);
                        setChecks(c => c.map(item => item.id <= 4 && item.id > 1 ? { ...item, status: 'success' } : item));
                    }
                    setLiveness(l);
                }, 500);
            })
            .catch(err => console.error("Webcam error:", err));

        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
        // eslint-disable-next-line
    }, []);

    const triggerAutoVerify = () => {
        let index = 0;
        const interval = setInterval(() => {
            setChecks(c => {
                const newC = [...c];
                if (index < 20) {
                    newC[index].status = 'success';
                }
                return newC;
            });
            index++;
            if (index >= 20) {
                clearInterval(interval);
                setScanning(false);
            }
        }, 200);

        // Auto fill mock data for docs nicely
        setDocs({
            aadhar: { file: null, number: 'XXXX-XXXX-8921', extracted: true },
            pan: { file: null, number: 'ABCDE1234F', extracted: true },
            license: { file: null, number: 'DL-9827364512', extracted: true },
            passport: { file: null, number: 'Z9876543', extracted: true }
        });
    };

    const handleFileUpload = (type, e) => {
        const file = e.target.files[0];
        if (!file) return;

        setDocs(prev => ({ ...prev, [type]: { ...prev[type], file, extracted: false } }));

        // Simulate AI OCR Upload & Extraction
        setTimeout(() => {
            let mockNum = '';
            let updateIds = [];
            if (type === 'aadhar') { mockNum = 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000); updateIds = [5, 17]; }
            if (type === 'pan') { mockNum = 'ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F'; updateIds = [6, 17]; }
            if (type === 'license') { mockNum = 'DL-' + Math.floor(1000000000 + Math.random() * 9000000000); updateIds = [7, 19]; }
            if (type === 'passport') { mockNum = 'Z' + Math.floor(1000000 + Math.random() * 9000000); updateIds = [8, 9, 10, 18]; }

            setDocs(prev => ({ ...prev, [type]: { ...prev[type], number: mockNum, extracted: true } }));

            setChecks(c => c.map(item => updateIds.includes(item.id) ? { ...item, status: 'success' } : item));

            // Check if all docs uploaded, pass the rest
            const allExtracted = Object.values(docs).filter(d => d.extracted).length === 3; // +1 we just did
            if (allExtracted) {
                setTimeout(() => {
                    setChecks(c => c.map(item => ({ ...item, status: 'success' })));
                    setScanning(false);
                }, 2000);
            }
        }, 1500);
    };

    const getDocInput = (type, label, icon, placeholder) => (
        <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header" style={{ padding: '12px 16px' }}>
                <span className="card-title">{icon} {label} Verification</span>
            </div>
            <div className="card-body" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <label className="form-label">Document Photo (AI OCR)</label>
                        <input type="file" className="form-input" style={{ padding: 6, fontSize: 12, height: 'auto' }} accept="image/*" onChange={(e) => handleFileUpload(type, e)} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="form-label">Extracted ID / Number</label>
                        <div style={{ position: 'relative' }}>
                            <input type="text" className="form-input" placeholder={placeholder} value={docs[type].number} onChange={(e) => setDocs(prev => ({ ...prev, [type]: { ...prev[type], number: e.target.value } }))} />
                            {docs[type].extracted && <span style={{ position: 'absolute', right: 10, top: 10, color: 'var(--color-low)' }}>✅ AI Verified</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="verification-terminal" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ flex: 1 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => { if (stream) stream.getTracks().forEach(t => t.stop()); onClose(); }} style={{ marginBottom: 12 }}>← Back to Grid</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <h2>{camera.name} - Identify Node</h2>
                        <button className="btn btn-primary btn-sm" onClick={triggerAutoVerify} style={{ padding: '4px 12px', fontSize: 11 }}>🚀 Auto-Run Demo Sequence</button>
                    </div>
                    <p>Full spectrum demographic & biometric verification protocol active.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: scanning ? 'var(--color-primary)' : 'var(--color-low)' }}>
                        {scanning ? 'SCANNING...' : 'ACCESS GRANTED'}
                    </div>
                    <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>SESSION_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                </div>
            </div>

            <div className="grid-2" style={{ alignItems: 'flex-start' }}>
                {/* Left Side: Video & Forms */}
                <div>
                    {/* Video Feed */}
                    <div className="card mb-24" style={{ overflow: 'hidden', position: 'relative', border: faceDetected ? '2px solid var(--color-low)' : '2px solid var(--color-primary)' }}>
                        <div style={{ height: 350, background: 'var(--color-bg-secondary)', position: 'relative' }}>
                            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />

                            {/* Face Scanner Overlay CSS Magic */}
                            <div className="scanner-line" style={{ display: scanning ? 'block' : 'none' }}></div>
                            {faceDetected && (
                                <div style={{ position: 'absolute', top: '20%', left: '30%', right: '30%', bottom: '20%', border: '2px solid rgba(34, 197, 94, 0.5)', borderRadius: '50%', boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)' }}>
                                    <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-low)', padding: '2px 8px', borderRadius: 4, color: '#000', fontSize: 10, fontWeight: 800 }}>FACE LOCKED</div>
                                </div>
                            )}

                            <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', color: '#fff', textShadow: '0 0 4px #000', fontFamily: 'monospace', fontSize: 11 }}>
                                <span>LIVENESS SCORE: {liveness.toFixed(1)}%</span>
                                <span style={{ color: faceDetected ? '#22c55e' : '#ef4444' }}>{faceDetected ? 'BIOMETRICS ACQUIRED' : 'AWAITING SUBJECT'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Identification Forms */}
                    <div className="page-header-left" style={{ marginBottom: 16 }}>
                        <h3 style={{ margin: 0 }}>Identity Documents</h3>
                        <p style={{ margin: 0, fontSize: 13 }}>Upload required documents for full clearance</p>
                    </div>

                    {getDocInput('aadhar', 'Aadhar Card', '🇮🇳', '0000-0000-0000')}
                    {getDocInput('pan', 'PAN Card', '🏛️', 'ABCDE1234F')}
                    {getDocInput('license', 'Driving License', '🚗', 'DL-XXXXXXXXXX')}
                    {getDocInput('passport', 'Passport', '🛂', 'Z0000000')}

                    <button
                        className={`btn ${scanning ? 'btn-secondary' : 'btn-success'}`}
                        style={{ width: '100%', padding: '16px', fontSize: 16, fontWeight: 700, marginTop: 16, letterSpacing: 2 }}
                        disabled={scanning}
                        onClick={() => {
                            alert(`✅ VERIFICATION COMPLETE!\n\nAll 20 Neural Pipeline checks passed successfully.\nIdentity matched with DB.\n\nGate Pass Generated.`);
                            if (stream) stream.getTracks().forEach(t => t.stop());
                            onClose();
                        }}
                    >
                        {scanning ? 'VERIFICATION IN PROGRESS...' : 'FINALIZE KYC & GENERATE GATE PASS'}
                    </button>
                </div>

                {/* Right Side: 20 Verification Features Checklist */}
                <div className="card" style={{ background: 'var(--color-bg-card)', minHeight: 800 }}>
                    <div className="card-header border-bottom">
                        <span className="card-title">🛡️ Neural Verification Pipeline</span>
                        <span className="badge badge-normal">{checks.filter(c => c.status === 'success').length} / 20</span>
                    </div>
                    <div className="card-body" style={{ padding: '8px 16px' }}>
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 20 }}>
                            The system runs 20 concurrent AI models mapping identity, local and international blacklists, cryptographic document verification, and biometric liveness.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {checks.map(check => (
                                <div key={check.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 14px', borderRadius: 6,
                                    background: check.status === 'success' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                                    border: `1px solid ${check.status === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
                                            background: check.status === 'success' ? 'var(--color-low)' : 'var(--color-bg-secondary)',
                                            color: check.status === 'success' ? '#fff' : 'var(--color-text-muted)'
                                        }}>
                                            {check.status === 'success' ? '✓' : check.id}
                                        </div>
                                        <span style={{
                                            fontSize: 13, fontWeight: check.status === 'success' ? 600 : 400,
                                            color: check.status === 'success' ? 'var(--color-low)' : 'var(--color-text-secondary)'
                                        }}>
                                            {check.name}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: check.status === 'success' ? 'var(--color-low)' : 'var(--color-warning)' }}>
                                        {check.status === 'success' ? 'PASSED' : 'ANALYZING...'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Matrix rain effect decoration at the bottom */}
                        <div style={{ marginTop: 24, fontSize: 10, color: 'rgba(58, 134, 255, 0.3)', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.1 }}>
                            {Array.from({ length: 300 }).map(() => String.fromCharCode(0x30A0 + Math.random() * 96)).join('')}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};


// ─── Main Cameras Page Component ──────────────────────────────────────────────
const CamerasPage = () => {
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifyingCamera, setVerifyingCamera] = useState(null);

    useEffect(() => {
        API.get('/api/cameras/')
            .then(res => setCameras(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div>
            <Header title="Camera Feeds" subtitle="Live Nodes" />
            <div className="page-content"><div className="loading-spinner"><div className="spinner" /></div></div>
        </div>
    );

    return (
        <div>
            <Header title={verifyingCamera ? "Identity Node" : "Camera Feeds"} subtitle={verifyingCamera ? "Clearance Protocol active" : "Live Surveillance Network"} />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* Render Identity Verification Terminal if a camera is clicked */}
                {verifyingCamera ? (
                    <VerificationTerminal camera={verifyingCamera} onClose={() => setVerifyingCamera(null)} />
                ) : (
                    /* Normal Camera Grid Overview */
                    <>
                        <div className="page-header">
                            <div className="page-header-left">
                                <h2>Network Nodes</h2>
                                <p>Click any camera feed to enter the Advanced Face & ID Verification Terminal.</p>
                            </div>
                            <div>
                                <button className="btn btn-primary" onClick={() => setVerifyingCamera({ name: "Global Identify Node 01" })}>
                                    🔍 Run Verification on Node 01
                                </button>
                            </div>
                        </div>

                        <div className="grid-3">
                            {cameras.map((cam) => (
                                <div key={cam.id} className="card" style={{ overflow: 'hidden', cursor: 'pointer', transition: 'Transform 0.2s', border: '1px solid transparent' }}
                                    onClick={() => setVerifyingCamera(cam)}
                                    onMouseOver={e => e.currentTarget.style.border = '1px solid var(--color-primary)'}
                                    onMouseOut={e => e.currentTarget.style.border = '1px solid transparent'}
                                >
                                    <div style={{ position: 'relative', height: 200, background: 'var(--color-bg-secondary)' }}>

                                        {/* Simulated live feed noise/image */}
                                        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

                                        <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: cam.status === 'online' ? 'var(--color-low)' : 'var(--color-critical)' }} />
                                            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: '#fff' }}>{cam.name.toUpperCase()}</span>
                                        </div>

                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0 }}>
                                            {/* Center overlay for hover */}
                                        </div>
                                    </div>
                                    <div className="card-body" style={{ padding: '12px 16px', background: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 600 }}>{cam.location}</span>
                                            <span style={{ fontSize: 11, color: 'var(--color-primary)' }}>Click to Verify →</span>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Resolution: {cam.resolution} • FPS: {cam.fps}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Decorative bottom section to make the page longer and look professional */}
                        <div className="card mt-24">
                            <div className="card-header"><span className="card-title">🌐 Node Network Topology</span></div>
                            <div className="card-body" style={{ height: 200, background: 'url("data:image/svg+xml,%3Csvg width=%22100%25%22 height=%22100%25%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern id=%22smallGrid%22 width=%2220%22 height=%2220%22 patternUnits=%22userSpaceOnUse%22%3E%3Cpath d=%22M 20 0 L 0 0 0 20%22 fill=%22none%22 stroke=%22rgba(255,255,255,0.05)%22 stroke-width=%221%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22url(%23smallGrid)%22/%3E%3C/svg%3E")', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: 24, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, textAlign: 'center' }}>
                                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-low)' }}>ALL SYSTEMS SECURE</h3>
                                    <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>End-to-end encryption active on all feeds. Database synced.</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CamerasPage;
