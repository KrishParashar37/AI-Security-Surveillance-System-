import React, { useState, useEffect, useRef } from 'react';

/* ─── All available themes ─── */
export const THEMES = [
    {
        id: 'monochrome',
        name: 'B&W (Dark)',
        emoji: '⚫',
        vars: {
            '--color-bg-primary':    '#000000',
            '--color-bg-secondary':  '#0a0a0a',
            '--color-bg-card':       '#111111',
            '--color-bg-card-hover': '#1a1a1a',
            '--color-border':        'rgba(255,255,255,0.15)',
            '--color-border-active': 'rgba(255,255,255,0.4)',
            '--color-primary':       '#ffffff',
            '--color-primary-glow':  'rgba(255,255,255,0.2)',
            '--color-secondary':     '#cccccc',
            '--color-accent':        '#888888',
            '--color-text-primary':  '#ffffff',
            '--color-text-secondary':'#a3a3a3',
            '--color-text-muted':    '#666666',
            '--shadow-card':         '0 4px 24px rgba(0,0,0,0.8)',
            '--shadow-glow':         '0 0 20px rgba(255,255,255,0.15)',
        }
    },
    {
        id: 'miicon-light',
        name: 'Dashboard White',
        emoji: '📱',
        vars: {
            '--color-bg-primary':    '#f0f4f8',      /* Light gray background */
            '--color-bg-secondary':  '#ffffff',      /* Card fallback */
            '--color-bg-card':       '#ffffff',      /* Pure white cards */
            '--color-bg-card-hover': '#f8fafc',
            '--color-border':        '#e2e8f0',
            '--color-border-active': '#cbd5e1',
            '--color-primary':       '#0ea5e9',      /* Soft blue accent */
            '--color-primary-glow':  'rgba(14, 165, 233, 0.15)',
            '--color-secondary':     '#22c55e',
            '--color-accent':        '#f59e0b',
            '--color-text-primary':  '#0f172a',      /* Dark text */
            '--color-text-secondary':'#475569',
            '--color-text-muted':    '#94a3b8',
            '--shadow-card':         '0 4px 12px rgba(0,0,0,0.05)',
            '--shadow-glow':         '0 0 16px rgba(14, 165, 233, 0.1)',
            /* Sidebar specialized styling -> Dark Blue sidebar */
            '--color-sidebar-bg':    '#052c43',
            '--color-sidebar-border':'#031f30',
            '--color-sidebar-text':  '#ffffff',
            '--color-sidebar-text-muted': '#93b6cf',
        }
    },
    {
        id: 'monochrome-light',
        name: 'B&W (Light)',
        emoji: '⚪',
        vars: {
            '--color-bg-primary':    '#ffffff',
            '--color-bg-secondary':  '#f5f5f5',
            '--color-bg-card':       '#ffffff',
            '--color-bg-card-hover': '#f0f0f0',
            '--color-border':        'rgba(0,0,0,0.15)',
            '--color-border-active': 'rgba(0,0,0,0.4)',
            '--color-primary':       '#000000',
            '--color-primary-glow':  'rgba(0,0,0,0.1)',
            '--color-secondary':     '#333333',
            '--color-accent':        '#666666',
            '--color-text-primary':  '#000000',
            '--color-text-secondary':'#4a4a4a',
            '--color-text-muted':    '#888888',
            '--shadow-card':         '0 4px 24px rgba(0,0,0,0.15)',
            '--shadow-glow':         '0 0 20px rgba(0,0,0,0.1)',
            '--color-sidebar-bg':    '#f5f5f5',
            '--color-sidebar-border':'rgba(0,0,0,0.15)',
            '--color-sidebar-text':  '#000000',
            '--color-sidebar-text-muted': '#666666',
        }
    },
    {
        id: 'cyber-dark',
        name: 'Cyber Dark',
        emoji: '🌑',
        vars: {
            '--color-bg-primary':    '#050811',
            '--color-bg-secondary':  '#0a0f1e',
            '--color-bg-card':       '#0d1526',
            '--color-bg-card-hover': '#111d35',
            '--color-border':        'rgba(99,179,237,0.12)',
            '--color-border-active': 'rgba(99,179,237,0.35)',
            '--color-primary':       '#3a86ff',
            '--color-primary-glow':  'rgba(58,134,255,0.25)',
            '--color-secondary':     '#06d6a0',
            '--color-accent':        '#8b5cf6',
            '--color-text-primary':  '#e2e8f0',
            '--color-text-secondary':'#94a3b8',
            '--color-text-muted':    '#4a5568',
            '--shadow-card':         '0 4px 24px rgba(0,0,0,0.4)',
            '--shadow-glow':         '0 0 20px rgba(58,134,255,0.15)',
        }
    },
    {
        id: 'ocean-blue',
        name: 'Ocean Blue',
        emoji: '🌊',
        vars: {
            '--color-bg-primary':    '#020c1b',
            '--color-bg-secondary':  '#0a192f',
            '--color-bg-card':       '#112240',
            '--color-bg-card-hover': '#1d3461',
            '--color-border':        'rgba(100,255,218,0.1)',
            '--color-border-active': 'rgba(100,255,218,0.35)',
            '--color-primary':       '#64ffda',
            '--color-primary-glow':  'rgba(100,255,218,0.2)',
            '--color-secondary':     '#57cbff',
            '--color-accent':        '#f87171',
            '--color-text-primary':  '#ccd6f6',
            '--color-text-secondary':'#8892b0',
            '--color-text-muted':    '#495670',
            '--shadow-card':         '0 4px 24px rgba(2,12,27,0.7)',
            '--shadow-glow':         '0 0 20px rgba(100,255,218,0.12)',
        }
    },
    {
        id: 'emerald-night',
        name: 'Emerald Night',
        emoji: '💚',
        vars: {
            '--color-bg-primary':    '#020f07',
            '--color-bg-secondary':  '#051a0f',
            '--color-bg-card':       '#0a2818',
            '--color-bg-card-hover': '#0f3822',
            '--color-border':        'rgba(34,197,94,0.12)',
            '--color-border-active': 'rgba(34,197,94,0.35)',
            '--color-primary':       '#22c55e',
            '--color-primary-glow':  'rgba(34,197,94,0.2)',
            '--color-secondary':     '#86efac',
            '--color-accent':        '#f59e0b',
            '--color-text-primary':  '#dcfce7',
            '--color-text-secondary':'#86efac',
            '--color-text-muted':    '#4d7c5f',
            '--shadow-card':         '0 4px 24px rgba(2,15,7,0.6)',
            '--shadow-glow':         '0 0 20px rgba(34,197,94,0.15)',
        }
    },
    {
        id: 'purple-galaxy',
        name: 'Purple Galaxy',
        emoji: '🔮',
        vars: {
            '--color-bg-primary':    '#0a020f',
            '--color-bg-secondary':  '#150520',
            '--color-bg-card':       '#1e0a30',
            '--color-bg-card-hover': '#2a0f40',
            '--color-border':        'rgba(139,92,246,0.15)',
            '--color-border-active': 'rgba(139,92,246,0.4)',
            '--color-primary':       '#a855f7',
            '--color-primary-glow':  'rgba(168,85,247,0.25)',
            '--color-secondary':     '#e879f9',
            '--color-accent':        '#fb7185',
            '--color-text-primary':  '#f3e8ff',
            '--color-text-secondary':'#c084fc',
            '--color-text-muted':    '#7e22ce',
            '--shadow-card':         '0 4px 24px rgba(10,2,15,0.6)',
            '--shadow-glow':         '0 0 20px rgba(168,85,247,0.18)',
        }
    },
    {
        id: 'red-alert',
        name: 'Red Alert',
        emoji: '🔴',
        vars: {
            '--color-bg-primary':    '#0f0202',
            '--color-bg-secondary':  '#1a0505',
            '--color-bg-card':       '#250808',
            '--color-bg-card-hover': '#350d0d',
            '--color-border':        'rgba(239,68,68,0.15)',
            '--color-border-active': 'rgba(239,68,68,0.4)',
            '--color-primary':       '#ef4444',
            '--color-primary-glow':  'rgba(239,68,68,0.25)',
            '--color-secondary':     '#f87171',
            '--color-accent':        '#fb923c',
            '--color-text-primary':  '#fee2e2',
            '--color-text-secondary':'#fca5a5',
            '--color-text-muted':    '#7f1d1d',
            '--shadow-card':         '0 4px 24px rgba(15,2,2,0.7)',
            '--shadow-glow':         '0 0 20px rgba(239,68,68,0.2)',
        }
    },
    {
        id: 'golden-ops',
        name: 'Golden Ops',
        emoji: '✨',
        vars: {
            '--color-bg-primary':    '#0d0a02',
            '--color-bg-secondary':  '#1a1405',
            '--color-bg-card':       '#261e07',
            '--color-bg-card-hover': '#352a0a',
            '--color-border':        'rgba(234,179,8,0.15)',
            '--color-border-active': 'rgba(234,179,8,0.4)',
            '--color-primary':       '#eab308',
            '--color-primary-glow':  'rgba(234,179,8,0.2)',
            '--color-secondary':     '#fbbf24',
            '--color-accent':        '#f97316',
            '--color-text-primary':  '#fef9c3',
            '--color-text-secondary':'#fde047',
            '--color-text-muted':    '#713f12',
            '--shadow-card':         '0 4px 24px rgba(13,10,2,0.6)',
            '--shadow-glow':         '0 0 20px rgba(234,179,8,0.18)',
        }
    },
    {
        id: 'arctic-light',
        name: 'Arctic Light',
        emoji: '🏔️',
        vars: {
            '--color-bg-primary':    '#f0f4f8',
            '--color-bg-secondary':  '#e2eaf3',
            '--color-bg-card':       '#ffffff',
            '--color-bg-card-hover': '#f8fafb',
            '--color-border':        'rgba(0,86,179,0.12)',
            '--color-border-active': 'rgba(0,86,179,0.35)',
            '--color-primary':       '#0056b3',
            '--color-primary-glow':  'rgba(0,86,179,0.15)',
            '--color-secondary':     '#0ea5e9',
            '--color-accent':        '#7c3aed',
            '--color-text-primary':  '#1e293b',
            '--color-text-secondary':'#475569',
            '--color-text-muted':    '#94a3b8',
            '--shadow-card':         '0 4px 24px rgba(0,0,0,0.08)',
            '--shadow-glow':         '0 0 16px rgba(0,86,179,0.1)',
        }
    },
    {
        id: 'teal-protocol',
        name: 'Teal Protocol',
        emoji: '🌀',
        vars: {
            '--color-bg-primary':    '#042330',
            '--color-bg-secondary':  '#063040',
            '--color-bg-card':       '#094155',
            '--color-bg-card-hover': '#0d5570',
            '--color-border':        'rgba(6,182,212,0.15)',
            '--color-border-active': 'rgba(6,182,212,0.4)',
            '--color-primary':       '#06b6d4',
            '--color-primary-glow':  'rgba(6,182,212,0.2)',
            '--color-secondary':     '#22d3ee',
            '--color-accent':        '#f0abfc',
            '--color-text-primary':  '#ecfeff',
            '--color-text-secondary':'#a5f3fc',
            '--color-text-muted':    '#164e63',
            '--shadow-card':         '0 4px 24px rgba(4,35,48,0.6)',
            '--shadow-glow':         '0 0 20px rgba(6,182,212,0.18)',
        }
    },
];

