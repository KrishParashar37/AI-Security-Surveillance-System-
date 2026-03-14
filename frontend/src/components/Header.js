import React from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';

const Header = ({ title, subtitle }) => {
    const { user } = useAuth();

    return (
        <header className="header">
            <div>
                <span className="header-title">{title}</span>
                {subtitle && <span className="header-subtitle">/ {subtitle}</span>}
            </div>

            <div className="header-actions">
                <div className="live-indicator">
                    <div className="live-dot" />
                    LIVE
                </div>

                {/* 🎨 Theme Switcher — changes colors on all pages */}
                <ThemeSwitcher />

                <button id="notifications-btn" className="header-btn" title="Notifications">
                    🔔
                    <span className="notification-badge">7</span>
                </button>

                <button id="refresh-btn" className="header-btn" title="Refresh"
                    onClick={() => window.location.reload()}>
                    🔄
                </button>

                <div
                    id="user-avatar"
                    className="user-avatar"
                    title={user?.name || 'Admin'}
                >
                    {(user?.name?.[0] || 'A').toUpperCase()}
                </div>
            </div>
        </header>
    );
};

export default Header;
