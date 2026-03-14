import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import API from '../api';

const activityIcons = {
    fighting: '🥊', theft: '🔓', trespassing: '🚫',
    loitering: '⏳', unauthorized_entry: '🚪',
    crowd_violence: '👥', weapon_detected: '⚠️', normal: '✅',
    arson: '🔥', vandalism: '🪓', assault: '👊', explosion: '💥',
    suspicious_package: '📦', vehicle_intrusion: '🚗', drone_detected: '🚁',
    mask_bypass: '😷', cyber_attack: '💻', chemical_hazard: '☣️',
};

const severityColor = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e', info: '#3a86ff' };

const allActivities = [
    { id: 'fighting', label: 'Fighting', icon: '🥊', color: '#ef4444' },
    { id: 'theft', label: 'Theft', icon: '🔓', color: '#f97316' },
    { id: 'trespassing', label: 'Trespassing', icon: '🚫', color: '#eab308' },
    { id: 'loitering', label: 'Loitering', icon: '⏳', color: '#94a3b8' },
    { id: 'unauthorized_entry', label: 'Unauth. Entry', icon: '🚪', color: '#f97316' },
    { id: 'crowd_violence', label: 'Crowd Violence', icon: '👥', color: '#ef4444' },
    { id: 'weapon_detected', label: 'Weapon', icon: '⚠️', color: '#ef4444' },
    { id: 'arson', label: 'Arson', icon: '🔥', color: '#ef4444' },
    { id: 'vandalism', label: 'Vandalism', icon: '🪓', color: '#eab308' },
    { id: 'assault', label: 'Assault', icon: '👊', color: '#ef4444' },
];

