import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line
} from 'recharts';
import Header from '../components/Header';
import API from '../api';
import TacticalOps from '../components/dashboard/TacticalOps';
import CyberSignals from '../components/dashboard/CyberSignals';
import AdvancedSensors from '../components/dashboard/AdvancedSensors';

// ─── Stat Card Component ────────────────────────────────────────────────────
const StatCard = ({ icon, iconClass, value, label, trend, trendDir, onClick }) => (
    <div
        className="stat-card"
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default', position: 'relative', overflow: 'hidden' }}
    >
        <div className={`stat-icon ${iconClass}`}>{icon}</div>
        <div className="stat-info">
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            {trend && <div className={`stat-trend ${trendDir}`}>{trend}</div>}
        </div>
        {onClick && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, color: 'var(--color-primary)' }}>Click to view ↗</div>}
    </div>
);

// ─── Alert Configs ──────────────────────────────────────────────────────────
const severityConfig = {
    critical: { color: '#ef4444', label: 'Critical' },
    high: { color: '#f97316', label: 'High' },
    medium: { color: '#eab308', label: 'Medium' },
    low: { color: '#22c55e', label: 'Low' },
};

const activityIcons = {
    fighting: '🥊', theft: '🔓', trespassing: '🚫',
    loitering: '⏳', unauthorized_entry: '🚪',
    crowd_violence: '👥', weapon_detected: '⚠️', normal: '✅',
};

// ─── Audio Siren Function ───────────────────────────────────────────────────
const playSiren = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';

        let freq = 600;
        let up = true;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const interval = setInterval(() => {
            if (up) freq += 20; else freq -= 20;
            if (freq >= 1200) up = false;
            if (freq <= 600) up = true;
            if (osc.frequency) {
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
            }
        }, 20);

        osc.start();
        gain.gain.setValueAtTime(0.1, ctx.currentTime);

        setTimeout(() => {
            clearInterval(interval);
            osc.stop();
            ctx.close();
        }, 4000);
    } catch (e) {
        console.error("Audio Web API not supported", e);
    }
};

// ─── Webcam Component ───────────────────────────────────────────────────────
const WebcamView = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        let streamRef = null;
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                streamRef = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(err => console.error("Webcam access denied", err));

        return () => {
            if (streamRef) {
                streamRef.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div style={{ position: 'relative', background: 'var(--color-bg-secondary)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block' }} />
            <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(239,68,68,0.8)', padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, background: 'white', borderRadius: '50%', animation: 'blink 1s infinite' }} />
                LIVE WEBCAM
            </div>
            <div style={{ position: 'absolute', bottom: 10, right: 10, color: '#0f0', fontFamily: 'monospace', fontSize: 12, background: 'var(--color-bg-primary)', padding: '2px 6px' }}>
                FACE MATCH: 98%
            </div>
        </div>
    );
};

