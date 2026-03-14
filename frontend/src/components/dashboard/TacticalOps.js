import React, { useState, useRef } from 'react';
import './DashboardStyles.css';

const TacticalOps = () => {
    const [droneExpanded, setDroneExpanded] = useState(false);
    const [droneLogs, setDroneLogs] = useState([
        { time: new Date().toLocaleTimeString(), msg: "SYSTEM: Awaiting command...", color: "#94a3b8" }
    ]);
    const terminalRef = useRef(null);

    const droneFunctions = [
        { id: 'F01', label: 'Global Patrol', icon: '🌐', color: '#3a86ff' },
        { id: 'F02', label: 'Thermal Vision', icon: '🔥', color: '#ef4444' },
        { id: 'F03', label: 'Infrared Scan', icon: '🔴', color: '#f97316' },
        { id: 'F04', label: 'Night Override', icon: '🕶️', color: '#a855f7' },
        { id: 'F05', label: 'Interceptor', icon: '🚀', color: '#eab308' },
        { id: 'F06', label: 'Lockdown Area', icon: '🔒', color: '#ef4444' },
        { id: 'F07', label: 'Auto-Track', icon: '🎯', color: '#22c55e' },
        { id: 'F08', label: 'EMP Burst', icon: '⚡', color: '#06b6d4' },
        { id: 'F09', label: 'Dispersal Siren', icon: '🔊', color: '#eab308' },
        { id: 'F10', label: 'Silent Mode', icon: '🕵️', color: '#64748b' },
        { id: 'F11', label: 'Scan RF Sig', icon: '📡', color: '#3a86ff' },
        { id: 'F12', label: 'Supply Drop', icon: '📦', color: '#22c55e' },
        { id: 'F13', label: 'Air Refuel', icon: '⛽', color: '#f97316' },
        { id: 'F14', label: 'Swarm Delta', icon: '🛩️', color: '#8b5cf6' },
        { id: 'F15', label: 'RTB (Abort)', icon: '⚠️', color: '#ef4444' },
    ];

    const executeDroneCommand = (func) => {
        const time = new Date().toLocaleTimeString();
        const newLog = {
            time,
            msg: `EXEC: [${func.id}] ${func.label} initiated...`,
            color: func.color
        };

        setDroneLogs(prev => [...prev, newLog]);

        // Auto scroll to bottom of terminal
        setTimeout(() => {
            if (terminalRef.current) {
                terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
            }
        }, 50);

        // Simulate a success response after 1 second
        setTimeout(() => {
            setDroneLogs(prev => [...prev, {
                time: new Date().toLocaleTimeString(),
                msg: `SYS: ${func.label} deployed successfully.`,
                color: '#22c55e'
            }]);

            setTimeout(() => {
                if (terminalRef.current) {
                    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
                }
            }, 50);
        }, 1200);
    };

    return (
        <div className="grid-3 mb-24" style={{ gap: '0px' }}>
            {/* 1. Drone Fleet Tracker (INTERACTIVE) */}
            <div className="cyber-panel" style={{ gridRow: droneExpanded ? "span 2" : "auto", transition: "all 0.4s ease-out" }}>
                <div className="scanline"></div>

                {/* Clickable Header */}
                <div className="cyber-header clickable-header" onClick={() => setDroneExpanded(!droneExpanded)}>
                    🚁 01. Drone Fleet Tracker {droneExpanded ? "[-] Collapse" : "[+] Expand"}
                </div>

                {/* Default Overview */}
                <div style={{ display: droneExpanded ? 'none' : 'block' }}>
                    {[
                        { name: 'Aero-1 (Patrol)', battery: 85, status: 'Active' },
                        { name: 'Aero-2 (Recon)', battery: 42, status: 'Returning' },
                        { name: 'Aero-3 (Thermal)', battery: 98, status: 'Standby' },
                    ].map((d, i) => (
                        <div key={i} className="data-row">
                            <span className="data-label">{d.name}</span>
                            <div className="bar-bg"><div className="bar-fill" style={{ width: `${d.battery}%`, background: d.battery > 50 ? '#22c55e' : '#eab308' }}></div></div>
                            <span className="data-value">{d.status}</span>
                        </div>
                    ))}
                    <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '10px', color: '#3a86ff', opacity: 0.8 }}>
                        CLICK HEADER TO ACCESS COMMAND DECK
                    </div>
                </div>

                {/* Expanded Command Interface */}
                {droneExpanded && (
                    <div className="drone-expanded-area">
                        {/* 15 Unique Drone Buttons Grid */}
                        <div className="drone-btn-grid">
                            {droneFunctions.map((func) => (
                                <button
                                    key={func.id}
                                    className="drone-btn"
                                    onClick={() => executeDroneCommand(func)}
                                >
                                    <span style={{ fontSize: '16px' }}>{func.icon}</span>
                                    <span>{func.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Terminal specifically for Drone commands */}
                        <div className="drone-terminal" ref={terminalRef}>
                            {droneLogs.map((log, idx) => (
                                <div key={idx} className="drone-terminal-line" style={{ color: log.color }}>
                                    <span className="drone-terminal-time">[{log.time}]</span>
                                    {log.msg}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Officer Biometrics */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">🫀 02. Officer Biometrics</div>
                {[
                    { name: 'Unit-Alpha (Smith)', hr: 85, stress: 30 },
                    { name: 'Unit-Bravo (Doe)', hr: 120, stress: 80 },
                    { name: 'Unit-Charlie (Ray)', hr: 75, stress: 20 },
                ].map((o, i) => (
                    <div key={i} className="data-row">
                        <span className="data-label">{o.name}</span>
                        <span className="data-value" style={{ color: o.hr > 100 ? '#ef4444' : '#22c55e' }}>{o.hr} BPM</span>
                        <div className="bar-bg"><div className="bar-fill" style={{ width: `${o.stress}%`, background: o.stress > 70 ? '#ef4444' : '#3a86ff' }}></div></div>
                    </div>
                ))}
            </div>

            {/* 3. K9 Unit Deployment */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">🐕 03. K9 Unit Deployment</div>
                {[
                    { name: 'K9-Rex', handler: 'Sgt. Hale', loc: 'Sector 4', status: 'Tracking' },
                    { name: 'K9-Max', handler: 'Cpl. Vance', loc: 'Gate B', status: 'Idle' },
                    { name: 'K9-Zeus', handler: 'Off. Diaz', loc: 'Perimeter', status: 'Patrol' },
                ].map((k, i) => (
                    <div key={i} className="data-row">
                        <span className="data-label">{k.name} ({k.handler})</span>
                        <span className="data-value">{k.loc}</span>
                        <span className="data-value" style={{ color: '#f97316' }}>{k.status}</span>
                    </div>
                ))}
            </div>

            {/* 4. Evacuation Routes */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">🏃 04. Evacuation Routes Matrix</div>
                {[
                    { route: 'Primary Alpha', status: 'CLEAR', load: 12 },
                    { route: 'Secondary Beta', status: 'CONGESTED', load: 88 },
                    { route: 'Emergency Gamma', status: 'CLEAR', load: 5 },
                ].map((r, i) => (
                    <div key={i} className="data-row">
                        <span className="data-label">{r.route}</span>
                        <div className="bar-bg"><div className="bar-fill" style={{ width: `${r.load}%`, background: r.load > 70 ? '#ef4444' : '#22c55e' }}></div></div>
                        <span className="data-value" style={{ color: r.load > 70 ? '#ef4444' : '#22c55e' }}>{r.status}</span>
                    </div>
                ))}
            </div>

            {/* 5. VIP Escort Tracking */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">👔 05. VIP Escort Trace</div>
                {[
                    { vip: 'Exec Director', loc: 'Conference A', threat: 'Low' },
                    { vip: 'Chief Scientist', loc: 'Lab 4', threat: 'Low' },
                    { vip: 'Guest Diplomat', loc: 'Main Lobby', threat: 'Elevated' },
                ].map((v, i) => (
                    <div key={i} className="data-row">
                        <span className="data-label">{v.vip}</span>
                        <span className="data-value">{v.loc}</span>
                        <span className="data-value" style={{ color: v.threat === 'Elevated' ? '#eab308' : '#22c55e' }}>{v.threat}</span>
                    </div>
                ))}
            </div>

            {/* 6. Cyber Infrastructure */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">💻 06. Cyber Infrastructure</div>
                {[
                    { node: 'Mainframe Alpha', status: 'Secured', load: 45 },
                    { node: 'Proxy Firewall', status: 'Active', load: 78 },
                    { node: 'Data Vault', status: 'Encrypted', load: 20 },
                ].map((n, i) => (
                    <div key={i} className="data-row">
                        <span className="data-label">{n.node}</span>
                        <div className="bar-bg"><div className="bar-fill" style={{ width: `${n.load}%`, background: n.load > 70 ? '#ef4444' : '#3a86ff' }}></div></div>
                        <span className="data-value" style={{ color: n.status === 'Secured' || n.status === 'Encrypted' ? '#22c55e' : '#eab308' }}>{n.status}</span>
                    </div>
                ))}
            </div>

            {/* 7. Perimeter Defense */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">🧱 07. Perimeter Defense</div>
                {[
                    { sector: 'North Wall', barrier: 'Intact', power: 100 },
                    { sector: 'East Gate', barrier: 'Breach Risk', power: 45 },
                    { sector: 'South Fence', barrier: 'Intact', power: 90 },
                ].map((p, i) => (
                    <div key={i} className="data-row">
                        <span className="data-label">{p.sector}</span>
                        <div className="bar-bg"><div className="bar-fill" style={{ width: `${p.power}%`, background: p.power < 50 ? '#ef4444' : '#22c55e' }}></div></div>
                        <span className="data-value" style={{ color: p.power < 50 ? '#ef4444' : '#22c55e' }}>{p.barrier}</span>
                    </div>
                ))}
            </div>

            {/* 8. Thermal Signatures */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">🌡️ 08. Thermal Signatures</div>
                {[
                    { zone: 'Forest Edge', temp: '98°F', anomalies: 2 },
                    { zone: 'Warehouse Roof', temp: '75°F', anomalies: 0 },
                    { zone: 'Sub-Basement', temp: '105°F', anomalies: 5 },
                ].map((t, i) => (
                    <div key={i} className="data-row">
                        <span className="data-label">{t.zone}</span>
                        <span className="data-value">{t.temp}</span>
                        <span className="data-value" style={{ color: t.anomalies > 0 ? '#ef4444' : '#22c55e' }}>{t.anomalies} Dtcts</span>
                    </div>
                ))}
            </div>

            {/* 9. Satellite Feed */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">🛰️ 09. Satellite Feed</div>
                {[
                    { sat: 'Orbital-1', coverage: 'Global', latency: '45ms' },
                    { sat: 'Orbital-2', coverage: 'Regional', latency: '12ms' },
                    { sat: 'Orbital-3', coverage: 'Targeted', latency: '8ms' },
                ].map((s, i) => (
                    <div key={i} className="data-row">
                        <span className="data-label">{s.sat}</span>
                        <span className="data-value">{s.coverage}</span>
                        <span className="data-value" style={{ color: parseInt(s.latency) > 30 ? '#eab308' : '#22c55e' }}>{s.latency}</span>
                    </div>
                ))}
            </div>

            {/* 10. Intrusion Detection */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">🕵️ 10. Intrusion Detection</div>
                {[
                    { system: 'Network', attempts: 120, blocked: 120 },
                    { system: 'Physical', attempts: 3, blocked: 2 },
                    { system: 'Drone Airspace', attempts: 5, blocked: 5 },
                ].map((id, i) => (
                    <div key={i} className="data-row">
                        <span className="data-label">{id.system}</span>
                        <span className="data-value" style={{ color: '#eab308' }}>{id.attempts} Att</span>
                        <span className="data-value" style={{ color: id.attempts === id.blocked ? '#22c55e' : '#ef4444' }}>{id.blocked} Blk</span>
                    </div>
                ))}
            </div>

            {/* 11. Energy Grid Status */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">⚡ 11. Energy Grid Status</div>
                {[
                    { grid: 'Main Power', level: 98, status: 'Stable' },
                    { grid: 'Backup Gen', level: 100, status: 'Standby' },
                    { grid: 'Solar Bank', level: 45, status: 'Charging' },
                ].map((e, i) => (
                    <div key={i} className="data-row">
                        <span className="data-label">{e.grid}</span>
                        <div className="bar-bg"><div className="bar-fill" style={{ width: `${e.level}%`, background: e.level > 50 ? '#3a86ff' : '#eab308' }}></div></div>
                        <span className="data-value">{e.status}</span>
                    </div>
                ))}
            </div>

            {/* 12. Automated Turrets */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">🎯 12. Automated Turrets</div>
                {[
                    { id: 'T-Alpha', ammo: 100, mode: 'Auto' },
                    { id: 'T-Beta', ammo: 40, mode: 'Manual' },
                    { id: 'T-Gamma', ammo: 0, mode: 'Reloading' },
                ].map((t, i) => (
                    <div key={i} className="data-row">
                        <span className="data-label">{t.id}</span>
                        <div className="bar-bg"><div className="bar-fill" style={{ width: `${t.ammo}%`, background: t.ammo > 50 ? '#22c55e' : (t.ammo > 0 ? '#eab308' : '#ef4444') }}></div></div>
                        <span className="data-value" style={{ color: t.mode === 'Auto' ? '#ef4444' : '#f8fafc' }}>{t.mode}</span>
                    </div>
                ))}
            </div>

            {/* 13. Bio-Hazard Scanners */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">☣️ 13. Bio-Hazard Scanners</div>
                {[
                    { area: 'Lobby', level: '0.01', status: 'Clean' },
                    { area: 'Lab 2', level: '1.20', status: 'Warning' },
                    { area: 'Ventilation', level: '0.05', status: 'Clean' },
                ].map((b, i) => (
                    <div key={i} className="data-row">
                        <span className="data-label">{b.area}</span>
                        <span className="data-value">{b.level} ppm</span>
                        <span className="data-value" style={{ color: b.status === 'Clean' ? '#22c55e' : '#ef4444' }}>{b.status}</span>
                    </div>
                ))}
            </div>

            {/* 14. Facial Recognition */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">👤 14. Facial Recognition</div>
                {[
                    { target: 'Known Staff', matches: 450, accuracy: '99%' },
                    { target: 'VIPs', matches: 12, accuracy: '98%' },
                    { target: 'Unknowns', matches: 3, accuracy: 'N/A' },
                ].map((f, i) => (
                    <div key={i} className="data-row">
                        <span className="data-label">{f.target}</span>
                        <span className="data-value">{f.matches}</span>
                        <span className="data-value" style={{ color: f.target === 'Unknowns' ? '#eab308' : '#22c55e' }}>{f.accuracy}</span>
                    </div>
                ))}
            </div>

            {/* 15. Comm Frequencies */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">📻 15. Comm Frequencies</div>
                {[
                    { channel: 'Tactical', freq: '144.5 MHz', clarity: 'High' },
                    { channel: 'Emergency', freq: '156.8 MHz', clarity: 'High' },
                    { channel: 'Encrypted', freq: '433.0 MHz', clarity: 'Low' },
                ].map((c, i) => (
                    <div key={i} className="data-row">
                        <span className="data-label">{c.channel}</span>
                        <span className="data-value">{c.freq}</span>
                        <span className="data-value" style={{ color: c.clarity === 'High' ? '#22c55e' : '#ef4444' }}>{c.clarity}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TacticalOps;
