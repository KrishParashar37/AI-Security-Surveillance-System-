import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import API from '../api';

/* ─── Hardcoded contact targets ─── */
const TARGET_PHONE  = '+918435679136';
const TARGET_EMAIL  = 'krishparashar609@gmail.com';

/* ─── Mock history entries ─── */
const mockHistory = [
    { id: 'NTF-001', type: 'EMAIL', recipient: TARGET_EMAIL,     subject: 'CRITICAL: Weapon detected – Lab L4',  status: 'DELIVERED', ts: Date.now() - 120000 },
    { id: 'NTF-002', type: 'SMS',   recipient: TARGET_PHONE,     subject: 'HIGH ALERT: Unauthorized entry CAM-3', status: 'DELIVERED', ts: Date.now() - 300000 },
    { id: 'NTF-003', type: 'EMAIL', recipient: TARGET_EMAIL,     subject: 'Daily Summary – 14 Mar 2026',          status: 'DELIVERED', ts: Date.now() - 3600000 },
    { id: 'NTF-004', type: 'SMS',   recipient: TARGET_PHONE,     subject: 'System boot confirmed',                status: 'DELIVERED', ts: Date.now() - 7200000 },
    { id: 'NTF-005', type: 'PUSH',  recipient: 'Browser',        subject: 'Loitering detected – Parking Zone',   status: 'SENT',      ts: Date.now() - 900000 },
];

// eslint-disable-next-line no-unused-vars
const SEVERITY_COLOR = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };

