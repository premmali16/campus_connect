import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toggleDarkMode } from '../../store/slices/themeSlice';
import {
    HiHome,
    HiUserGroup,
    HiChatBubbleLeftRight,
    HiBookOpen,
    HiRocketLaunch,
    HiBell,
    HiUser,
    HiArrowRightOnRectangle,
    HiMoon,
    HiSun,
    HiBars3,
    HiXMark,
    HiMagnifyingGlass,
    HiShieldCheck,
    HiTrophy,
    HiEnvelope,
} from 'react-icons/hi2';

const Sidebar = ({ collapsed, setCollapsed }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { darkMode } = useSelector((state) => state.theme);

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: HiHome },
        { path: '/posts', label: 'Community', icon: HiChatBubbleLeftRight },
        { path: '/groups', label: 'Study Groups', icon: HiUserGroup },
        { path: '/resources', label: 'Resources', icon: HiBookOpen },
        { path: '/opportunities', label: 'Opportunities', icon: HiRocketLaunch },
        { path: '/messages', label: 'Messages', icon: HiEnvelope },
        { path: '/leaderboard', label: 'Leaderboard', icon: HiTrophy },
    ];

    const bottomItems = [
        { path: '/profile', label: 'Profile', icon: HiUser },
        { path: '/notifications', label: 'Notifications', icon: HiBell },
    ];

    if (user?.role === 'admin') {
        menuItems.push({ path: '/admin', label: 'Admin Panel', icon: HiShieldCheck });
    }

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const NavLink = ({ item }) => (
        <Link
            to={item.path}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? item.label : ''}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${collapsed ? 'justify-center' : ''}
                ${isActive(item.path)
                    ? 'bg-indigo-500/10 text-indigo-500 font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                }`}
        >
            <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.path) ? 'text-indigo-500' : 'group-hover:text-indigo-400'}`} />
            {!collapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
        </Link>
    );

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-[var(--bg-primary)] shadow-lg border border-[var(--border)]"
            >
                {mobileOpen ? <HiXMark className="w-5 h-5" /> : <HiBars3 className="w-5 h-5" />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 bg-[var(--bg-primary)] border-r border-[var(--border)]
                    ${collapsed ? 'w-[72px]' : 'w-64'}
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border)]">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">CC</span>
                    </div>
                    {!collapsed && (
                        <h1 className="font-bold text-base gradient-text whitespace-nowrap">Campus Connect</h1>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="ml-auto hidden lg:block p-1 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                        <HiBars3 className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                </div>

                {/* Search */}
                {!collapsed && (
                    <div className="px-3 py-3">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                            <HiMagnifyingGlass className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent text-sm outline-none flex-1 min-w-0 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                            />
                        </div>
                    </div>
                )}

                {/* Menu Items */}
                <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                    {!collapsed && (
                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-3 mb-2">
                            Menu
                        </p>
                    )}
                    {menuItems.map((item) => (
                        <NavLink key={item.path} item={item} />
                    ))}

                    <div className="pt-4 mt-4 border-t border-[var(--border)]">
                        {!collapsed && (
                            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-3 mb-2">
                                Account
                            </p>
                        )}
                        {bottomItems.map((item) => (
                            <NavLink key={item.path} item={item} />
                        ))}
                    </div>
                </nav>

                {/* Bottom Section */}
                <div className="px-3 py-3 border-t border-[var(--border)] space-y-2">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => dispatch(toggleDarkMode())}
                        title={collapsed ? (darkMode ? 'Light Mode' : 'Dark Mode') : ''}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors ${collapsed ? 'justify-center' : ''}`}
                    >
                        {darkMode ? (
                            <HiSun className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        ) : (
                            <HiMoon className="w-5 h-5 flex-shrink-0" />
                        )}
                        {!collapsed && <span className="text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                    </button>

                    {/* User Profile & Logout */}
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] ${collapsed ? 'justify-center' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <span className="text-white text-xs font-bold">
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </span>
                            )}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-[var(--text-primary)]">{user?.name}</p>
                                <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                            </div>
                        )}
                        {!collapsed && (
                            <button
                                onClick={handleLogout}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                title="Logout"
                            >
                                <HiArrowRightOnRectangle className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
