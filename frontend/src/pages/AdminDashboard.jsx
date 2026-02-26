import { useState, useEffect } from 'react';
import API from '../services/api';
import { PageLoader } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiUsers,
    HiChatBubbleLeftRight,
    HiUserGroup,
    HiBookOpen,
    HiRocketLaunch,
    HiTrash,
    HiShieldCheck,
    HiChartBar,
    HiArrowTrendingUp,
    HiSparkles,
    HiCalendarDays,
    HiUserPlus,
} from 'react-icons/hi2';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [tab, setTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [tab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Always fetch analytics for real stats
            const { data: analyticsRes } = await API.get('/admin/analytics');
            setStats(analyticsRes.data);

            if (tab === 'users') {
                const { data } = await API.get('/admin/users');
                setUsers(data.data);
            }
            if (tab === 'posts') {
                const { data } = await API.get('/admin/posts');
                setPosts(data.data);
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Are you sure you want to delete this user and all their posts?')) return;
        try {
            await API.delete(`/admin/users/${id}`);
            toast.success('User deleted');
            fetchData();
        } catch (e) {
            toast.error('Failed to delete user');
        }
    };

    const handleDeletePost = async (id) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await API.delete(`/admin/posts/${id}`);
            toast.success('Post deleted');
            fetchData();
        } catch (e) {
            toast.error('Failed to delete post');
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: HiChartBar },
        { id: 'users', label: 'Users', icon: HiUsers },
        { id: 'posts', label: 'Posts', icon: HiChatBubbleLeftRight },
    ];

    if (loading && !stats) return <PageLoader />;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <HiShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">Manage your platform</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[var(--border)] pb-1">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-medium transition-all ${tab === t.id
                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                            }`}
                    >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <PageLoader />
            ) : (
                <>
                    {/* ===== OVERVIEW TAB ===== */}
                    {tab === 'overview' && stats && (
                        <div className="space-y-6">
                            {/* Primary Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                {[
                                    { label: 'Total Users', value: stats.totalUsers, icon: HiUsers, color: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
                                    { label: 'Total Posts', value: stats.totalPosts, icon: HiChatBubbleLeftRight, color: 'bg-gradient-to-br from-violet-500 to-purple-600' },
                                    { label: 'Total Groups', value: stats.totalGroups, icon: HiUserGroup, color: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
                                    { label: 'Resources', value: stats.totalResources, icon: HiBookOpen, color: 'bg-gradient-to-br from-amber-500 to-orange-600' },
                                    { label: 'Opportunities', value: stats.totalOpportunities, icon: HiRocketLaunch, color: 'bg-gradient-to-br from-rose-500 to-pink-600' },
                                ].map((s, i) => (
                                    <div key={i} className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-5 hover:shadow-md transition-shadow">
                                        <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                                            <s.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <p className="text-2xl font-bold text-[var(--text-primary)]">{s.value ?? 0}</p>
                                        <p className="text-sm text-[var(--text-muted)] mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Secondary Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* New Users This Week */}
                                <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <HiUserPlus className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span className="text-sm text-[var(--text-muted)]">New This Week</span>
                                    </div>
                                    <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.newUsersThisWeek ?? 0}</p>
                                    <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                                        <HiArrowTrendingUp className="w-3.5 h-3.5" />
                                        new sign-ups in the last 7 days
                                    </p>
                                </div>

                                {/* User Breakdown */}
                                <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                            <HiUsers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <span className="text-sm text-[var(--text-muted)]">User Breakdown</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[var(--text-secondary)]">Students</span>
                                            <span className="font-semibold text-[var(--text-primary)]">{stats.studentCount ?? 0}</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-indigo-500 transition-all"
                                                style={{ width: stats.totalUsers ? `${(stats.studentCount / stats.totalUsers) * 100}%` : '0%' }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[var(--text-secondary)]">Admins</span>
                                            <span className="font-semibold text-[var(--text-primary)]">{stats.adminCount ?? 0}</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-red-500 transition-all"
                                                style={{ width: stats.totalUsers ? `${(stats.adminCount / stats.totalUsers) * 100}%` : '0%' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Platform Health */}
                                <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <HiSparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <span className="text-sm text-[var(--text-muted)]">Platform Health</span>
                                    </div>
                                    <div className="space-y-2.5">
                                        {[
                                            { label: 'Posts per User', value: stats.totalUsers ? (stats.totalPosts / stats.totalUsers).toFixed(1) : '0' },
                                            { label: 'Groups per User', value: stats.totalUsers ? (stats.totalGroups / stats.totalUsers).toFixed(1) : '0' },
                                            { label: 'Resources per User', value: stats.totalUsers ? (stats.totalResources / stats.totalUsers).toFixed(1) : '0' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-sm text-[var(--text-secondary)]">{item.label}</span>
                                                <span className="font-semibold text-[var(--text-primary)]">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Growth Chart */}
                            {stats.monthlyData && stats.monthlyData.length > 0 && (
                                <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <HiCalendarDays className="w-5 h-5 text-indigo-500" />
                                        <h3 className="font-semibold text-[var(--text-primary)]">Monthly Growth (Last 6 Months)</h3>
                                    </div>
                                    <div className="grid grid-cols-6 gap-3">
                                        {stats.monthlyData.map((month, i) => {
                                            const maxUsers = Math.max(...stats.monthlyData.map(m => m.users), 1);
                                            const maxPosts = Math.max(...stats.monthlyData.map(m => m.posts), 1);
                                            return (
                                                <div key={i} className="text-center">
                                                    <div className="flex gap-1 items-end justify-center h-24 mb-2">
                                                        {/* Users bar */}
                                                        <div
                                                            className="w-4 rounded-t-md bg-indigo-500 transition-all"
                                                            style={{ height: `${Math.max((month.users / maxUsers) * 100, 4)}%` }}
                                                            title={`${month.users} users`}
                                                        />
                                                        {/* Posts bar */}
                                                        <div
                                                            className="w-4 rounded-t-md bg-purple-400 transition-all"
                                                            style={{ height: `${Math.max((month.posts / maxPosts) * 100, 4)}%` }}
                                                            title={`${month.posts} posts`}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-[var(--text-muted)]">{month.month}</p>
                                                    <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">{month.users}u · {month.posts}p</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[var(--border)]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm bg-indigo-500" />
                                            <span className="text-xs text-[var(--text-muted)]">New Users</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm bg-purple-400" />
                                            <span className="text-xs text-[var(--text-muted)]">New Posts</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== USERS TAB ===== */}
                    {tab === 'users' && (
                        <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] overflow-hidden">
                            <div className="px-6 py-4 border-b border-[var(--border)]">
                                <h3 className="font-semibold text-[var(--text-primary)]">
                                    All Users ({users.length})
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[var(--bg-secondary)]">
                                        <tr className="text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                            <th className="px-6 py-3">User</th>
                                            <th className="px-6 py-3">Email</th>
                                            <th className="px-6 py-3">College</th>
                                            <th className="px-6 py-3">Points</th>
                                            <th className="px-6 py-3">Role</th>
                                            <th className="px-6 py-3">Joined</th>
                                            <th className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {users.map((u) => (
                                            <tr key={u._id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                                                            {u.avatar ? (
                                                                <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                                                            ) : (
                                                                <span className="text-white text-xs font-bold">{u.name?.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-sm text-[var(--text-primary)]">{u.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{u.email}</td>
                                                <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{u.college || '—'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-1 text-sm font-medium text-amber-500">
                                                        <HiSparkles className="w-3.5 h-3.5" />
                                                        {u.points ?? 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${u.role === 'admin'
                                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                            : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                                                    {u.createdAt ? formatDistanceToNow(new Date(u.createdAt), { addSuffix: true }) : '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {u.role !== 'admin' && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u._id)}
                                                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                                            title="Delete user"
                                                        >
                                                            <HiTrash className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {users.length === 0 && (
                                <div className="text-center py-12 text-[var(--text-muted)]">No users found</div>
                            )}
                        </div>
                    )}

                    {/* ===== POSTS TAB ===== */}
                    {tab === 'posts' && (
                        <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] overflow-hidden">
                            <div className="px-6 py-4 border-b border-[var(--border)]">
                                <h3 className="font-semibold text-[var(--text-primary)]">
                                    All Posts ({posts.length})
                                </h3>
                            </div>
                            <div className="divide-y divide-[var(--border)]">
                                {posts.map((p) => (
                                    <div key={p._id} className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--bg-secondary)] transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-sm font-bold">{p.author?.name?.charAt(0) || '?'}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm text-[var(--text-primary)] truncate">{p.title}</h4>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-xs text-[var(--text-muted)]">By {p.author?.name || 'Unknown'}</span>
                                                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded-md font-medium">{p.category}</span>
                                                <span className="text-xs text-[var(--text-muted)]">❤️ {p.likesCount ?? 0}</span>
                                                <span className="text-xs text-[var(--text-muted)]">💬 {p.commentsCount ?? 0}</span>
                                                <span className="text-xs text-[var(--text-muted)]">👁 {p.views ?? 0}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-[var(--text-muted)] hidden sm:block">
                                            {p.createdAt ? formatDistanceToNow(new Date(p.createdAt), { addSuffix: true }) : ''}
                                        </span>
                                        <button
                                            onClick={() => handleDeletePost(p._id)}
                                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-[var(--text-muted)] hover:text-red-500 transition-colors flex-shrink-0"
                                            title="Delete post"
                                        >
                                            <HiTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {posts.length === 0 && (
                                <div className="text-center py-12 text-[var(--text-muted)]">No posts found</div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
