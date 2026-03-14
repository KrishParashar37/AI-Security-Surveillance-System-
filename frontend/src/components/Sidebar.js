import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { label: 'Overview', icon: '📊', path: '/', section: 'main' },
    { label: 'Live Cameras', icon: '📷', path: '/cameras', section: 'main' },
    { label: 'Alerts', icon: '🚨', path: '/alerts', section: 'main', badge: 7 },
    { label: 'Detection Log', icon: '🔍', path: '/detection', section: 'analysis' },
    { label: 'Analytics', icon: '📈', path: '/analytics', section: 'analysis' },
    { label: 'Notifications', icon: '🔔', path: '/notifications', section: 'analysis' },
    { label: 'Settings', icon: '⚙️', path: '/settings', section: 'system' },
];

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const mainItems = navItems.filter(i => i.section === 'main');
    const analysisItems = navItems.filter(i => i.section === 'analysis');
    const systemItems = navItems.filter(i => i.section === 'system');

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">🛡️</div>
                <div className="logo-text">
                    <h1>SecureVision AI</h1>
                    <span>Surveillance System</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <span className="nav-section-title">Main</span>
                {mainItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                        {item.badge && <span className="nav-badge">{item.badge}</span>}
                    </NavLink>
                ))}

                <span className="nav-section-title">Analysis</span>
                {analysisItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}

                <span className="nav-section-title">System</span>
                {systemItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}

                <div
                    className="nav-item"
                    onClick={handleLogout}
                    style={{ marginTop: 8, color: 'var(--color-critical)', cursor: 'pointer' }}
                >
                    <span className="nav-icon">🚪</span>
                    Logout
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="system-status">
                    <div className="status-dot" />
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            {user?.name || 'Admin'}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                            {user?.role?.toUpperCase() || 'ADMIN'} • System Online
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
