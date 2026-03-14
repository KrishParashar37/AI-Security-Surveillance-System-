import React, { useState, useEffect } from 'react';
import './DashboardStyles.css';

const CyberSignals = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const ips = ['192.168.1.44', '10.0.0.5', '45.22.11.9', '188.44.2.1'];
            const actions = ['BLOCKED', 'DROPPED', 'QUARANTINED'];
            const newLog = `[${new Date().toLocaleTimeString()}] IPTABLES: ${actions[Math.floor(Math.random() * actions.length)]} IP ${ips[Math.floor(Math.random() * ips.length)]} on PORT 22`;
            setLogs(prev => [newLog, ...prev].slice(0, 7));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid-3 mb-24">
            {/* 6. Cyber Intrusion Log */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">🛡️ 06. Cyber Intrusion Log</div>
                <div className="terminal-box">
                    {logs.map((log, i) => (
                        <div key={i} className="terminal-line">{log}</div>
                    ))}
                    {!logs.length && <div className="terminal-line" style={{ color: '#94a3b8' }}>Waiting for traffic...</div>}
                </div>
            </div>

            {/* 7. Signal Jamming Radar */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">📡 07. Signal Jamming Radar</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="data-row"><span className="data-label">Wi-Fi (2.4GHz)</span><div className="bar-bg"><div className="bar-fill" style={{ width: '95%', background: '#22c55e' }}></div></div><span className="data-value">95%</span></div>
                    <div className="data-row"><span className="data-label">Wi-Fi (5GHz)</span><div className="bar-bg"><div className="bar-fill" style={{ width: '88%', background: '#22c55e' }}></div></div><span className="data-value">88%</span></div>
                    <div className="data-row"><span className="data-label">Cellular (5G)</span><div className="bar-bg"><div className="bar-fill" style={{ width: '42%', background: '#eab308' }}></div></div><span className="data-value">42% (WARN)</span></div>
                    <div className="data-row"><span className="data-label">Radio L-Band</span><div className="bar-bg"><div className="bar-fill" style={{ width: '99%', background: '#22c55e' }}></div></div><span className="data-value">99%</span></div>
                </div>
            </div>

            {/* 8. Satellite Uplink */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">🛰️ 08. Orbital Satellite Uplink</div>
                <div style={{ textAlign: 'center', marginTop: 15 }}>
                    <div style={{ fontSize: 40, color: '#3a86ff', fontWeight: 'bold' }}>&lt; / &gt;</div>
                    <div style={{ fontSize: 16, color: '#22c55e', margin: '15px 0', fontWeight: 'bold', textShadow: '0 0 10px #22c55e' }}>UPLINK ESTABLISHED</div>
                    <div className="data-row"><span className="data-label">Sat-1 (GEO)</span><span className="data-value">Connected 45ms</span></div>
                    <div className="data-row"><span className="data-label">Sat-2 (LEO)</span><span className="data-value" style={{ color: '#3a86ff' }}>Connected 12ms</span></div>
                </div>
            </div>

            {/* 9. Facility Power Grid */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header">⚡ 09. Facility Power Grid</div>
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 90, height: 90, borderRadius: '50%', border: '4px solid #22c55e', fontSize: 24, color: '#22c55e', fontWeight: 'bold', boxShadow: '0 0 15px #22c55e, inset 0 0 15px #22c55e' }}>
                        98%
                    </div>
                </div>
                <div className="data-row"><span className="data-label">Main Grid</span><span className="data-value">ONLINE (450kW)</span></div>
                <div className="data-row"><span className="data-label">Backup Gens</span><span className="data-value" style={{ color: '#94a3b8' }}>STANDBY</span></div>
            </div>

            {/* 10. Automated Lockdown */}
            <div className="cyber-panel" style={{ gridColumn: 'span 2' }}>
                <div className="scanline"></div>
                <div className="cyber-header" style={{ color: '#ef4444' }}>🛑 10. Threat Eradication Lockdown Protocol</div>
                <div style={{ display: 'flex', gap: 15, marginTop: 20 }}>
                    <button className="cyber-btn" onClick={() => alert('Sector Alpha Locked!')} style={{ flex: 1, padding: 20, fontSize: 14 }}>LOCKDOWN SECTOR A</button>
                    <button className="cyber-btn" onClick={() => alert('Sector Beta Locked!')} style={{ flex: 1, padding: 20, fontSize: 14 }}>LOCKDOWN DATACENTER</button>
                    <button className="cyber-btn" onClick={() => alert('Total Facility Lockdown Initiated!')} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.4)', color: '#fff', border: '2px solid #ef4444', animation: 'pulse 2s infinite', padding: 20, fontSize: 14 }}>INITIATE TOTAL LOCKDOWN</button>
                </div>
            </div>
        </div>
    );
};

export default CyberSignals;