/* ─── Apply theme to document root ─── */
export const applyTheme = (theme) => {
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, val]) => root.style.setProperty(key, val));
    localStorage.setItem('app-theme', theme.id);
};

/* ─── Theme Switcher Panel Component ─── */
const ThemeSwitcher = () => {
    const [open, setOpen]           = useState(false);
    // Ignore completely what's in localstorage to fulfill the request forcefully
    const [activeId, setActiveId]   = useState('miicon-light');
    const panelRef                  = useRef(null);

    /* Apply saved theme on mount */
    useEffect(() => {
        const saved = THEMES.find(t => t.id === activeId) || THEMES[0];
        applyTheme(saved);
        
        // Force Miicon theme to apply immediately for the user's request
        const forcedMiicon = localStorage.getItem('forced-miicon-v3');
        if (!forcedMiicon) {
            const miiconTheme = THEMES.find(t => t.id === 'miicon-light');
            applyTheme(miiconTheme);
            setActiveId('miicon-light');
            localStorage.setItem('forced-miicon-v3', 'true');
        }
    }, [activeId]);

    /* Close on outside click */
    useEffect(() => {
        const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const select = (theme) => {
        applyTheme(theme);
        setActiveId(theme.id);
        setOpen(false);
    };

    const active = THEMES.find(t => t.id === activeId) || THEMES[0];

    return (
        <div ref={panelRef} style={{ position: 'relative' }}>
            {/* Trigger Button */}
            <button
                id="theme-switcher-btn"
                title="Change Theme"
                onClick={() => setOpen(v => !v)}
                style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border-active)',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer', fontSize: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    position: 'relative',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-card-hover)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg-card)'; e.currentTarget.style.borderColor = 'var(--color-border-active)'; }}
            >
                🎨
                {/* Active theme dot */}
                <div style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 9, height: 9, borderRadius: '50%',
                    background: active.vars['--color-primary'],
                    border: '2px solid var(--color-bg-primary)',
                    boxShadow: `0 0 6px ${active.vars['--color-primary']}`,
                }} />
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div style={{
                    position: 'absolute', top: 44, right: 0,
                    width: 300, zIndex: 9999,
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border-active)',
                    borderRadius: 14,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    animation: 'fadeIn 0.18s ease',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '14px 16px 10px',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-text-primary)', letterSpacing: '0.05em' }}>🎨 THEME SWITCHER</div>
                            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>Changes color on all pages instantly</div>
                        </div>
                        <button onClick={() => setOpen(false)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
                    </div>

                    {/* Theme Grid */}
                    <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {THEMES.map(theme => {
                            const isActive = theme.id === activeId;
                            return (
                                <button key={theme.id} onClick={() => select(theme)}
                                    style={{
                                        padding: '10px 10px',
                                        borderRadius: 10,
                                        border: isActive
                                            ? `2px solid ${theme.vars['--color-primary']}`
                                            : '1px solid rgba(255,255,255,0.07)',
                                        background: isActive
                                            ? `${theme.vars['--color-primary']}18`
                                            : 'rgba(255,255,255,0.03)',
                                        cursor: 'pointer', transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        textAlign: 'left',
                                    }}
                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                >
                                    {/* Color preview dots */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
                                        <div style={{ width: 22, height: 10, borderRadius: 3, background: theme.vars['--color-bg-card'] || '#111', border: '1px solid rgba(255,255,255,0.1)' }} />
                                        <div style={{ display: 'flex', gap: 2 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: theme.vars['--color-primary'] }} />
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: theme.vars['--color-secondary'] }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: isActive ? theme.vars['--color-primary'] : 'var(--color-text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
                                            {theme.emoji} {theme.name}
                                        </div>
                                        {isActive && <div style={{ fontSize: 9, color: theme.vars['--color-primary'], marginTop: 2 }}>● ACTIVE</div>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '8px 14px 12px', borderTop: '1px solid var(--color-border)', fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                        Theme is saved automatically and persists across sessions
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSwitcher;