// ─── Dashboard Page ─────────────────────────────────────────────────────────
const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [detection, setDetection] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modals & Interactivity State
    const [activeModal, setActiveModal] = useState(null); // 'webcam', 'activities', 'persons', 'vehicles', 'accuracy', 'report', 'alertDetails'
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Mock Extended Data for the 10 new features
    const systemHealth = [
        { name: 'CPU Load', value: 45, color: '#3a86ff' },
        { name: 'Memory', value: 72, color: '#f97316' },
        { name: 'Storage', value: 88, color: '#ef4444' },
        { name: 'Network', value: 30, color: '#22c55e' }
    ];

    const licensePlates = [
        { plate: 'XYZ-1234', time: 'Just now', matched: true },
        { plate: 'ABC-9876', time: '2 mins ago', matched: false },
        { plate: 'LMN-4567', time: '5 mins ago', matched: true },
        { plate: 'DEF-1122', time: '12 mins ago', matched: false }
    ];

    const recognizedFaces = [
        { name: 'John Doe', role: 'Staff - IT', time: 'Just now', confidence: '99.2%' },
        { name: 'Jane Smith', role: 'Manager', time: '3 mins ago', confidence: '98.5%' },
        { name: 'Unknown', role: 'Visitor', time: '10 mins ago', confidence: 'N/A' }
    ];

    const networkTraffic = Array.from({ length: 15 }, (_, i) => ({ time: `-${15 - i}m`, in: Math.random() * 100, out: Math.random() * 80 }));

    const securityRoster = [
        { name: 'Officer A. Bravo', zone: 'Sector 1 (Gates)', status: 'On Patrol' },
        { name: 'Officer J. Delta', zone: 'Sector 2 (Servers)', status: 'Stationed' },
        { name: 'Officer C. Tango', zone: 'Sector 3 (Warehouse)', status: 'Break' }
    ];

    const auditLogs = [
        { id: 'LOG-001', action: 'Firmware Update', user: 'System', time: '02:00 AM', status: 'Success' },
        { id: 'LOG-002', action: 'Camera 4 Offline', user: 'Network', time: '04:15 AM', status: 'Warning' },
        { id: 'LOG-003', action: 'Access Granted: Server Room', user: 'Admin', time: '08:45 AM', status: 'Success' },
        { id: 'LOG-004', action: 'Config Changed', user: 'Admin', time: '09:12 AM', status: 'Success' },
    ];

    const fetchData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const [statsRes, chartRes, eventsRes, alertsRes] = await Promise.all([
                API.get('/api/dashboard/stats'),
                API.get('/api/dashboard/activity-chart'),
                API.get('/api/dashboard/recent-events?limit=8'),
                API.get('/api/alerts/?limit=5'),
            ]);
            setStats(statsRes.data);
            setChartData(chartRes.data.data || []);
            setRecentEvents(eventsRes.data);
            setAlerts(alertsRes.data);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
            setTimeout(() => setIsRefreshing(false), 500);
        }
    }, []);

    const fetchLiveDetection = useCallback(async () => {
        try {
            const res = await API.get('/api/detection/simulate/cam_001');
            setDetection(res.data);
        } catch { }
    }, []);

    useEffect(() => {
        fetchData();
        fetchLiveDetection();
        const interval = setInterval(fetchLiveDetection, 3000);
        return () => clearInterval(interval);
    }, [fetchData, fetchLiveDetection]);

    const handleExportReport = () => {
        setActiveModal('report');
    };

    const printReport = () => {
        window.print();
    };

    if (loading) return (
        <div>
            <Header title="Dashboard" subtitle="Overview" />
            <div className="page-content">
                <div className="loading-spinner"><div className="spinner" /><span>Loading surveillance data...</span></div>
            </div>
        </div>
    );

    return (
        <div>
            <Header title="Dashboard" subtitle="Overview" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* Page Header */}
                <div className="page-header">
                    <div className="page-header-left">
                        <h2>Security Command Center</h2>
                        <p>Advanced Real-Time Intelligent Monitoring System</p>
                    </div>
                    <div className="flex gap-8">
                        <button className="btn btn-secondary btn-sm" onClick={handleExportReport}>📥 Export Report</button>
                        <button className={`btn btn-primary btn-sm ${isRefreshing ? 'refreshing' : ''}`} onClick={fetchData}>
                            {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
                        </button>
                    </div>
                </div>

                {/* Interactive Stats Grid */}
                <div className="stats-grid mb-24">
                    <StatCard
                        icon="📷" iconClass="primary"
                        value={stats.total_cameras} label="Total Cameras" trend="Click to open webcam" trendDir="up"
                        onClick={() => setActiveModal('webcam')}
                    />
                    <StatCard
                        icon="🚨" iconClass="danger"
                        value={stats.total_alerts_today} label="Alerts Today" trend="Click to sound siren!" trendDir="up"
                        onClick={playSiren}
                    />
                    <StatCard
                        icon="👁️" iconClass="success"
                        value={stats.suspicious_activities_detected} label="Activities Detected" trend="Click for 24h log"
                        onClick={() => setActiveModal('activities')}
                    />
                    <StatCard
                        icon="👤" iconClass="accent"
                        value={stats.persons_detected_today} label="Persons Detected" trend="Click to view today's log"
                        onClick={() => setActiveModal('persons')}
                    />
                    <StatCard
                        icon="🚗" iconClass="orange"
                        value={stats.vehicles_detected_today} label="Vehicles Detected" trend="Click to view live stream"
                        onClick={() => setActiveModal('vehicles')}
                    />
                    <StatCard
                        icon="🤖" iconClass="primary"
                        value={`${stats.ai_model_accuracy}%`} label="AI Model Accuracy" trend="Click for details"
                        onClick={() => setActiveModal('accuracy')}
                    />
                </div>

                {/* Main Charts Row */}
                <div className="grid-2 mb-24">
                    <div className="chart-container">
                        <div className="card-header" style={{ padding: '0 0 16px 0', border: 'none' }}>
                            <span className="card-title">📈 Activity Timeline (24h)</span>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="personGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3a86ff" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3a86ff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)" />
                                <XAxis dataKey="label" stroke="#4a5568" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#4a5568" tick={{ fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                                <Area type="monotone" dataKey="alerts" stroke="#ef4444" fill="url(#alertGrad)" name="Alerts" strokeWidth={2} />
                                <Area type="monotone" dataKey="persons" stroke="#3a86ff" fill="url(#personGrad)" name="Persons" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">🤖 Live AI Detection Matrix</span>
                            <div className="live-indicator"><div className="live-dot" />REAL-TIME</div>
                        </div>
                        <div className="card-body">
                            {detection && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                        <div style={{ fontSize: 40 }}>{activityIcons[detection.activity_type] || '🔍'}</div>
                                        <div>
                                            <div style={{ fontSize: 22, fontWeight: 800, color: detection.is_suspicious ? 'var(--color-critical)' : 'var(--color-secondary)' }}>
                                                {detection.activity_type.replace(/_/g, ' ').toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Camera ID: {detection.camera_id}</div>
                                        </div>
                                    </div>

                                    <div className="confidence-bar" style={{ marginBottom: 16 }}>
                                        <span style={{ minWidth: 70 }}>Confidence</span>
                                        <div className="confidence-track">
                                            <div className="confidence-fill" style={{ width: `${detection.confidence * 100}%` }} />
                                        </div>
                                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{(detection.confidence * 100).toFixed(0)}%</span>
                                    </div>

                                    {detection.objects_detected?.length > 0 && (
                                        <div style={{ marginBottom: 16 }}>
                                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Objects Tracked</div>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                {detection.objects_detected.map((obj, i) => (
                                                    <span key={i} className="badge badge-normal border" style={{ borderColor: 'var(--color-primary)' }}>{obj}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderLeft: `3px solid ${detection.is_suspicious ? 'var(--color-critical)' : 'var(--color-secondary)'}`, borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--color-text-muted)' }}>
                                        Frame: #{detection.frame_id} <br />
                                        Time: {new Date(detection.timestamp).toLocaleTimeString()} <br />
                                        Status: <strong style={{ color: detection.is_suspicious ? 'var(--color-critical)' : 'var(--color-secondary)' }}>
                                            {detection.is_suspicious ? '⚠ SUSPICIOUS PATTERN' : '✅ NORMAL PATTERN'}
                                        </strong>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 10 New Unique Features Section */}
                <div className="page-header" style={{ marginTop: 40 }}>
                    <div className="page-header-left">
                        <h2>Command Central Deep Dive</h2>
                        <p>Advanced modules, logs, and interactive diagnostics</p>
                    </div>
                </div>

                <div className="grid-3 mb-24">

                    {/* Feature 1: System Health Monitor */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">🖥️ System Health Diagnostics</span></div>
                        <div className="card-body">
                            {systemHealth.map((h, i) => (
                                <div key={i} style={{ marginBottom: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>{h.name}</span>
                                        <span style={{ fontWeight: 700, color: h.color }}>{h.value}%</span>
                                    </div>
                                    <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${h.value}%`, background: h.color, borderRadius: 3 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature 2: Facial Recognition Logs */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">👤 Facial Match Feed</span></div>
                        <div className="card-body p-0">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {recognizedFaces.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13, color: f.name === 'Unknown' ? 'var(--color-critical)' : 'var(--color-text-primary)' }}>{f.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{f.role} • {f.time}</div>
                                        </div>
                                        <span className={`badge ${f.name === 'Unknown' ? 'badge-critical' : 'badge-low'}`}>{f.confidence}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Feature 3: License Plate Recognition (ALPR) */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">🚗 ALPR Scanning Feed</span></div>
                        <div className="card-body">
                            {licensePlates.map((lp, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 8, marginBottom: 8 }}>
                                    <div>
                                        <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 14, letterSpacing: 1, color: 'var(--color-text-primary)' }}>{lp.plate}</div>
                                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{lp.time}</div>
                                    </div>
                                    <div>
                                        {lp.matched
                                            ? <span className="badge badge-low">Verified</span>
                                            : <span className="badge badge-warning">Unregistered</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid-2 mb-24">
                    {/* Feature 4: Recent Alerts (Functional) */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">🚨 Recent Incidents Hub</span>
                        </div>
                        <div>
                            {alerts.slice(0, 5).map((alert) => (
                                <div key={alert.id} className="alert-item" onClick={() => { setSelectedAlert(alert); setActiveModal('alertDetails'); }} style={{ cursor: 'pointer' }}>
                                    <div className={`alert-indicator ${alert.severity}`} />
                                    <div className={`alert-icon ${alert.severity === 'critical' ? 'stat-icon danger' : alert.severity === 'high' ? 'stat-icon orange' : 'stat-icon warning'}`} style={{ width: 36, height: 36, fontSize: 16 }}>
                                        {activityIcons[alert.activity_type] || '⚠️'}
                                    </div>
                                    <div className="alert-content">
                                        <div className="alert-title">{alert.activity_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                                        <div className="alert-desc">{alert.camera_name} • {alert.location}</div>
                                    </div>
                                    <div className="alert-meta flex-col items-center">
                                        <span className={`badge badge-${alert.severity}`}>{alert.severity}</span>
                                        <span style={{ fontSize: 10, color: 'var(--color-primary)', marginTop: 4 }}>Click for details</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature 5: Network Traffic Chart & Feature 6: Threat Info */}
                    <div className="flex flex-col gap-16">
                        <div className="card" style={{ flex: 1 }}>
                            <div className="card-header"><span className="card-title">🌐 Live Network Bandwidth</span></div>
                            <div className="card-body" style={{ height: 160 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={networkTraffic}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="time" hide />
                                        <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }} />
                                        <Line type="monotone" dataKey="in" stroke="#3a86ff" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="out" stroke="#f97316" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid-2">
                            <div className="card">
                                <div className="card-body flex flex-col items-center justify-center text-center">
                                    <div style={{ fontSize: 40, marginBottom: 10 }}>🛡️</div>
                                    <div style={{ fontWeight: 700, color: 'var(--color-low)' }}>DEFCON 5</div>
                                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Current Threat Level</div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-body flex flex-col items-center justify-center text-center">
                                    <div style={{ fontSize: 40, marginBottom: 10 }}>☁️</div>
                                    <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>22°C / Clear</div>
                                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Local Weather (Affects outdoor cams)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row - Feature 8, 9, 10 */}
                <div className="grid-3">
                    {/* Feature 8: Security Roster */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">👮 Security Roster</span></div>
                        <div className="table-wrapper">
                            <table style={{ background: 'transparent' }}>
                                <thead><tr><th>Officer</th><th>Zone</th><th>Status</th></tr></thead>
                                <tbody>
                                    {securityRoster.map((r, i) => (
                                        <tr key={i}>
                                            <td><strong style={{ color: 'var(--color-text-primary)', fontSize: 12 }}>{r.name}</strong></td>
                                            <td style={{ fontSize: 11 }}>{r.zone}</td>
                                            <td><span className={`badge ${r.status === 'On Patrol' ? 'badge-low' : 'badge-warning'}`} style={{ fontSize: 9 }}>{r.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Feature 9: Audit Logs */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">📝 Compliance Audit Logs</span></div>
                        <div className="card-body p-0" style={{ padding: 12 }}>
                            {auditLogs.map((log, i) => (
                                <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text-muted)', paddingTop: 2 }}>{log.time}</div>
                                    <div>
                                        <div style={{ fontSize: 12, color: 'var(--color-text-primary)', fontWeight: 600 }}>{log.action}</div>
                                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>User: {log.user} • <span style={{ color: log.status === 'Success' ? 'var(--color-low)' : 'var(--color-high)' }}>{log.status}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature 10: Server Storage Distribution */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">💾 Storage Distribution</span></div>
                        <div className="card-body flex justify-center items-center" style={{ height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Video Archives', value: 400, color: '#3a86ff' },
                                            { name: 'Alert Snapshots', value: 150, color: '#ef4444' },
                                            { name: 'System Logs', value: 50, color: '#eab308' },
                                            { name: 'Free Space', value: 200, color: '#22c55e' }
                                        ]}
                                        innerRadius={40} outerRadius={70} dataKey="value" stroke="none" paddingAngle={5}
                                    >
                                        {[0, 1, 2, 3].map((entry, i) => <Cell key={i} fill={['#3a86ff', '#ef4444', '#eab308', '#22c55e'][i]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ─── 15 NEW DEEP UNIQUE FEATURES ─── */}
                <div className="page-header" style={{ marginTop: 40, borderTop: '1px solid rgba(58, 134, 255, 0.3)', paddingTop: 40 }}>
                    <div className="page-header-left">
                        <h2 style={{ color: 'var(--color-primary)', textShadow: '0 0 10px rgba(58, 134, 255, 0.5)' }}>🌐 Omni-Command & Tactical Operations</h2>
                        <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Deep system integrations, Cyber Warfare, and Total Facility Sensors</p>
                    </div>
                </div>

                <TacticalOps />
                <CyberSignals />
                <AdvancedSensors />


                {/* ─── MODALS FOR INTERACTIVITY ─── */}

                {/* 1. WEBCAM MODAL */}
                {activeModal === 'webcam' && (
                    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
                            <div className="modal-header">
                                <h3 style={{ color: 'var(--color-text-primary)' }}>Live Camera View (Verification)</h3>
                                <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal(null)}>✕</button>
                            </div>
                            <div className="modal-body">
                                <WebcamView />
                                <p style={{ marginTop: 16, color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center' }}>
                                    Facial recognition active. Matching against permitted personnel database...
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. ACTIVITIES MODAL */}
                {activeModal === 'activities' && (
                    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 style={{ color: 'var(--color-text-primary)' }}>Last 24 Hours Activity Breakdown</h3>
                                <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal(null)}>✕</button>
                            </div>
                            <div className="modal-body">
                                {recentEvents.map((ev, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <div style={{ fontSize: 24 }}>{activityIcons[ev.activity] || '🔍'}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{ev.activity.replace(/_/g, ' ').toUpperCase()}</div>
                                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{ev.camera} • {(ev.confidence * 100).toFixed(0)}% Confidence</div>
                                        </div>
                                        <span className="badge badge-medium">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. PERSONS DETECTED MODAL */}
                {activeModal === 'persons' && (
                    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 style={{ color: 'var(--color-text-primary)' }}>Persons Detected Log (Today)</h3>
                                <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal(null)}>✕</button>
                            </div>
                            <div className="modal-body" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 60, marginBottom: 20 }}>👤</div>
                                <h2>312 Unique Signatures</h2>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 20 }}>
                                    The system has tracked 312 distinct human movement signatures across all sectors today.
                                    Most clustered around Main Entrance and Lobby.
                                </p>
                                <div className="progress-bar-wrap" style={{ textAlign: 'left' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, color: 'var(--color-text-secondary)' }}>
                                        <span>Staff Identified: 245</span>
                                        <span>Unknown: 67</span>
                                    </div>
                                    <div style={{ width: '100%', height: 10, background: 'var(--color-critical)', borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
                                        <div style={{ width: '78%', height: '100%', background: 'var(--color-low)' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. VEHICLES DETECTED MODAL */}
                {activeModal === 'vehicles' && (
                    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 style={{ color: 'var(--color-text-primary)' }}>Vehicle Tracking Radar</h3>
                                <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal(null)}>✕</button>
                            </div>
                            <div className="modal-body" style={{ textAlign: 'center', position: 'relative', height: 300, background: 'var(--color-bg-card)', borderRadius: 8, overflow: 'hidden' }}>
                                {/* Radar sweep animation background */}
                                <div style={{ position: 'absolute', inset: 0, border: '1px solid var(--color-primary)', borderRadius: '50%', transform: 'scale(1.5)', opacity: 0.1 }} />
                                <div style={{ position: 'absolute', inset: 40, border: '1px solid var(--color-primary)', borderRadius: '50%', opacity: 0.2 }} />
                                <div style={{ position: 'absolute', inset: 100, border: '1px solid var(--color-primary)', borderRadius: '50%', opacity: 0.3 }} />

                                {/* Random dots simulating vehicles */}
                                <div style={{ position: 'absolute', top: 80, left: 150, width: 8, height: 8, background: '#f97316', borderRadius: '50%', boxShadow: '0 0 10px #f97316' }} />
                                <div style={{ position: 'absolute', top: 200, left: 280, width: 8, height: 8, background: '#f97316', borderRadius: '50%', boxShadow: '0 0 10px #f97316' }} />
                                <div style={{ position: 'absolute', top: 150, left: 350, width: 8, height: 8, background: '#f97316', borderRadius: '50%', boxShadow: '0 0 10px #f97316' }} />

                                <div style={{ position: 'absolute', bottom: 20, width: '100%', color: 'var(--color-primary)', fontFamily: 'monospace', fontWeight: 600 }}>
                                    TRACKING 3 ACTIVE VEHICLES IN PARKING LOT A
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. ACCURACY MODAL */}
                {activeModal === 'accuracy' && (
                    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 style={{ color: 'var(--color-text-primary)' }}>AI Model Performance Matrix</h3>
                                <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal(null)}>✕</button>
                            </div>
                            <div className="modal-body">
                                <div className="grid-2" style={{ gap: 20 }}>
                                    <div style={{ background: 'var(--color-bg-secondary)', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                                        <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-low)' }}>94.7%</div>
                                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>mAP@0.5 YOLOv8n (Simulated)</div>
                                    </div>
                                    <div style={{ background: 'var(--color-bg-secondary)', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                                        <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-primary)' }}>65ms</div>
                                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Average Inference Latency</div>
                                    </div>
                                </div>
                                <h4 style={{ color: 'var(--color-text-secondary)', marginTop: 24, marginBottom: 12 }}>Class Accuracy</h4>
                                {[
                                    { cls: 'Person', acc: 98 },
                                    { cls: 'Vehicle', acc: 95 },
                                    { cls: 'Weapon', acc: 89 },
                                    { cls: 'Bag', acc: 82 }
                                ].map(item => (
                                    <div key={item.cls} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                        <span style={{ width: 60, fontSize: 12, color: 'var(--color-text-primary)' }}>{item.cls}</span>
                                        <div style={{ flex: 1, background: 'var(--color-border)', height: 8, borderRadius: 4 }}>
                                            <div style={{ width: `${item.acc}%`, background: 'var(--color-primary)', height: '100%', borderRadius: 4 }} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent)' }}>{item.acc}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. EXPORT REPORT MODAL */}
                {activeModal === 'report' && (
                    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                        <div className="modal report-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 style={{ color: 'var(--color-text-primary)' }}>Generated Security Report</h3>
                                <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal(null)}>✕</button>
                            </div>
                            <div className="modal-body" style={{ background: '#fff', color: '#000', borderRadius: 4, margin: 16, padding: 32, fontFamily: 'serif' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: 16, marginBottom: 24 }}>
                                    <div>
                                        <h1 style={{ margin: 0, fontSize: 24, textTransform: 'uppercase', letterSpacing: 2 }}>SecureVision AI</h1>
                                        <div style={{ fontSize: 12, marginTop: 4, color: '#666' }}>Official Surveillance Summary</div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: 12 }}>
                                        Date: {new Date().toLocaleDateString()}<br />
                                        Time: {new Date().toLocaleTimeString()}
                                    </div>
                                </div>
                                <h2 style={{ fontSize: 18, marginBottom: 16 }}>Executive Summary</h2>
                                <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                                    During the last 24 hours, the AI Security Surveillance System has successfully monitored <b>{stats?.total_cameras || 6}</b> camera feeds.
                                    A total of <b>{stats?.suspicious_activities_detected || 47}</b> suspicious activities were detected, triggering <b>{stats?.total_alerts_today || 11}</b> alerts, of which <b>{stats?.critical_alerts || 3}</b> were classified as critical.
                                </p>
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: 14 }}>
                                    <tbody>
                                        <tr><th style={{ border: '1px solid #ccc', padding: 8, textAlign: 'left', background: '#f5f5f5' }}>Persons Detected</th><td style={{ border: '1px solid #ccc', padding: 8 }}>{stats?.persons_detected_today || 312}</td></tr>
                                        <tr><th style={{ border: '1px solid #ccc', padding: 8, textAlign: 'left', background: '#f5f5f5' }}>Vehicles Detected</th><td style={{ border: '1px solid #ccc', padding: 8 }}>{stats?.vehicles_detected_today || 89}</td></tr>
                                        <tr><th style={{ border: '1px solid #ccc', padding: 8, textAlign: 'left', background: '#f5f5f5' }}>System Uptime</th><td style={{ border: '1px solid #ccc', padding: 8 }}>100% (Last 24h)</td></tr>
                                    </tbody>
                                </table>
                                <p style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 40 }}>--- End of Report ---</p>
                            </div>
                            <div className="modal-footer" style={{ background: 'var(--color-bg-card)' }}>
                                <button className="btn btn-primary" onClick={printReport}>🖨️ Print / Save PDF</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 7. ALERT DETAILS MODAL (Clicking RECENT ALERTS) */}
                {activeModal === 'alertDetails' && selectedAlert && (
                    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="flex items-center gap-12">
                                    <span style={{ fontSize: 24 }}>{activityIcons[selectedAlert.activity_type] || '⚠️'}</span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary)' }}>
                                            {selectedAlert.activity_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Incident Details</div>
                                    </div>
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal(null)}>✕</button>
                            </div>
                            <div className="modal-body">
                                <div className="grid-2" style={{ gap: 16, marginBottom: 20 }}>
                                    <div style={{ padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 8 }}>
                                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>SEVERITY</div>
                                        <span className={`badge badge-${selectedAlert.severity}`} style={{ marginTop: 8 }}>{selectedAlert.severity.toUpperCase()}</span>
                                    </div>
                                    <div style={{ padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 8 }}>
                                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>CONFIDENCE</div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>{(selectedAlert.confidence * 100).toFixed(0)}%</div>
                                    </div>
                                </div>
                                <div style={{ padding: 16, border: '1px solid var(--color-border)', borderRadius: 8 }}>
                                    <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 14 }}>
                                        <strong>Location:</strong> {selectedAlert.location} ({selectedAlert.camera_name})<br /><br />
                                        <strong>Time:</strong> {new Date(selectedAlert.timestamp).toLocaleString()}<br /><br />
                                        <strong>Description:</strong> {selectedAlert.description}
                                    </p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-danger">🚨 Escalate Threat</button>
                                <button className="btn btn-success" onClick={() => setActiveModal(null)}>✅ Mark False Alarm</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DashboardPage;
