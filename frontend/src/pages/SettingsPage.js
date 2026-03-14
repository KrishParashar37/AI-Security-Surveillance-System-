import React from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
    const { user } = useAuth();

    return (
        <div>
            <Header title="Settings" subtitle="System Configuration" />
            <div className="page-content">
                <div className="page-header">
                    <div className="page-header-left">
                        <h2>System Settings</h2>
                        <p>Configure AI models, users, and system preferences</p>
                    </div>
                </div>

                <div className="grid-2">
                    {/* Profile */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">👤 Profile</span></div>
                        <div className="card-body">
                            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, margin: '0 auto 12px' }}>
                                    {(user?.name?.[0] || 'A').toUpperCase()}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.name || 'Admin User'}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{user?.email}</div>
                                <span className="badge badge-low" style={{ marginTop: 8 }}>{user?.role?.toUpperCase()}</span>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" defaultValue={user?.name} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input className="form-input" defaultValue={user?.email} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input className="form-input" defaultValue={user?.phone || ''} placeholder="+1 234 567 8900" />
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%' }}>💾 Save Profile</button>
                        </div>
                    </div>

                    {/* AI Model Config */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">🤖 AI Model Configuration</span></div>
                        <div className="card-body">
                            {[
                                { label: 'Detection Model', value: 'YOLOv8n', opts: ['YOLOv8n', 'YOLOv8s', 'YOLOv8m', 'Faster R-CNN'] },
                                { label: 'Behavior Model', value: 'Custom LSTM', opts: ['Custom LSTM', 'Transformer', 'CNN-LSTM'] },
                            ].map((m, i) => (
                                <div key={i} className="form-group">
                                    <label className="form-label">{m.label}</label>
                                    <select className="form-input" defaultValue={m.value}>
                                        {m.opts.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                </div>
                            ))}
                            <div className="form-group">
                                <label className="form-label">Confidence Threshold: <strong style={{ color: 'var(--color-primary)' }}>0.50</strong></label>
                                <input type="range" min="0.1" max="0.99" step="0.05" defaultValue="0.5" style={{ width: '100%', accentColor: 'var(--color-primary)', height: 4 }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                                    <span>0.10</span><span>0.50</span><span>0.99</span>
                                </div>
                            </div>
                            {[
                                { label: 'Enable GPU Acceleration', on: true },
                                { label: 'Enable Facial Recognition', on: false },
                                { label: 'Enable Weapon Detection', on: true },
                                { label: 'Night Vision Mode', on: false },
                            ].map((opt, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(99,179,237,0.05)' }}>
                                    <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{opt.label}</span>
                                    <div style={{ width: 36, height: 20, borderRadius: 10, background: opt.on ? 'var(--color-primary)' : 'var(--color-border)', cursor: 'pointer', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: 2, left: opt.on ? 17 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                                    </div>
                                </div>
                            ))}
                            <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}>💾 Save AI Config</button>
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">ℹ️ System Information</span></div>
                        <div className="card-body">
                            {[
                                ['System', 'AI Security Surveillance System'],
                                ['Version', 'v1.0.0'],
                                ['Backend', 'FastAPI + Python 3.11'],
                                ['Frontend', 'React 18'],
                                ['AI Framework', 'PyTorch + Ultralytics'],
                                ['Database', 'MongoDB'],
                                ['Status', '🟢 Online'],
                                ['Uptime', '7 days, 14 hours'],
                            ].map(([key, val]) => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(99,179,237,0.05)', fontSize: 13 }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>{key}</span>
                                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Danger zone */}
                    <div className="card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
                        <div className="card-header" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
                            <span className="card-title" style={{ color: 'var(--color-critical)' }}>⚠️ Danger Zone</span>
                        </div>
                        <div className="card-body">
                            {[
                                { label: 'Clear All Alerts', desc: 'Permanently delete all alert records', btn: 'Clear Alerts' },
                                { label: 'Reset AI Models', desc: 'Reload all AI model weights', btn: 'Reset Models' },
                                { label: 'Factory Reset', desc: 'Reset system to default configuration', btn: 'Factory Reset' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid rgba(239,68,68,0.1)' : 'none' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{item.label}</div>
                                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{item.desc}</div>
                                    </div>
                                    <button className="btn btn-danger btn-sm">{item.btn}</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
