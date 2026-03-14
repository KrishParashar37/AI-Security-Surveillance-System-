import React from 'react';
import './DashboardStyles.css';

const AdvancedSensors = () => {
    return (
        <div className="grid-3 mb-24">
            {/* 11. Acoustic Triangulation */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header" style={{ color: '#eab308' }}>🔊 11. Acoustic Triangulation</div>
                <div style={{ height: 120, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', margin: '20px 0' }}>
                    {[40, 60, 30, 80, 50, 90, 40, 20, 60, 30, 50, 20].map((h, i) => (
                        <div key={i} style={{ width: 8, height: `${h}%`, background: '#eab308', borderRadius: 4, animation: `pulse ${0.5 + Math.random()}s infinite alternate`, boxShadow: '0 0 10px #eab308' }}></div>
                    ))}
                </div>
                <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 15 }}>Listening for gunfire, glass breaking, shouts...</div>
            </div>

            {/* 12. Thermal Anomaly Scanner */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header" style={{ color: '#f97316' }}>🔥 12. Thermal Anomaly Scatter</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, height: 120, margin: '20px 0' }}>
                    {Array.from({ length: 35 }).map((_, i) => {
                        const isRed = Math.random() > 0.95;
                        const isOrange = !isRed && Math.random() > 0.8;
                        return (
                            <div key={i} style={{
                                background: isRed ? '#ef4444' : isOrange ? '#f97316' : '#1e3a8a',
                                borderRadius: 3,
                                boxShadow: isRed || isOrange ? `0 0 8px ${isRed ? '#ef4444' : '#f97316'}` : 'none'
                            }}></div>
                        );
                    })}
                </div>
                <div style={{ textAlign: 'center', fontSize: 13, color: '#ef4444', marginTop: 15, fontWeight: 'bold' }}>1 Thermal Anomaly Detected (Sector 7)</div>
            </div>

            {/* 13. Predictive Crime Matrix */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header" style={{ color: '#8b5cf6' }}>🔮 13. Predictive Crime Matrix</div>
                <div style={{ marginTop: 15 }}>
                    {[
                        { sector: 'Parking Lot B', risk: 85, trend: 'Increasing', color: '#ef4444' },
                        { sector: 'Loading Dock', risk: 65, trend: 'Stable', color: '#f97316' },
                        { sector: 'Main Lobby', risk: 15, trend: 'Decreasing', color: '#22c55e' },
                        { sector: 'Server Room', risk: 30, trend: 'Stable', color: '#eab308' }
                    ].map((p, i) => (
                        <div key={i} className="data-row">
                            <span className="data-label">{p.sector}</span>
                            <div className="bar-bg"><div className="bar-fill" style={{ width: `${p.risk}%`, background: p.color }}></div></div>
                            <span className="data-value" style={{ fontSize: 10, color: p.color }}>{p.trend}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 14. Perimeter Breach Sensors */}
            <div className="cyber-panel">
                <div className="scanline"></div>
                <div className="cyber-header" style={{ color: '#0ea5e9' }}>🚧 14. Perimeter Breach Grid</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', padding: '15px 0' }}>
                    {['North Wall', 'South Gate', 'East Fence', 'West Fence', 'Roof Access', 'Basement', 'Loading Bay', 'Drainage'].map((zone, i) => (
                        <div key={i} style={{
                            background: i === 2 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(5, 150, 105, 0.2)',
                            border: `1px solid ${i === 2 ? '#ef4444' : '#059669'}`,
                            color: i === 2 ? '#ef4444' : '#22c55e',
                            padding: '8px 12px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 'bold',
                            boxShadow: i === 2 ? '0 0 10px #ef4444' : 'none',
                            animation: i === 2 ? 'pulse 1s infinite' : 'none'
                        }}>
                            {zone} {i === 2 ? 'BREACH' : 'SECURE'}
                        </div>
                    ))}
                </div>
            </div>

            {/* 15. Behavioral Intent Analysis */}
            <div className="cyber-panel" style={{ gridColumn: 'span 2' }}>
                <div className="scanline"></div>
                <div className="cyber-header" style={{ color: '#ec4899' }}>🧠 15. Crowd Behavioral Intent Breakdown</div>
                <div style={{ display: 'flex', gap: 30, alignItems: 'center', paddingTop: 10 }}>
                    <div style={{ flex: 1 }}>
                        <div className="data-row"><span className="data-label">Neutral / Calm</span><div className="bar-bg"><div className="bar-fill" style={{ width: '80%', background: '#3a86ff' }}></div></div><span className="data-value">80%</span></div>
                        <div className="data-row"><span className="data-label">Nervous / Erratic</span><div className="bar-bg"><div className="bar-fill" style={{ width: '15%', background: '#eab308' }}></div></div><span className="data-value">15%</span></div>
                        <div className="data-row"><span className="data-label">Aggressive</span><div className="bar-bg"><div className="bar-fill" style={{ width: '5%', background: '#ef4444' }}></div></div><span className="data-value">5%</span></div>
                    </div>
                    <div style={{ flex: 1, padding: 20, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 8 }}>
                        <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>⚠️ Aggression Spike Detected</div>
                        <p style={{ margin: 0, fontSize: 12, color: '#f8fafc', lineHeight: 1.5 }}>Behavioral analysis engine has detected elevated aggression markers in the <b>Cafeteria</b>. Micro-expressions and grouped rapid movements suggest a potential altercation.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedSensors;
