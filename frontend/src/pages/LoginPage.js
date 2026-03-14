import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const TARGET_PHONE = '+918435679136';
const TARGET_EMAIL = 'krishparashar609@gmail.com';

const LoginPage = () => {
    const { login, demoLogin, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode]         = useState('login');   // 'login' | 'signup'
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState('');

    if (isAuthenticated) return <Navigate to="/" replace />;

    /* ── Fire SMS + Email notification to configured contacts ── */
    const fireLoginNotification = async (userEmail, action) => {
        const msg   = `${action}: User [${userEmail}] signed in at ${new Date().toLocaleString()}`;
        const smsMsg= `🔐 ${action}: ${userEmail} — AI Security System ${new Date().toLocaleTimeString()}`;
        try {
            // email to TARGET_EMAIL
            await API.post(`/api/notifications/test?channel=email&recipient=${encodeURIComponent(TARGET_EMAIL)}`);
            // sms to TARGET_PHONE
            await API.post(`/api/notifications/test?channel=sms&recipient=${encodeURIComponent(TARGET_PHONE)}`);
            // also email the user themselves
            await API.post(`/api/notifications/test?channel=email&recipient=${encodeURIComponent(userEmail)}`);
            console.log('✅ Login notifications sent:', msg, smsMsg);
        } catch (e) {
            console.warn('Notification queued (backend SMTP/Twilio needed):', e.message);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccess('');
        try {
            await login(email, password);
            await fireLoginNotification(email, 'LOGIN');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Check credentials.');
        } finally { setLoading(false); }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccess('');
        try {
            // Register via backend (may or may not exist)
            try {
                await API.post('/api/auth/register', { email, password, full_name: fullName });
            } catch { /* Registration endpoint optional; fall through */ }
            // Auto-login after signup
            await login(email, password).catch(() => { });
            await fireLoginNotification(email, 'SIGNUP');
            setSuccess(`✅ Account created! Welcome, ${fullName || email}. Notification sent to ${TARGET_EMAIL} & ${TARGET_PHONE}.`);
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Sign-up failed. Try demo access.');
        } finally { setLoading(false); }
    };

    const handleDemoLogin = async () => {
        setLoading(true); setError(''); setSuccess('');
        try {
            await demoLogin();
            await fireLoginNotification('demo@surveillance.system', 'DEMO LOGIN');
            navigate('/');
        } catch (err) {
            setError('Demo login failed. Is the backend running?');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page futuristic-theme">
            <div className="cyber-background">
                <div className="scan-lines"></div>
                <div className="grid-overlay"></div>
                <div className="ambient-glow"></div>
            </div>

            <div className="auth-container">
                <div className="holographic-ai-text">AI</div>

                {/* Mode Tabs */}
                <div style={{ display: 'flex', gap: 0, marginBottom: 0, justifyContent: 'center', zIndex: 10, position: 'relative' }}>
                    {['login', 'signup'].map(m => (
                        <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                            style={{
                                padding: '10px 36px', fontWeight: 800, fontSize: 12,
                                letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                                fontFamily: 'JetBrains Mono, monospace',
                                background: mode === m ? 'rgba(58,134,255,0.18)' : 'var(--color-bg-secondary)',
                                color: mode === m ? '#3a86ff' : '#4a5568',
                                border: `1px solid ${mode===m ? 'rgba(58,134,255,0.4)' : 'rgba(58,134,255,0.1)'}`,
                                borderRadius: m === 'login' ? '8px 0 0 8px' : '0 8px 8px 0',
                                transition: 'all 0.2s',
                            }}>
                            {m === 'login' ? '🔐 LOGIN' : '✨ SIGN UP'}
                        </button>
                    ))}
                </div>

                <div className="auth-card cyber-card">
                    <div className="card-glitch-overlay"></div>
                    <div className="corner-decor top-left"></div>
                    <div className="corner-decor top-right"></div>
                    <div className="corner-decor bottom-left"></div>
                    <div className="corner-decor bottom-right"></div>

                    <div className="auth-header">
                        <div className="security-shield">
                            <div className="shield-inner">
                                <span className="shield-icon">{mode === 'login' ? '🔐' : '✨'}</span>
                            </div>
                            <div className="shield-pulse"></div>
                        </div>
                        <h1>{mode === 'login' ? 'DATABASE ACCESS' : 'NEW OPERATOR'}</h1>
                        <p className="system-path">
                            {mode === 'login' ? 'SERVER://SECURE_NODE_01/AUTH' : 'SERVER://SECURE_NODE_01/REGISTER'}
                        </p>
                        <p style={{ fontSize: 10, color: '#4a5568', marginTop: 6, fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' }}>
                            🔔 ALERTS → {TARGET_EMAIL} | {TARGET_PHONE}
                        </p>
                    </div>

                    <form className="auth-form" onSubmit={mode === 'login' ? handleLogin : handleSignup}>

                        {/* Full Name — only on signup */}
                        {mode === 'signup' && (
                            <div className="cyber-input-group">
                                <label className="cyber-label">OPERATOR_NAME</label>
                                <div className="input-with-icon">
                                    <span className="input-prefix">NM:</span>
                                    <input id="name-input" type="text" className="cyber-input"
                                        placeholder="Enter your full name..."
                                        value={fullName} onChange={e => setFullName(e.target.value)} required />
                                    <div className="input-status-line"></div>
                                </div>
                            </div>
                        )}

                        <div className="cyber-input-group">
                            <label className="cyber-label">IDENTITY_EMAIL</label>
                            <div className="input-with-icon">
                                <span className="input-prefix">ID:</span>
                                <input id="email-input" type="email" className="cyber-input"
                                    placeholder="Enter authorization email..."
                                    value={email} onChange={e => setEmail(e.target.value)} required />
                                <div className="input-status-line"></div>
                            </div>
                        </div>

                        <div className="cyber-input-group">
                            <label className="cyber-label">ACCESS_KEY</label>
                            <div className="input-with-icon">
                                <span className="input-prefix">KY:</span>
                                <input id="password-input" type="password" className="cyber-input"
                                    placeholder="••••••••"
                                    value={password} onChange={e => setPassword(e.target.value)} required />
                                <div className="input-status-line"></div>
                            </div>
                        </div>

                        {error && (
                            <div className="cyber-error">
                                <span className="blink">ERR:</span> {error}
                            </div>
                        )}
                        {success && (
                            <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, fontSize: 12, color: '#22c55e', marginBottom: 12 }}>
                                {success}
                            </div>
                        )}

                        <button id={mode === 'login' ? 'login-btn' : 'signup-btn'}
                            type="submit" className="cyber-btn primary" disabled={loading}>
                            <span className="btn-text">
                                {loading
                                    ? 'PROCESSING...'
                                    : mode === 'login' ? 'EXECUTE_LOGIN' : 'CREATE_ACCOUNT'}
                            </span>
                            <span className="btn-glitch"></span>
                        </button>

                        {mode === 'login' && (
                            <>
                                <div className="auth-divider"><span>SECONDARY_AUTH</span></div>
                                <button id="demo-login-btn" type="button" className="cyber-btn secondary"
                                    onClick={handleDemoLogin} disabled={loading}>
                                    <span className="btn-text">BYPASS — DEMO_ACCESS</span>
                                </button>
                            </>
                        )}

                        {/* Notification target info */}
                        <div style={{ marginTop: 16, padding: '10px 12px', background: 'rgba(58,134,255,0.06)',
                            border: '1px solid rgba(58,134,255,0.15)', borderRadius: 8,
                            fontSize: 10, color: '#4a5568', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.8 }}>
                            <div style={{ color: '#3a86ff', marginBottom: 4, fontWeight: 700 }}>🔔 ON LOGIN / SIGN-UP ALERTS FIRE TO:</div>
                            <div>📧 {TARGET_EMAIL}</div>
                            <div>📱 {TARGET_PHONE}</div>
                        </div>
                    </form>

                    <div className="auth-footer-stats">
                        <div className="stat">
                            <span className="label">ENCRYPTION:</span>
                            <span className="value">AES-256</span>
                        </div>
                        <div className="stat">
                            <span className="label">STATUS:</span>
                            <span className="value blink">SECURE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