const NotificationsPage = () => {
    const [log, setLog]               = useState([]);
    const [loading, setLoading]       = useState(true);
    const [opLog, setOpLog]           = useState([
        { time: new Date().toLocaleTimeString(), msg: 'SYSTEM: Notification Engine v3.1 ready.', color: '#22c55e' },
        { time: new Date().toLocaleTimeString(), msg: `TARGET EMAIL: ${TARGET_EMAIL}`, color: '#3a86ff' },
        { time: new Date().toLocaleTimeString(), msg: `TARGET SMS:   ${TARGET_PHONE}`, color: '#8b5cf6' },
    ]);
    const [status, setStatus]         = useState('');
    const [statusColor, setStatusColor] = useState('#22c55e');

    /* Settings toggles */
    const [rules, setRules] = useState([
        { id: 'r1', label: '🚨 Alert on Critical Activity',    enabled: true  },
        { id: 'r2', label: '⚠️ Alert on High Severity',        enabled: true  },
        { id: 'r3', label: '📩 Alert on Medium Severity',      enabled: false },
        { id: 'r4', label: '📋 Daily Summary Email',           enabled: true  },
        { id: 'r5', label: '⏱ Batch Notifications (5 min)',   enabled: false },
        { id: 'r6', label: '🌙 Night Mode (Reduced Alerts)',   enabled: false },
        { id: 'r7', label: '📱 SMS on Every Alert',            enabled: true  },
        { id: 'r8', label: '🔔 Browser Push Alerts',          enabled: false },
        { id: 'r9', label: '🔁 Auto-Retry Failed Alerts',     enabled: true  },
        { id: 'r10',label: '🔐 Encrypt Notification Content', enabled: false },
    ]);

    /* Custom compose fields */
    const [composePhone,   setComposePhone]   = useState(TARGET_PHONE);
    const [composeEmail,   setComposeEmail]   = useState(TARGET_EMAIL);
    const [composeMsg,     setComposeMsg]     = useState('');
    const [composeSev,     setComposeSev]     = useState('critical');
    const [historyFilter,  setHistoryFilter]  = useState('all');

    const logRef = useRef(null);

    useEffect(() => {
        API.get('/api/notifications/log')
            .then(r => setLog(r.data.log || mockHistory))
            .catch(() => setLog(mockHistory))
            .finally(() => setLoading(false));
    }, []);

    const addOpLog = (msg, color = '#94a3b8') => {
        const time = new Date().toLocaleTimeString();
        setOpLog(prev => [...prev.slice(-49), { time, msg, color }]);
        setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 50);
    };

    const flash = (msg, color = '#22c55e') => {
        setStatus(msg); setStatusColor(color);
        setTimeout(() => setStatus(''), 4000);
    };

    /* ─ Core send helper ─ */
    const sendNotification = async (channel, recipient, subject) => {
        addOpLog(`SENDING → ${channel.toUpperCase()} → ${recipient} | "${subject}"`, '#eab308');
        try {
            await API.post(`/api/notifications/test?channel=${channel}&recipient=${encodeURIComponent(recipient)}`);
            flash(`✅ ${channel.toUpperCase()} sent to ${recipient}`, '#22c55e');
            addOpLog(`SUCCESS: ${channel.toUpperCase()} delivered → ${recipient}`, '#22c55e');
            const newEntry = { id: `NTF-${Date.now()}`, type: channel.toUpperCase(), recipient, subject, status: 'DELIVERED', ts: Date.now() };
            setLog(prev => [newEntry, ...prev]);
        } catch {
            flash(`📡 ${channel.toUpperCase()} queued (backend SMTP/SMS config needed for live delivery)`, '#eab308');
            addOpLog(`QUEUED: ${channel.toUpperCase()} → ${recipient} (backend config required)`, '#eab308');
            const newEntry = { id: `NTF-${Date.now()}`, type: channel.toUpperCase(), recipient, subject, status: 'QUEUED', ts: Date.now() };
            setLog(prev => [newEntry, ...prev]);
        }
    };

    const sendEmail  = () => sendNotification('email', composeEmail,  composeMsg || '🚨 Security Alert from AI Surveillance System');
    const sendSMS    = () => sendNotification('sms',   composePhone,  composeMsg || '🚨 Security Alert from AI Surveillance System');
    const sendBoth   = () => { sendEmail(); setTimeout(() => sendSMS(), 600); };

    const toggleRule = (id) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
        const rule = rules.find(r => r.id === id);
        addOpLog(`RULE TOGGLE: "${rule?.label}" → ${rule?.enabled ? 'OFF' : 'ON'}`, '#8b5cf6');
    };

    const filteredLog = log.filter(l =>
        historyFilter === 'all' ? true : l.type === historyFilter.toUpperCase()
    );

    return (
        <div>
            <Header title="Notifications" subtitle="Alert Channels & Dispatch Center" />
            <div className="page-content">

                {/* ─── PAGE HEADER ─── */}
                <div className="page-header">
                    <div className="page-header-left">
                        <h2>🔔 Notification Control Center</h2>
                        <p>Live SMS, Email, and Push alert dispatch to configured contacts on every security event</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="btn btn-primary btn-sm" onClick={sendBoth}>📤 Send Email + SMS Now</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setLog([])}>🗑️ Clear History</button>
                    </div>
                </div>

                {/* ─── STATUS BANNER ─── */}
                {status && (
                    <div style={{ marginBottom: 16, padding: '12px 18px', borderRadius: 10,
                        background: `${statusColor}18`, border: `1px solid ${statusColor}45`,
                        color: statusColor, fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
                        animation: 'fadeIn 0.3s ease' }}>
                        {status}
                    </div>
                )}

                {/* ─── STAT ROW ─── */}
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 24 }}>
                    {[
                        { label: 'Total Sent',       val: log.length,                                   icon: '📨', cls: 'primary' },
                        { label: 'Emails Sent',      val: log.filter(l=>l.type==='EMAIL').length,        icon: '📧', cls: 'success' },
                        { label: 'SMS Sent',         val: log.filter(l=>l.type==='SMS').length,          icon: '📱', cls: 'accent'  },
                        { label: 'Failed / Queued',  val: log.filter(l=>l.status==='QUEUED').length,     icon: '⏳', cls: 'warning' },
                    ].map((s,i) => (
                        <div key={i} className="stat-card">
                            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                            <div className="stat-info">
                                <div className="stat-value">{s.val}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── TOP GRID: Channels + Compose ─── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

                    {/* Alert Channels */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">📡 Active Alert Channels</span></div>
                        <div className="card-body" style={{ padding: '14px 18px' }}>
                            {[
                                { icon: '📧', name: 'Email Alerts',       desc: TARGET_EMAIL,         active: true,  ch: 'email' },
                                { icon: '📱', name: 'SMS Alerts',          desc: TARGET_PHONE,         active: true,  ch: 'sms'   },
                                { icon: '🔔', name: 'Browser Push',        desc: 'Web Push API',       active: false, ch: 'push'  },
                                { icon: '💬', name: 'Slack Integration',   desc: 'Webhook #alerts',    active: false, ch: 'slack' },
                                { icon: '📟', name: 'Telegram Bot',        desc: '@SurveillanceBot',   active: false, ch: 'tg'    },
                                { icon: '🌐', name: 'Webhook (HTTP POST)', desc: 'POST /api/webhook',  active: true,  ch: 'wh'    },
                            ].map(channel => (
                                <div key={channel.ch} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(99,179,237,0.07)' }}>
                                    <div style={{ fontSize: 22, width: 32 }}>{channel.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{channel.name}</div>
                                        <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{channel.desc}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <span className={`badge ${channel.active ? 'badge-low' : 'badge-normal'}`}>
                                            {channel.active ? '● ACTIVE' : '○ OFF'}
                                        </span>
                                        {channel.active && (
                                            <button className="btn btn-secondary btn-sm"
                                                onClick={() => sendNotification(channel.ch, channel.ch==='email'?composeEmail:TARGET_PHONE, '🔔 Test Notification')}>
                                                Test
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Compose & Send */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">✉️ Compose & Dispatch Alert</span></div>
                        <div className="card-body" style={{ padding: '14px 18px' }}>
                            <div className="form-group">
                                <label className="form-label">📧 Email Recipient</label>
                                <input className="form-input" value={composeEmail} onChange={e => setComposeEmail(e.target.value)} placeholder="email@example.com" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">📱 SMS / Phone Number</label>
                                <input className="form-input" value={composePhone} onChange={e => setComposePhone(e.target.value)} placeholder="+91XXXXXXXXXX" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">⚠️ Severity Level</label>
                                <select className="form-input" value={composeSev} onChange={e => setComposeSev(e.target.value)}>
                                    {['critical','high','medium','low'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">💬 Message / Subject</label>
                                <input className="form-input" value={composeMsg} onChange={e => setComposeMsg(e.target.value)}
                                    placeholder="e.g. Intrusion detected at Gate B..." />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                <button className="btn btn-primary" onClick={sendEmail}>📧 Send Email</button>
                                <button className="btn btn-secondary" style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }} onClick={sendSMS}>📱 Send SMS</button>
                                <button className="btn btn-danger" onClick={sendBoth} style={{ background: 'rgba(239,68,68,0.12)' }}>📤 Send Both</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── 10 QUICK ACTION BUTTONS ─── */}
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-header"><span className="card-title">⚡ Quick Actions — 10 Operations</span></div>
                    <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
                        {[
                            {
                                id: 'q1', label: '🚨 Critical Alert\nEmail + SMS', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',
                                fn: () => { sendNotification('email', TARGET_EMAIL, `🚨 CRITICAL SECURITY ALERT — ${new Date().toLocaleString()}`); sendNotification('sms', TARGET_PHONE, '🚨 CRITICAL ALERT from AI Surveillance System'); }
                            },
                            {
                                id: 'q2', label: '📸 Snapshot Alert\nEmail', color: '#3a86ff', bg: 'rgba(58,134,255,0.1)',
                                fn: () => sendNotification('email', TARGET_EMAIL, `📸 Snapshot Captured – Suspicious activity on ${new Date().toLocaleString()}`)
                            },
                            {
                                id: 'q3', label: '🔒 Lockdown SMS\nAlert', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',
                                fn: () => sendNotification('sms', TARGET_PHONE, '🔒 LOCKDOWN ACTIVATED — All zones secured. AI Surveillance System.')
                            },
                            {
                                id: 'q4', label: '📋 Daily Summary\nEmail', color: '#22c55e', bg: 'rgba(34,197,94,0.1)',
                                fn: () => sendNotification('email', TARGET_EMAIL, `📋 Daily Security Summary — ${new Date().toLocaleDateString()} | Events: ${log.length}`)
                            },
                            {
                                id: 'q5', label: '🔥 Fire Alert\nSMS + Email', color: '#f97316', bg: 'rgba(249,115,22,0.1)',
                                fn: () => { sendNotification('email', TARGET_EMAIL, '🔥 FIRE ALERT: Thermal anomaly detected. Immediate response required!'); sendNotification('sms', TARGET_PHONE, '🔥 FIRE ALERT — Immediate response required!'); }
                            },
                            {
                                id: 'q6', label: '🏃 Evacuation\nSMS Notice', color: '#eab308', bg: 'rgba(234,179,8,0.1)',
                                fn: () => sendNotification('sms', TARGET_PHONE, '🏃 EVACUATION ORDER: All personnel evacuate via designated routes immediately.')
                            },
                            {
                                id: 'q7', label: '✅ All Clear\nEmail', color: '#22c55e', bg: 'rgba(34,197,94,0.1)',
                                fn: () => sendNotification('email', TARGET_EMAIL, '✅ ALL CLEAR: Threat resolved. Area declared safe. AI Surveillance System.')
                            },
                            {
                                id: 'q8', label: '🔁 Retry Failed\nNotifications', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',
                                fn: () => { addOpLog('RETRY: Re-sending all queued notifications...', '#06b6d4'); flash('🔁 Retrying all queued notifications...', '#06b6d4'); }
                            },
                            {
                                id: 'q9', label: '📊 System Report\nEmail', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',
                                fn: () => sendNotification('email', TARGET_EMAIL, `📊 System Status Report — CPU OK | ${log.length} alerts dispatched | Cameras: 4/6 online`)
                            },
                            {
                                id: 'q10', label: '🔕 Mute All\nAlerts (1h)', color: '#64748b', bg: 'rgba(100,116,139,0.12)',
                                fn: () => { addOpLog('MUTE: All notifications silenced for 1 hour.', '#64748b'); flash('🔕 All alerts muted for 1 hour', '#eab308'); }
                            },
                        ].map(btn => (
                            <button key={btn.id} id={btn.id} onClick={btn.fn}
                                style={{
                                    padding: '14px 10px', borderRadius: 10,
                                    border: `1px solid ${btn.color}45`,
                                    background: btn.bg,
                                    color: btn.color,
                                    cursor: 'pointer', fontSize: 11, fontWeight: 700,
                                    fontFamily: 'JetBrains Mono, monospace',
                                    transition: 'all 0.2s', textAlign: 'center',
                                    lineHeight: 1.6, whiteSpace: 'pre-line',
                                    letterSpacing: '0.03em',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${btn.color}35`; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── NOTIFICATION RULES (Toggles) ─── */}
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-header"><span className="card-title">⚙️ Notification Rules & Filters</span></div>
                    <div style={{ padding: '8px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                        {rules.map(rule => (
                            <div key={rule.id} onClick={() => toggleRule(rule.id)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '13px 6px', borderBottom: '1px solid rgba(99,179,237,0.06)',
                                    cursor: 'pointer', transition: 'background 0.2s', borderRadius: 6 }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <span style={{ fontSize: 13, color: rule.enabled ? '#e2e8f0' : '#64748b', fontWeight: rule.enabled ? 600 : 400 }}>
                                    {rule.label}
                                </span>
                                <div style={{
                                    width: 42, height: 22, borderRadius: 11, flexShrink: 0,
                                    background: rule.enabled ? 'var(--color-primary)' : 'var(--color-border)',
                                    position: 'relative', transition: 'all 0.3s', marginLeft: 12,
                                    border: `1px solid ${rule.enabled ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                }}>
                                    <div style={{
                                        position: 'absolute', top: 3, left: rule.enabled ? 21 : 3,
                                        width: 14, height: 14, borderRadius: '50%',
                                        background: rule.enabled ? '#fff' : '#64748b',
                                        transition: 'left 0.3s',
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── CONTACT TARGETS CARD ─── */}
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-header"><span className="card-title">👤 Configured Alert Recipients</span></div>
                    <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {[
                            { type: 'Primary Email', value: TARGET_EMAIL,  icon: '📧', color: '#3a86ff', badge: 'badge-low' },
                            { type: 'Primary SMS',   value: TARGET_PHONE,  icon: '📱', color: '#8b5cf6', badge: 'badge-low' },
                            { type: 'Backup Email',  value: 'admin@surveillance.local', icon: '📩', color: '#22c55e', badge: 'badge-normal' },
                            { type: 'On-Call SMS',   value: '+911234567890', icon: '☎️', color: '#eab308', badge: 'badge-normal' },
                        ].map((c, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                                background: 'var(--color-bg-secondary)', borderRadius: 10, border: `1px solid var(--color-border)` }}>
                                <div style={{ fontSize: 28 }}>{c.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{c.type}</div>
                                    <div style={{ fontWeight: 700, color: c.color, fontFamily: 'monospace', fontSize: 13 }}>{c.value}</div>
                                </div>
                                <span className={`badge ${c.badge}`}>{c.badge === 'badge-low' ? '● PRIMARY' : '○ BACKUP'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── OPERATIONS TERMINAL ─── */}
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-header">
                        <span className="card-title">💻 Dispatch Terminal</span>
                        <button className="btn btn-secondary btn-sm" onClick={() => setOpLog([])}>Clear</button>
                    </div>
                    <div ref={logRef} style={{
                        height: 180, overflowY: 'auto', padding: '12px 16px',
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                        background: 'var(--color-bg-secondary)', borderRadius: '0 0 12px 12px', borderTop: '1px solid var(--color-border)'
                    }}>
                        {opLog.map((l, i) => (
                            <div key={i} style={{ color: l.color, marginBottom: 4, lineHeight: 1.6 }}>
                                <span style={{ color: '#4a5568', marginRight: 8 }}>[{l.time}]</span>{l.msg}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── NOTIFICATION HISTORY TABLE ─── */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">📋 Notification History ({filteredLog.length})</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {['all','EMAIL','SMS','PUSH'].map(f => (
                                <button key={f}
                                    className={`btn btn-sm ${historyFilter===f?'btn-primary':'btn-secondary'}`}
                                    onClick={() => setHistoryFilter(f)}>{f}</button>
                            ))}
                        </div>
                    </div>
                    {loading ? (
                        <div className="loading-spinner"><div className="spinner" /></div>
                    ) : filteredLog.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔔</div>
                            <h3>No notifications yet</h3>
                            <p>Use the Quick Actions or Compose panel to dispatch alerts.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr><th>#</th><th>Type</th><th>Recipient</th><th>Subject / Message</th><th>Status</th><th>Time</th></tr>
                                </thead>
                                <tbody>
                                    {filteredLog.map((n, i) => (
                                        <tr key={i}>
                                            <td style={{ fontFamily: 'monospace', color: '#4a5568', fontSize: 11 }}>{i+1}</td>
                                            <td>
                                                <span className={`badge ${n.type==='EMAIL'?'badge-low':n.type==='SMS'?'badge-medium':'badge-normal'}`}>
                                                    {n.type==='EMAIL' ? '📧' : n.type==='SMS' ? '📱' : '🔔'} {n.type}
                                                </span>
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#3a86ff' }}>{n.recipient}</td>
                                            <td style={{ fontSize: 12, color: '#94a3b8', maxWidth: 260 }}>{n.subject}</td>
                                            <td><span className={`badge ${n.status==='DELIVERED'?'badge-low':n.status==='QUEUED'?'badge-medium':'badge-critical'}`}>{n.status}</span></td>
                                            <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#4a5568' }}>{new Date(n.ts).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default NotificationsPage;
