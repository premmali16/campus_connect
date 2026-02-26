import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * Main layout with sidebar for authenticated pages
 * Tracks sidebar collapsed state to adjust content margin
 */
const Layout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-[var(--bg-secondary)]">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <main
                className="flex-1 min-h-screen transition-all duration-300"
                style={{ marginLeft: collapsed ? '72px' : '256px' }}
            >
                {/* Mobile: no margin, handled by the toggle */}
                <style>{`
                    @media (max-width: 1023px) {
                        main { margin-left: 0 !important; }
                    }
                `}</style>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-16 lg:pt-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