const DetectionPage = () => {
    const [detections, setDetections] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState('cam_001');
    const [isSimulating, setIsSimulating] = useState(false);
    const [terminalLogs, setTerminalLogs] = useState([
        { time: new Date().toLocaleTimeString(), msg: 'SYSTEM BOOT: AI Detection Engine v4.2.1 initialized.', color: '#22c55e' },
        { time: new Date().toLocaleTimeString(), msg: 'STATUS: All 18 AI models loaded. YOLO v8 active.', color: '#3a86ff' },
        { time: new Date().toLocaleTimeString(), msg: 'AWAITING: Input stream from cameras...', color: '#94a3b8' },
    ]);
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [filterActivity, setFilterActivity] = useState('all');
    const [scanMode, setScanMode] = useState('standard');
    const [alertThreshold, setAlertThreshold] = useState(70);
    const [activeModels, setActiveModels] = useState(['yolo', 'resnet', 'faceId']);
    const [panelLocked, setPanelLocked] = useState(false);
    const [nightVision, setNightVision] = useState(false);
    const [gridView, setGridView] = useState(false);
    const [muteAlerts, setMuteAlerts] = useState(false);
    const [autoExport, setAutoExport] = useState(false);
    const [encryptLogs, setEncryptLogs] = useState(false);
    const [stats, setStats] = useState({ total: 0, suspicious: 0, cleared: 0, critical: 0 });
    const intervalRef = useRef(null);
    const terminalRef = useRef(null);

    const cameras = ['cam_001', 'cam_002', 'cam_003', 'cam_004', 'cam_005', 'cam_006'];

    const addLog = (msg, color = '#94a3b8') => {
        const entry = { time: new Date().toLocaleTimeString(), msg, color };
        setTerminalLogs(prev => [...prev.slice(-49), entry]);
        setTimeout(() => {
            if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }, 50);
    };

    useEffect(() => {
        return () => clearInterval(intervalRef.current);
    }, []);

    const toggleSimulation = () => {
        if (isSimulating) {
            clearInterval(intervalRef.current);
            setIsSimulating(false);
            addLog('SIMULATION STOPPED by operator.', '#eab308');
        } else {
            setIsSimulating(true);
            addLog(`SIMULATION STARTED → Camera: ${selectedCamera.toUpperCase()} | Mode: ${scanMode.toUpperCase()}`, '#22c55e');
            const run = () => API.get(`/api/detection/simulate/${selectedCamera}`)
                .then(r => {
                    setDetections(prev => [r.data, ...prev].slice(0, 100));
                    setStats(s => ({
                        total: s.total + 1,
                        suspicious: s.suspicious + (r.data.is_suspicious ? 1 : 0),
                        cleared: s.cleared + (!r.data.is_suspicious ? 1 : 0),
                        critical: s.critical + (r.data.severity === 'critical' ? 1 : 0),
                    }));
                    if (r.data.is_suspicious && !muteAlerts) {
                        addLog(`⚠ ALERT: ${r.data.activity_type.replace(/_/g, ' ').toUpperCase()} detected on ${r.data.camera_id} [${(r.data.confidence * 100).toFixed(0)}% confidence]`, severityColor[r.data.severity] || '#ef4444');
                    }
                })
                .catch(() => { });
            run();
            intervalRef.current = setInterval(run, 2000);
        }
    };

    const runSingleFrame = () => {
        addLog(`SINGLE FRAME ANALYSIS → ${selectedCamera.toUpperCase()}`, '#3a86ff');
        API.get(`/api/detection/simulate/${selectedCamera}`)
            .then(r => {
                setDetections(prev => [r.data, ...prev].slice(0, 100));
                setStats(s => ({ total: s.total + 1, suspicious: s.suspicious + (r.data.is_suspicious ? 1 : 0), cleared: s.cleared + (!r.data.is_suspicious ? 1 : 0), critical: s.critical + (r.data.severity === 'critical' ? 1 : 0) }));
                addLog(`RESULT: ${r.data.activity_type.replace(/_/g, ' ').toUpperCase()} | Conf: ${(r.data.confidence * 100).toFixed(0)}% | Sev: ${r.data.severity?.toUpperCase()}`, severityColor[r.data.severity] || '#22c55e');
            })
            .catch(() => addLog('ERROR: Frame analysis failed.', '#ef4444'));
    };

    const fireActionButton = (label, color = '#3a86ff', msg = null) => {
        addLog(msg || `ACTION: [${label}] executed by operator.`, color);
    };

    const toggleModel = (model) => {
        setActiveModels(prev =>
            prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]
        );
        addLog(`MODEL TOGGLE: ${model.toUpperCase()} ${activeModels.includes(model) ? 'DISABLED' : 'ENABLED'}`, '#8b5cf6');
    };

    const clearHistory = () => { setDetections([]); setStats({ total: 0, suspicious: 0, cleared: 0, critical: 0 }); addLog('LOG CLEARED by operator.', '#eab308'); };

    const exportLogs = () => {
        const data = JSON.stringify(detections, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `detection_log_${Date.now()}.json`; a.click();
        addLog('EXPORT: Detection log saved to disk.', '#22c55e');
    };

    const filteredDetections = detections.filter(d =>
        (filterSeverity === 'all' || d.severity === filterSeverity) &&
        (filterActivity === 'all' || d.activity_type === filterActivity)
    );

    const aiModels = [
        { id: 'yolo', label: 'YOLO v8', icon: '🎯' },
        { id: 'resnet', label: 'ResNet-50', icon: '🧠' },
        { id: 'faceId', label: 'Face ID', icon: '👤' },
        { id: 'thermal', label: 'Thermal AI', icon: '🌡️' },
        { id: 'anomaly', label: 'Anomaly Net', icon: '📊' },
        { id: 'weapon', label: 'Weapon Det.', icon: '🔫' },
    ];

    return (
        <div>
            <Header title="Detection Log" subtitle="AI Analysis Engine v4.2.1" />
            <div className="page-content">

                {/* ─── Page Header ─── */}
                <div className="page-header">
                    <div className="page-header-left">
                        <h2>🤖 AI Detection Engine</h2>
                        <p>Real-time frame analysis, multi-model AI pipeline, and threat classification</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => fireActionButton('Refresh Status', '#3a86ff', 'STATUS REFRESH: All systems checked.')}>🔄 Refresh</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setNightVision(v => !v); addLog(`NIGHT VISION: ${nightVision ? 'OFF' : 'ON'}`, '#8b5cf6'); }}>
                            {nightVision ? '☀️ Day Mode' : '🌙 Night Vision'}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setGridView(v => !v); addLog(`VIEW: Switched to ${gridView ? 'List' : 'Grid'} mode`, '#3a86ff'); }}>
                            {gridView ? '📋 List View' : '⊞ Grid View'}
                        </button>
                        <button className={`btn btn-sm ${panelLocked ? 'btn-danger' : 'btn-secondary'}`} onClick={() => { setPanelLocked(v => !v); addLog(`PANEL ${panelLocked ? 'UNLOCKED' : 'LOCKED'} by operator.`, '#eab308'); }}>
                            {panelLocked ? '🔒 Locked' : '🔓 Unlocked'}
                        </button>
                    </div>
                </div>

                {/* ─── Stats Row ─── */}
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 }}>
                    {[
                        { label: 'Total Detections', val: stats.total, icon: '📡', cls: 'primary' },
                        { label: 'Suspicious Events', val: stats.suspicious, icon: '⚠️', cls: 'warning' },
                        { label: 'Cleared Events', val: stats.cleared, icon: '✅', cls: 'success' },
                        { label: 'Critical Alerts', val: stats.critical, icon: '🚨', cls: 'danger' },
                    ].map((s, i) => (
                        <div key={i} className="stat-card">
                            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                            <div className="stat-info">
                                <div className="stat-value">{s.val}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── Main Panel: Controls + Terminal ─── */}
                <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, marginBottom: 16 }}>

                    {/* LEFT: Controls Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                        {/* Simulation Controls */}
                        <div className="card">
                            <div className="card-header"><span className="card-title">🎛️ Simulation Controls</span></div>
                            <div className="card-body" style={{ padding: '14px' }}>
                                <div className="form-group">
                                    <label className="form-label">Camera Feed</label>
                                    <select id="camera-select" className="form-input" value={selectedCamera}
                                        onChange={e => { setSelectedCamera(e.target.value); if (isSimulating) { clearInterval(intervalRef.current); setIsSimulating(false); addLog(`CAMERA SWITCHED → ${e.target.value.toUpperCase()}`, '#eab308'); } }}>
                                        {cameras.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Scan Mode</label>
                                    <select className="form-input" value={scanMode} onChange={e => { setScanMode(e.target.value); addLog(`SCAN MODE: ${e.target.value.toUpperCase()} activated`, '#3a86ff'); }}>
                                        <option value="standard">Standard</option>
                                        <option value="deep">Deep Analysis</option>
                                        <option value="realtime">Real-time Burst</option>
                                        <option value="stealth">Stealth Mode</option>
                                        <option value="forensic">Forensic Capture</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Alert Threshold: {alertThreshold}%</label>
                                    <input type="range" min={10} max={99} value={alertThreshold}
                                        style={{ width: '100%', accentColor: '#3a86ff' }}
                                        onChange={e => { setAlertThreshold(+e.target.value); addLog(`THRESHOLD SET: ${e.target.value}% confidence required.`, '#8b5cf6'); }} />
                                </div>

                                <button id="simulate-btn"
                                    className={`btn ${isSimulating ? 'btn-danger' : 'btn-primary'}`}
                                    style={{ width: '100%', marginBottom: 8 }}
                                    onClick={toggleSimulation}>
                                    {isSimulating ? '⏹ Stop Live Simulation' : '▶ Start Live Simulation'}
                                </button>
                                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={runSingleFrame}>
                                    🔍 Single Frame Analysis
                                </button>
                            </div>
                        </div>

                        {/* AI Models Panel */}
                        <div className="card">
                            <div className="card-header"><span className="card-title">🧠 AI Model Selector</span></div>
                            <div style={{ padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                {aiModels.map(m => (
                                    <button key={m.id}
                                        onClick={() => toggleModel(m.id)}
                                        style={{
                                            padding: '8px 6px', borderRadius: 6, border: `1px solid ${activeModels.includes(m.id) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                            background: activeModels.includes(m.id) ? 'rgba(58,134,255,0.15)' : 'var(--color-bg-secondary)',
                                            color: activeModels.includes(m.id) ? '#3a86ff' : '#64748b',
                                            cursor: 'pointer', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                                            display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                        }}>
                                        {m.icon} {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Toggle Options */}
                        <div className="card">
                            <div className="card-header"><span className="card-title">⚙️ System Toggles</span></div>
                            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { label: '🔇 Mute Alerts', state: muteAlerts, fn: () => { setMuteAlerts(v => !v); addLog(`ALERTS: ${muteAlerts ? 'Unmuted' : 'Muted'}`, '#eab308'); } },
                                    { label: '💾 Auto Export', state: autoExport, fn: () => { setAutoExport(v => !v); addLog(`AUTO EXPORT: ${autoExport ? 'OFF' : 'ON'}`, '#22c55e'); } },
                                    { label: '🔐 Encrypt Logs', state: encryptLogs, fn: () => { setEncryptLogs(v => !v); addLog(`LOG ENCRYPTION: ${encryptLogs ? 'OFF' : 'ON'}`, '#8b5cf6'); } },
                                    { label: '🌙 Night Vision', state: nightVision, fn: () => { setNightVision(v => !v); addLog(`NIGHT VISION: ${nightVision ? 'OFF' : 'ON'}`, '#8b5cf6'); } },
                                    { label: '⊞ Grid View', state: gridView, fn: () => { setGridView(v => !v); addLog(`VIEW: ${gridView ? 'List' : 'Grid'} mode`, '#3a86ff'); } },
                                ].map((opt, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#94a3b8' }}>
                                        <span>{opt.label}</span>
                                        <div onClick={opt.fn} style={{
                                            width: 38, height: 20, borderRadius: 10, cursor: 'pointer', transition: 'all 0.3s',
                                            background: opt.state ? 'var(--color-primary)' : 'var(--color-border)',
                                            position: 'relative', border: `1px solid ${opt.state ? 'var(--color-primary)' : 'var(--color-border)'}`
                                        }}>
                                            <div style={{
                                                position: 'absolute', top: 2, left: opt.state ? 18 : 2,
                                                width: 14, height: 14, borderRadius: '50%',
                                                background: opt.state ? '#fff' : '#64748b', transition: 'left 0.3s'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Terminal + Latest Detection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                        {/* Latest Detection */}
                        <div className="card">
                            <div className="card-header">
                                <span className="card-title">📡 Latest Detection</span>
                                {isSimulating && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#ef4444', fontWeight: 700 }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', animation: 'blink 1s infinite' }} />LIVE</div>}
                            </div>
                            <div className="card-body">
                                {detections[0] ? (
                                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                        <div style={{ fontSize: 56 }}>{activityIcons[detections[0].activity_type] || '🔍'}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 22, fontWeight: 800, color: detections[0].is_suspicious ? '#ef4444' : '#22c55e', marginBottom: 4 }}>
                                                {detections[0].activity_type.replace(/_/g, ' ').toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>{detections[0].camera_id?.toUpperCase()} • Frame #{detections[0].frame_id} • {new Date(detections[0].timestamp).toLocaleTimeString()}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                                <span style={{ fontSize: 12, color: '#94a3b8' }}>Confidence</span>
                                                <div style={{ flex: 1, height: 8, background: 'var(--color-border)', borderRadius: 4, overflow: 'hidden' }}>
                                                    <div style={{ width: `${detections[0].confidence * 100}%`, height: '100%', background: 'linear-gradient(90deg,#3a86ff,#8b5cf6)', borderRadius: 4, transition: 'width 0.4s' }} />
                                                </div>
                                                <span style={{ fontWeight: 700, color: '#3a86ff', fontSize: 13 }}>{(detections[0].confidence * 100).toFixed(1)}%</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                <span className={`badge badge-${detections[0].severity === 'critical' ? 'critical' : detections[0].severity === 'high' ? 'high' : detections[0].severity === 'medium' ? 'medium' : 'low'}`}>{detections[0].severity?.toUpperCase()}</span>
                                                {detections[0].objects_detected?.map((obj, j) => <span key={j} className="badge badge-normal">{obj}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ padding: 32, textAlign: 'center', color: '#4a5568' }}>
                                        <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                                        <p>Start simulation to see detections</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Terminal */}
                        <div className="card" style={{ flex: 1 }}>
                            <div className="card-header">
                                <span className="card-title">💻 System Terminal</span>
                                <button className="btn btn-secondary btn-sm" onClick={() => setTerminalLogs([])}>Clear</button>
                            </div>
                            <div ref={terminalRef} style={{
                                height: 200, overflowY: 'auto', padding: '10px 14px',
                                fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                                background: 'var(--color-bg-secondary)', borderRadius: '0 0 12px 12px', borderTop: '1px solid var(--color-border)'
                            }}>
                                {terminalLogs.map((log, i) => (
                                    <div key={i} style={{ color: log.color, marginBottom: 3, lineHeight: 1.5 }}>
                                        <span style={{ color: '#4a5568', marginRight: 8 }}>[{log.time}]</span>{log.msg}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── 40 ACTION BUTTONS ─── */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-header"><span className="card-title">🎮 Detection Command Center — 40 Operations</span></div>
                    <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
                        {[
                            // DETECTION CONTROLS
                            { id: 'b01', label: '🔴 Trigger Alert', color: '#ef4444', msg: 'MANUAL ALERT: Triggered by operator.', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)' },
                            { id: 'b02', label: '🟢 Mark Safe', color: '#22c55e', msg: 'ZONE MARKED: Safe by operator.', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.35)' },
                            { id: 'b03', label: '📸 Snapshot', color: '#3a86ff', msg: 'SNAPSHOT: Frame captured and saved.', bg: 'rgba(58,134,255,0.1)', border: 'rgba(58,134,255,0.35)' },
                            { id: 'b04', label: '🎬 Start Recording', color: '#f97316', msg: 'RECORDING: Started on active camera.', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.35)' },
                            { id: 'b05', label: '⏹ Stop Recording', color: '#64748b', msg: 'RECORDING: Stopped.', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)' },
                            { id: 'b06', label: '🔀 Switch Camera', color: '#8b5cf6', msg: 'CAMERA: Cycling to next feed.', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.35)' },
                            { id: 'b07', label: '🔍 Deep Scan', color: '#06b6d4', msg: 'DEEP SCAN: Full frame AI analysis started.', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.35)' },
                            { id: 'b08', label: '⚡ EMP Burst', color: '#eab308', msg: 'EMP BURST: Electronic countermeasure deployed.', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.35)' },
                            { id: 'b09', label: '🔒 Lockdown', color: '#ef4444', msg: 'LOCKDOWN: All perimeter gates sealed.', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)' },
                            { id: 'b10', label: '🔓 Release Lock', color: '#22c55e', msg: 'LOCKDOWN RELEASED: Gates reopened.', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.35)' },
                            // AI MODEL OPS
                            { id: 'b11', label: '🧠 Reload Models', color: '#8b5cf6', msg: 'AI MODELS: Reloading all neural weights...', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.35)' },
                            { id: 'b12', label: '🎯 Calibrate YOLO', color: '#3a86ff', msg: 'YOLO v8: Recalibrating bounding box anchors.', bg: 'rgba(58,134,255,0.1)', border: 'rgba(58,134,255,0.35)' },
                            { id: 'b13', label: '👤 Face DB Sync', color: '#06b6d4', msg: 'FACEID DB: Syncing with central biometric database.', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.35)' },
                            { id: 'b14', label: '🌡️ Thermal Cal.', color: '#f97316', msg: 'THERMAL: Sensor calibration complete. Baseline set.', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.35)' },
                            { id: 'b15', label: '📊 Anomaly Reset', color: '#eab308', msg: 'ANOMALY NET: Baseline behavior model reset.', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.35)' },
                            { id: 'b16', label: '🔫 Weapon Net', color: '#ef4444', msg: 'WEAPON DETECT: Running fine-tune pass on dataset.', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)' },
                            { id: 'b17', label: '🛰️ Sat. Overlay', color: '#8b5cf6', msg: 'SATELLITE: Geospatial overlay activated.', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.35)' },
                            { id: 'b18', label: '🚁 Drone Track', color: '#3a86ff', msg: 'DRONE TRACK: Autonomous pursuit protocol enabled.', bg: 'rgba(58,134,255,0.1)', border: 'rgba(58,134,255,0.35)' },
                            { id: 'b19', label: '📡 Radar Sweep', color: '#22c55e', msg: 'RADAR SWEEP: 360° perimeter scan initiated.', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.35)' },
                            { id: 'b20', label: '🔊 Siren Test', color: '#eab308', msg: 'SIREN: Audible alert test triggered.', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.35)' },
                            // LOGGING & REPORTING
                            { id: 'b21', label: '💾 Export JSON', color: '#22c55e', fn: exportLogs, bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.35)' },
                            { id: 'b22', label: '🗑️ Clear Logs', color: '#ef4444', fn: clearHistory, bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)' },
                            { id: 'b23', label: '📋 Copy Report', color: '#3a86ff', msg: 'REPORT: Detection summary copied to clipboard.', bg: 'rgba(58,134,255,0.1)', border: 'rgba(58,134,255,0.35)' },
                            { id: 'b24', label: '🔐 Encrypt Logs', color: '#8b5cf6', msg: 'ENCRYPTION: AES-256 applied to stored logs.', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.35)' },
                            { id: 'b25', label: '📤 Upload Cloud', color: '#06b6d4', msg: 'CLOUD SYNC: Uploading detection data to secure vault.', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.35)' },
                            { id: 'b26', label: '📈 Show Analytics', color: '#eab308', msg: 'ANALYTICS: Generating threat trend report.', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.35)' },
                            { id: 'b27', label: '🏷️ Tag Event', color: '#f97316', msg: 'TAGGING: Current event flagged for review.', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.35)' },
                            { id: 'b28', label: '📨 Email Report', color: '#22c55e', msg: 'EMAIL: Threat summary sent to security team.', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.35)' },
                            { id: 'b29', label: '⏪ Rewind Feed', color: '#64748b', msg: 'PLAYBACK: Rewinding camera buffer 60 seconds.', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)' },
                            { id: 'b30', label: '⏩ Fast Forward', color: '#64748b', msg: 'PLAYBACK: Fast forward activated.', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)' },
                            // RESPONSE PROTOCOLS
                            { id: 'b31', label: '🚔 Dispatch Unit', color: '#3a86ff', msg: 'DISPATCH: Security unit Alpha deployed to zone.', bg: 'rgba(58,134,255,0.1)', border: 'rgba(58,134,255,0.35)' },
                            { id: 'b32', label: '🚒 Fire Response', color: '#ef4444', msg: 'FIRE RESPONSE: Fire unit notified. Sprinklers armed.', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)' },
                            { id: 'b33', label: '🏥 Medical Alert', color: '#22c55e', msg: 'MEDICAL: First responders alerted to location.', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.35)' },
                            { id: 'b34', label: '🧱 Seal Zone', color: '#eab308', msg: 'ZONE SEALED: Blast doors and barriers closed.', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.35)' },
                            { id: 'b35', label: '🏃 Evacuate Area', color: '#f97316', msg: 'EVACUATION: PA announcement triggered. Routes open.', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.35)' },
                            { id: 'b36', label: '⛔ No-Fly Zone', color: '#8b5cf6', msg: 'NO-FLY: Airspace restriction activated over sector.', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.35)' },
                            { id: 'b37', label: '🌐 Network Block', color: '#ef4444', msg: 'NETWORK: Cyber isolation protocol enacted.', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)' },
                            { id: 'b38', label: '🔋 Backup Power', color: '#eab308', msg: 'POWER: Switching to backup generator grid.', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.35)' },
                            { id: 'b39', label: '📻 Open Comms', color: '#22c55e', msg: 'COMMS: All-channel broadcast enabled.', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.35)' },
                            { id: 'b40', label: '🛑 Emergency Stop', color: '#ef4444', msg: 'EMERGENCY STOP: All active operations halted.', bg: 'rgba(239,68,68,0.15)', border: '#ef4444',
                                fn: () => { clearInterval(intervalRef.current); setIsSimulating(false); addLog('🛑 EMERGENCY STOP: All systems halted by operator!', '#ef4444'); }
                            },
                        ].map(btn => (
                            <button key={btn.id} id={btn.id}
                                onClick={() => btn.fn ? btn.fn() : fireActionButton(btn.label, btn.color, btn.msg)}
                                style={{
                                    padding: '10px 8px', borderRadius: 8,
                                    border: `1px solid ${btn.border || 'var(--color-border)'}`,
                                    background: btn.bg || 'var(--color-bg-secondary)',
                                    color: btn.color || '#94a3b8',
                                    cursor: 'pointer', fontSize: 11, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.04em',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    transition: 'all 0.2s',
                                    textAlign: 'center', lineHeight: 1.4,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${btn.color}40`; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── Filters for History ─── */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-header">
                        <span className="card-title">🔎 Detection History Filters</span>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {['all', 'critical', 'high', 'medium', 'low'].map(sev => (
                                <button key={sev}
                                    onClick={() => { setFilterSeverity(sev); addLog(`FILTER: Severity → ${sev.toUpperCase()}`, '#3a86ff'); }}
                                    className={`btn btn-sm ${filterSeverity === sev ? 'btn-primary' : 'btn-secondary'}`}>
                                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                                </button>
                            ))}
                            <select className="form-input" style={{ padding: '4px 10px', fontSize: 12, height: 32, width: 'auto' }}
                                value={filterActivity} onChange={e => { setFilterActivity(e.target.value); addLog(`FILTER: Activity → ${e.target.value}`, '#3a86ff'); }}>
                                <option value="all">All Activities</option>
                                {allActivities.map(a => <option key={a.id} value={a.id}>{a.icon} {a.label}</option>)}
                            </select>
                            <button className="btn btn-secondary btn-sm" onClick={clearHistory}>🗑️ Clear All</button>
                            <button className="btn btn-secondary btn-sm" onClick={exportLogs}>💾 Export</button>
                        </div>
                    </div>
                </div>

                {/* ─── Detection History Table ─── */}
                {filteredDetections.length > 0 ? (
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">📋 Detection Log ({filteredDetections.length} events)</span>
                        </div>
                        {gridView ? (
                            // Grid View
                            <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
                                {filteredDetections.map((det, i) => (
                                    <div key={i} style={{
                                        background: 'var(--color-bg-secondary)', border: `1px solid var(--color-border)`,
                                        borderRadius: 8, padding: '12px 14px'
                                    }}>
                                        <div style={{ fontSize: 28, marginBottom: 6 }}>{activityIcons[det.activity_type] || '🔍'}</div>
                                        <div style={{ fontWeight: 700, fontSize: 12, color: '#e2e8f0', marginBottom: 3 }}>
                                            {det.activity_type.replace(/_/g, ' ').toUpperCase()}
                                        </div>
                                        <div style={{ fontSize: 10, color: '#64748b', marginBottom: 6 }}>{det.camera_id?.toUpperCase()}</div>
                                        <span className={`badge badge-${det.severity === 'critical' ? 'critical' : det.severity === 'high' ? 'high' : det.severity === 'medium' ? 'medium' : 'low'}`}>{det.severity}</span>
                                        <div style={{ fontSize: 10, color: '#3a86ff', marginTop: 6, fontFamily: 'monospace' }}>{(det.confidence * 100).toFixed(0)}% conf</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Table View
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th><th>Activity</th><th>Camera</th>
                                            <th>Objects</th><th>Confidence</th><th>Severity</th><th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDetections.map((det, i) => (
                                            <tr key={i} style={{ background: i === 0 && det.is_suspicious ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                                                <td style={{ fontFamily: 'monospace', color: '#4a5568', fontSize: 11 }}>{i + 1}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span>{activityIcons[det.activity_type] || '🔍'}</span>
                                                        <span style={{ fontWeight: 600, color: det.is_suspicious ? '#e2e8f0' : '#64748b', fontSize: 12 }}>
                                                            {det.activity_type.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{det.camera_id}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                        {det.objects_detected?.map((obj, j) => <span key={j} className="badge badge-normal" style={{ fontSize: 10 }}>{obj}</span>)}
                                                    </div>
                                                </td>
                                                <td><span style={{ fontWeight: 700, color: '#3a86ff', fontFamily: 'monospace', fontSize: 12 }}>{(det.confidence * 100).toFixed(0)}%</span></td>
                                                <td><span className={`badge badge-${det.severity === 'critical' ? 'critical' : det.severity === 'high' ? 'high' : det.severity === 'medium' ? 'medium' : 'low'}`}>{det.severity}</span></td>
                                                <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#4a5568' }}>{new Date(det.timestamp).toLocaleTimeString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="card" style={{ textAlign: 'center', padding: 40, color: '#4a5568' }}>
                        <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
                        <p>No detections match your current filters. Start simulation or adjust filters above.</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DetectionPage;
