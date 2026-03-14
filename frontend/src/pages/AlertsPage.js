import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { rtdb } from '../firebase';
import { ref, onValue, set, push } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

// ─── Web Audio API Sound Generator ──────────────────────────────────────────
const playUniqueSound = (profile) => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        switch (profile) {
            case 'police':
                osc.type = 'square';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.setValueAtTime(1000, now + 0.2);
                osc.frequency.setValueAtTime(800, now + 0.4);
                osc.frequency.setValueAtTime(1000, now + 0.6);
                gain.gain.setValueAtTime(0.1, now);
                osc.start(now);
                osc.stop(now + 0.8);
                break;
            case 'sonar':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, now);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
                osc.start(now);
                osc.stop(now + 1.5);
                break;
            case 'air_raid':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(800, now + 1.5);
                osc.frequency.linearRampToValueAtTime(300, now + 3);
                gain.gain.setValueAtTime(0.15, now);
                osc.start(now);
                osc.stop(now + 3);
                break;
            case 'laser':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1500, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
                gain.gain.setValueAtTime(0.2, now);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case 'nuclear':
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, now);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.setValueAtTime(0, now + 0.2);
                gain.gain.setValueAtTime(0.2, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.6);
                break;
            case 'buzzer':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                gain.gain.setValueAtTime(0.4, now);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            case 'chime':
            default:
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
                osc.start(now);
                osc.stop(now + 1);
                break;
        }
    } catch (e) {
        console.error("Audio Web API not supported", e);
    }
};

// ─── Generative Mock Alerts (40 Unique Alerts) ──────────────────────────────
const generateMockAlerts = () => {
    const alerts = [];
    const types = [
        { type: 'Perimeter Breach', icon: '🚧', severity: 'CRITICAL', color: '#ff003c', sound: 'air_raid' },
        { type: 'Unauthorized Access', icon: '🚪', severity: 'HIGH', color: '#ff4d00', sound: 'police' },
        { type: 'Weapon Detected', icon: '🔫', severity: 'CRITICAL', color: '#e60000', sound: 'nuclear' },
        { type: 'Facial Match Failed', icon: '👤', severity: 'MEDIUM', color: '#ffaa00', sound: 'buzzer' },
        { type: 'Thermal Anomaly (Fire)', icon: '🔥', severity: 'CRITICAL', color: '#ff2a00', sound: 'air_raid' },
        { type: 'VIP Escort Required', icon: '⭐', severity: 'INFO', color: '#00ccff', sound: 'chime' },
        { type: 'Drone Intercepted', icon: '🚁', severity: 'HIGH', color: '#cc00ff', sound: 'laser' },
        { type: 'Cyber-Physical Intrusion', icon: '💻', severity: 'CRITICAL', color: '#ff0055', sound: 'nuclear' },
        { type: 'Toxic Gas Detected', icon: '☣️', severity: 'CRITICAL', color: '#99ff00', sound: 'sonar' },
        { type: 'Suspicious Package', icon: '📦', severity: 'HIGH', color: '#ff6600', sound: 'police' },
    ];

    const locations = ['North Gate', 'Server Room Alpha', 'Executive Lobby', 'Loading Dock 4', 'Underground Parking', 'Roof Helipad', 'Chemical Storage', 'Vault', 'Sector 7G'];

    for (let i = 0; i < 40; i++) {
        const t = types[i % types.length];
        alerts.push({
            id: `ALRT-${1000 + i}-${Math.floor(Math.random() * 900)}`,
            time: new Date(Date.now() - Math.random() * 86400000).toLocaleTimeString(),
            type: t.type,
            location: locations[Math.floor(Math.random() * locations.length)],
            severity: t.severity,
            color: t.color,
            icon: t.icon,
            sound: t.sound,
            status: i < 5 ? 'ACTIVE' : 'RESOLVED',
            confidence: (Math.random() * 20 + 80).toFixed(1)
        });
    }
    return alerts;
};

const AlertsPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [selectedAlert, setSelectedAlert] = useState(null);

    // 30 Feature States
    const [defcon, setDefcon] = useState(3);
    const [lockdown, setLockdown] = useState(false);
    const [droneDeployed, setDroneDeployed] = useState(false);
    const [dispatch, setDispatch] = useState({ police: false, fire: false, ems: false });
    const [paBroadcast, setPaBroadcast] = useState(false);
    const [networkIsolated, setNetworkIsolated] = useState(false);
    const [satelliteRotation, setSatelliteRotation] = useState(0);
    const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
    const [mapZoom, setMapZoom] = useState(1);
    const [isDraggingMap, setIsDraggingMap] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [heatmapData, setHeatmapData] = useState(Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, threat: Math.random() * 100, anomaly: Math.random() * 50 })));
    const { user } = useAuth();

    const handleMapMouseDown = (e) => {
        setIsDraggingMap(true);
        setDragStart({ x: e.clientX - mapPan.x, y: e.clientY - mapPan.y });
    };
    const handleMapMouseMove = (e) => {
        if (!isDraggingMap) return;
        setMapPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };
    const handleMapMouseUpOrLeave = () => {
        setIsDraggingMap(false);
    };

    // ─── Firebase Alert Integration ───
    useEffect(() => {
        setAlerts(generateMockAlerts());
        
        // Listen for shared alerts from Firebase
        const alertsRef = ref(rtdb, 'shared_alerts');
        const unsubscribe = onValue(alertsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const firebaseAlerts = Object.values(data).reverse();
                setAlerts(prev => {
                    // Filter duplicates and merge
                    const existingIds = new Set(prev.map(a => a.id));
                    const newAlerts = firebaseAlerts.filter(a => !existingIds.has(a.id));
                    return [...newAlerts, ...prev].slice(0, 100);
                });
            }
        });

        return () => unsubscribe();
    }, []);

    const handleAlertClick = (alert) => {
        setSelectedAlert(alert);
        playUniqueSound(alert.sound);
        
        // Share this interaction to Firebase (Real-time Broadcast)
        const interactionRef = ref(rtdb, 'active_investigations/' + alert.id);
        set(interactionRef, {
            investigator: user?.email || 'Anonymous',
            timestamp: Date.now(),
            alertType: alert.type
        });
    };

    const shareAlertToFirebase = async (alert) => {
        try {
            const newAlertRef = push(ref(rtdb, 'shared_alerts'));
            await set(newAlertRef, {
                ...alert,
                sharedBy: user?.email || 'Admin',
                sharedAt: Date.now(),
                isShared: true
            });
            alert("✅ ALERT BROADCASTED TO ALL OPERATORS");
        } catch (e) {
            console.error("Firebase Share Error:", e);
        }
    };

    const handleLockdown = () => {
        setLockdown(!lockdown);
        if (!lockdown) {
            playUniqueSound('nuclear');
            setDefcon(1);
        } else {
            setDefcon(3);
        }
    };

    const interactiveBtnStyle = (active, color) => ({
        background: active ? color : 'var(--color-bg-secondary)',
        color: active ? '#fff' : 'var(--color-text-primary)',
        border: `1px solid ${active ? color : 'var(--color-border)'}`,
        padding: '12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s',
        boxShadow: active ? `0 0 15px ${color}` : 'none',
        fontWeight: 700, fontSize: 13, flex: 1, textAlign: 'center'
    });

    return (
        <div>
            <Header title="Alert Command Center" subtitle="Advanced Threat Management" />
            <div className="page-content" style={{ paddingBottom: 150 }}>

                {/* PAGE HEADER */}
                <div className="page-header" style={{ marginBottom: 30 }}>
                    <div className="page-header-left">
                        <h2 style={{ textShadow: lockdown ? '0 0 20px #ff0000' : 'none', color: lockdown ? '#ff0000' : 'inherit' }}>
                            {lockdown ? '🚨 FACILITY WIDE LOCKDOWN INITIATED 🚨' : 'Multi-Vector Threat Intelligence Grid'}
                        </h2>
                        <p>Managing {alerts.filter(a => a.status === 'ACTIVE').length} Active Threats • 40 Incident Signatures Detected</p>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        {/* Feature 1: Global Threat Level (DEFCON) */}
                        <div style={{ background: '#000', padding: '10px 20px', border: `2px solid ${defcon === 1 ? '#ff0000' : defcon <= 3 ? '#ffaa00' : '#00ff00'}`, borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>THREAT STATUS</div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: defcon === 1 ? '#ff0000' : defcon <= 3 ? '#ffaa00' : '#00ff00' }}>DEFCON {defcon}</div>
                        </div>
                    </div>
                </div>

                {/* ─── 30 UNIQUE FEATURES DASHBOARD PANELS ─── */}
                <div className="grid-3 mb-24" style={{ gap: 24 }}>

                    {/* F2: Lockdown & F12: Network Isolation */}
                    <div className="card" style={{ borderColor: lockdown ? '#ff0000' : 'var(--color-border)', position: 'relative', overflow: 'hidden' }}>
                        <div className="card-header"><span className="card-title">🛡️ Critical Overrides (Master Keys)</span></div>
                        <div className="card-body flex flex-col gap-12">
                            <button style={interactiveBtnStyle(lockdown, '#ff0000')} onClick={handleLockdown}>
                                {lockdown ? '🔓 REVOKE LOCKDOWN' : '🔒 INITIATE PROTOCOL OMEGA (LOCKDOWN)'}
                            </button>
                            <button style={interactiveBtnStyle(networkIsolated, '#ff6600')} onClick={() => { setNetworkIsolated(!networkIsolated); playUniqueSound(networkIsolated ? 'chime' : 'buzzer'); }}>
                                {networkIsolated ? '🌐 RECONNECT EXTERNAL NETWORKS' : '✂️ SEVER INTERNET & ISOLATE INTRANET'}
                            </button>
                            <button style={interactiveBtnStyle(paBroadcast, '#cc00ff')} onClick={() => { setPaBroadcast(!paBroadcast); playUniqueSound('laser'); }}>
                                {paBroadcast ? '🔇 STOP PA BROADCAST' : '📢 BROADCAST AUTOMATED EVACUATION AUDIO'}
                            </button>
                        </div>
                        {lockdown && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,0,0,0.1)', pointerEvents: 'none', animation: 'blink 1s infinite' }} />}
                    </div>

                    {/* F8: Multi-Agency Dispatch & F9: Drone Launcher */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">🚓 First Responder & Air Support Dispatch</span></div>
                        <div className="card-body">
                            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                                <div style={interactiveBtnStyle(dispatch.police, '#0066ff')} onClick={() => { setDispatch(p => ({ ...p, police: !p.police })); playUniqueSound('police'); }}>
                                    🚓 POLICE <br /><span style={{ fontSize: 10, fontWeight: 400 }}>{dispatch.police ? 'ETA: 4m 12s' : 'Standby'}</span>
                                </div>
                                <div style={interactiveBtnStyle(dispatch.fire, '#ff0000')} onClick={() => { setDispatch(p => ({ ...p, fire: !p.fire })); playUniqueSound('air_raid'); }}>
                                    🚒 FIRE <br /><span style={{ fontSize: 10, fontWeight: 400 }}>{dispatch.fire ? 'ETA: 6m 00s' : 'Standby'}</span>
                                </div>
                                <div style={interactiveBtnStyle(dispatch.ems, '#00cc66')} onClick={() => { setDispatch(p => ({ ...p, ems: !p.ems })); playUniqueSound('chime'); }}>
                                    🚑 EMS <br /><span style={{ fontSize: 10, fontWeight: 400 }}>{dispatch.ems ? 'ETA: 3m 45s' : 'Standby'}</span>
                                </div>
                            </div>
                            <button style={interactiveBtnStyle(droneDeployed, '#ff00ff')} onClick={() => { setDroneDeployed(!droneDeployed); playUniqueSound('sonar'); }}>
                                {droneDeployed ? '🛸 RECALL TACTICAL DRONE' : '🚀 LAUNCH AERIAL TRACKING DRONE'}
                            </button>
                        </div>
                    </div>

                    {/* F13: Predictive Escalation & F20: Blast Radius */}
                    <div className="card" style={{ background: '#0a0a0f' }}>
                        <div className="card-header"><span className="card-title">🧠 AI Predictive Escalation Engine</span></div>
                        <div className="card-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Probability of Multi-Sector Breach</span>
                                <span style={{ fontSize: 12, color: '#ff0055', fontWeight: 800 }}>87.4%</span>
                            </div>
                            <div style={{ width: '100%', height: 6, background: '#222', borderRadius: 3, marginBottom: 20 }}>
                                <div style={{ width: '87.4%', height: '100%', background: 'linear-gradient(90deg, #ffaa00, #ff0055)', borderRadius: 3 }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Estimated Containment Time</span>
                                <span style={{ fontSize: 12, color: '#00ccff', fontWeight: 800 }}>45 Minutes</span>
                            </div>

                            {/* Blast Radius Visualizer */}
                            <div style={{ marginTop: 20, padding: '16px', background: 'rgba(255,0,0,0.05)', border: '1px dashed #ff0055', borderRadius: 8, textAlign: 'center' }}>
                                <div style={{ fontSize: 11, letterSpacing: 1, color: '#ff0055' }}>CALCULATING THREAT RADIUS</div>
                                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px dotted #ff0055', animation: 'spin 4s linear infinite', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,0,85,0.5)' }} />
                                    </div>
                                    <div style={{ textAlign: 'left', fontSize: 12, color: '#aaa', fontFamily: 'monospace' }}>
                                        Zone 4 Contamination<br />
                                        Isolating Air Vents...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* ─── 40 DIVERSE & UNIQUE ALERTS LIST ─── */}
                <div className="page-header" style={{ marginTop: 40 }}>
                    <div className="page-header-left">
                        <h2>Real-Time Incident Feed (40 Unique Nodes)</h2>
                        <p>Click any alert row to trigger its unique LED color profile and bespoke audible siren.</p>
                    </div>
                    {/* F7: Alert Clustering & F22: Evacuation Optimizer */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => playUniqueSound('chime')}>🧩 Cluster Similar Threats</button>
                        <button className="btn btn-secondary btn-sm" style={{ color: '#00ccff', borderColor: '#00ccff' }} onClick={() => playUniqueSound('laser')}>↗️ Map Evacuation Routes</button>
                    </div>
                </div>

                <div className="alert-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                    {alerts.map((alert, idx) => {
                        const isSelected = selectedAlert?.id === alert.id;
                        return (
                            <div
                                key={alert.id}
                                className="card alert-card-interactive"
                                onClick={() => handleAlertClick(alert)}
                                style={{
                                    cursor: 'pointer', overflow: 'hidden', position: 'relative',
                                    background: isSelected ? 'rgba(0,0,0,0.8)' : 'var(--color-bg-card)',
                                    border: isSelected ? `2px solid ${alert.color}` : '1px solid var(--color-border)',
                                    boxShadow: isSelected ? `0 0 30px ${alert.color}40, inset 0 0 20px ${alert.color}20` : 'none',
                                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                            >
                                {/* Visual Siren Light Animation inside Card */}
                                {isSelected && (
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: alert.color, animation: 'sirenLight 0.5s infinite alternate', boxShadow: `0 0 20px ${alert.color}` }} />
                                )}

                                <div className="card-body" style={{ padding: '16px', display: 'flex', gap: 16 }}>
                                    {/* Left Icon Block */}
                                    <div style={{
                                        width: 50, height: 50, borderRadius: 12, flexShrink: 0,
                                        background: `linear-gradient(135deg, ${alert.color}20, ${alert.color}10)`,
                                        border: `1px solid ${alert.color}50`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                                        animation: alert.status === 'ACTIVE' ? 'pulseIcon 2s infinite' : 'none'
                                    }}>
                                        {alert.icon}
                                    </div>

                                    {/* Right Content */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                            <div style={{ fontWeight: 800, fontSize: 15, color: isSelected ? alert.color : 'var(--color-text-primary)' }}>
                                                {alert.type.toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1, padding: '2px 6px', borderRadius: 4, background: `${alert.color}20`, color: alert.color }}>
                                                {alert.severity}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span>📍 {alert.location}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                            <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#999' }}>ID: {alert.id}</div>
                                            <div style={{ fontSize: 11, color: alert.status === 'ACTIVE' ? '#ff0055' : '#00cc66', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                {alert.status === 'ACTIVE' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff0055', animation: 'blink 1s infinite' }} />}
                                                {alert.status} • {alert.time}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details when Selected */}
                                {isSelected && (
                                    <div style={{ padding: '0 16px 16px 16px', borderTop: `1px solid ${alert.color}30`, marginTop: 8, paddingTop: 16 }}>
                                        {/* F3: AI Confidence & F4: Sound Signature & F29: Evidence Vault */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>AI CONFIDENCE: <strong style={{ color: alert.color }}>{alert.confidence}%</strong></div>
                                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>AUDIO: <strong style={{ fontFamily: 'monospace', color: alert.color }}>{alert.sound.toUpperCase()}_WAV</strong></div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-sm" style={{ flex: 1, background: `${alert.color}20`, color: alert.color, border: `1px solid ${alert.color}50` }} onClick={(e) => { e.stopPropagation(); playUniqueSound(alert.sound); }}>
                                                🔊 REPLAY
                                            </button>
                                            <button className="btn btn-sm" style={{ flex: 1, background: '#111', color: '#00f5ff', border: '1px solid #00f5ff' }} onClick={(e) => { e.stopPropagation(); shareAlertToFirebase(alert); }}>
                                                📡 BROADCAST
                                            </button>
                                            <button className="btn btn-sm" style={{ flex: 1, background: '#111', color: '#fff', border: '1px solid #333' }} onClick={(e) => { e.stopPropagation(); alert("Evidence Vaulted to Blockchain \nHash: 0x89fabe2..."); }}>
                                                ⛓️ VAULT
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ─── F15: Satellite & Drone Feed & F19: Historical Heatmap ─── */}
                <div className="grid-2 mt-24" style={{ marginTop: 40, gap: 24 }}>
                    <div className="card" style={{ overflow: 'hidden' }}>
                        <div className="card-header"><span className="card-title">🛰️ Tactical Satellite / Drone Overlay</span></div>
                        <div
                            style={{ height: 300, background: '#001100', position: 'relative', overflow: 'hidden', cursor: isDraggingMap ? 'grabbing' : 'grab', outline: 'none' }}
                            onMouseDown={handleMapMouseDown}
                            onMouseMove={handleMapMouseMove}
                            onMouseUp={handleMapMouseUpOrLeave}
                            onMouseLeave={handleMapMouseUpOrLeave}
                            title="Drag to Pan, Use Buttons to Zoom/Rotate"
                        >
                            {/* Rotating Container */}
                            <div style={{
                                position: 'absolute', inset: -150,
                                transform: `translate(${mapPan.x}px, ${mapPan.y}px) scale(${mapZoom}) rotate(${satelliteRotation}deg)`,
                                transition: isDraggingMap ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
                            }}>
                                {/* Mock Radar/Satellite Map UI */}
                                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=%22100%25%22 height=%22100%25%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern id=%22grid%22 width=%2240%22 height=%2240%22 patternUnits=%22userSpaceOnUse%22%3E%3Cpath d=%22M 40 0 L 0 0 0 40%22 fill=%22none%22 stroke=%22rgba(0,255,0,0.1)%22 stroke-width=%221%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22url(%23grid)%22/%3E%3C/svg%3E")' }} />

                                <div style={{ position: 'absolute', top: '50%', left: '50%', width: 300, height: 300, border: '2px solid rgba(0,255,0,0.4)', borderRadius: '50%', transform: 'translate(-50%, -50%)', boxShadow: '0 0 40px rgba(0,255,0,0.2)' }} />
                                <div style={{ position: 'absolute', top: '50%', left: '50%', width: 450, height: 450, border: '1px dashed rgba(0,255,0,0.3)', borderRadius: '50%', transform: 'translate(-50%, -50%)', animation: 'spin 20s linear infinite reverse' }} />

                                {/* Axis Lines */}
                                <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: 1, background: 'rgba(0,255,0,0.6)' }} />
                                <div style={{ position: 'absolute', top: 0, left: '50%', width: 1, height: '100%', background: 'rgba(0,255,0,0.6)' }} />

                                {/* Radar Sweep */}
                                <div style={{ position: 'absolute', top: '50%', left: '50%', width: 300, height: 300, background: 'conic-gradient(from 0deg, rgba(0,255,0,0) 70%, rgba(0,255,0,0.4) 100%)', borderRadius: '50%', transformOrigin: 'top left', animation: 'spin 4s linear infinite', borderRight: '2px solid #00ff00' }} />

                                {/* Drone Markers inside rotation */}
                                <div style={{ position: 'absolute', top: '35%', left: '60%', minWidth: 20, minHeight: 20 }}>
                                    <div style={{ width: 12, height: 12, background: '#ff0000', borderRadius: '50%', boxShadow: '0 0 15px #ff0000', animation: 'blink 0.5s infinite' }} />
                                    <div style={{ position: 'absolute', top: -5, left: 18, color: '#ff0000', fontSize: 10, fontFamily: 'monospace', width: 100 }}>TGT-B LOCKED</div>
                                </div>
                                <div style={{ position: 'absolute', top: '65%', left: '40%', fontSize: 24, transform: 'rotate(45deg)', textShadow: '0 0 10px #00ff00' }}>✈️</div>
                            </div>

                            {/* Fixed Overlay UI (Does not rotate) */}
                            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, zIndex: 10 }}>
                                <button className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: 14, fontWeight: 'bold', border: '1px solid #00ff00', color: '#00ff00', background: 'rgba(0,0,0,0.8)' }} onClick={(e) => { e.stopPropagation(); setMapZoom(z => Math.min(z + 0.5, 4)); playUniqueSound('laser'); }}>+</button>
                                <button className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: 14, fontWeight: 'bold', border: '1px solid #00ff00', color: '#00ff00', background: 'rgba(0,0,0,0.8)' }} onClick={(e) => { e.stopPropagation(); setMapZoom(z => Math.max(z - 0.5, 0.5)); playUniqueSound('laser'); }}>-</button>
                                <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: 11, fontWeight: 'bold', border: '1px solid #00ff00', color: '#00ff00', background: 'rgba(0,0,0,0.8)' }} onClick={(e) => { e.stopPropagation(); setMapZoom(1); setMapPan({ x: 0, y: 0 }); playUniqueSound('buzzer'); }}>RESET MAP</button>
                                <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: 11, fontWeight: 'bold', border: '1px solid #00ff00', color: '#00ff00', background: 'rgba(0,0,0,0.8)' }} onClick={(e) => { e.stopPropagation(); setSatelliteRotation(r => r + 90); playUniqueSound('sonar'); }}>ROTATE ↻</button>
                            </div>
                            <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.8)', padding: '6px 10px', borderRadius: 4, border: '1px solid #00ff00', color: '#00ff00', fontFamily: 'monospace', fontSize: 10, textAlign: 'right', zIndex: 10 }}>
                                COORD: 34.0522° N, 118.2437° W<br />ALTITUDE: 1,200 FT<br /><span style={{ animation: 'blink 1s infinite' }}>● REC (THERMAL ACTIVE)</span>
                            </div>
                            {/* Scanning overlay effect */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'linear-gradient(rgba(0,255,0,0) 50%, rgba(0,255,0,0.1) 50%)', backgroundSize: '100% 4px', pointerEvents: 'none', zIndex: 5 }} />
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="card-title">📊 F19: Multi-Dimensional Anomaly Heatmap</span>
                            <button className="btn btn-secondary btn-sm" onClick={() => {
                                setHeatmapData(Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, threat: Math.random() * 100, anomaly: Math.random() * 50 })));
                                playUniqueSound('laser');
                            }}>
                                🔄 Re-Scan Signatures
                            </button>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={heatmapData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff0055" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ff0055" stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id="colorAnomaly" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00ccff" stopOpacity={0.6} />
                                            <stop offset="95%" stopColor="#00ccff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" stroke="#555" tick={{ fill: '#888', fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{ background: 'rgba(10,10,15,0.95)', border: '1px solid #333', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ fontSize: 12, fontWeight: 'bold' }}
                                        labelStyle={{ color: '#fff', marginBottom: 5 }}
                                    />
                                    <Area type="monotone" dataKey="anomaly" stackId="1" stroke="#00ccff" strokeWidth={2} fill="url(#colorAnomaly)" animationDuration={1000} />
                                    <Area type="monotone" dataKey="threat" stackId="1" stroke="#ff0055" strokeWidth={3} fill="url(#colorThreat)" animationDuration={1000} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* CSS Animations Injected directly for self-containment */}
                <style dangerouslySetInnerHTML={{
                    __html: `
          @keyframes sirenLight { from { opacity: 0.4; } to { opacity: 1; } }
          @keyframes pulseIcon { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,0,0,0.4); } 70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255,0,0,0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,0,0,0); } }
          @keyframes spin { 100% { transform: rotate(360deg); } }
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
          .alert-card-interactive:hover { z-index: 10; }
        `}} />

            </div>
        </div>
    );
};

export default AlertsPage;
