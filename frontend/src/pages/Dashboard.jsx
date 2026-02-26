import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTrendingPosts } from '../store/slices/postSlice';
import API from '../services/api';
import {
    HiChatBubbleLeftRight,
    HiUserGroup,
    HiBookOpen,
    HiRocketLaunch,
    HiArrowTrendingUp,
    HiHeart,
    HiEye,
    HiChatBubbleLeft,
    HiSparkles,
} from 'react-icons/hi2';

const StatCard = ({ icon: Icon, label, value, color, to }) => (
    <Link
        to={to}
        className="bg-[var(--bg-primary)] rounded-2xl p-5 border border-[var(--border)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
    >
        <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <HiArrowTrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">{label}</p>
    </Link>
);

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { trending } = useSelector((state) => state.posts);
    const [stats, setStats] = useState({ posts: 0, groups: 0, resources: 0, opportunities: 0 });
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        dispatch(fetchTrendingPosts());
        fetchStats();
    }, [dispatch]);

    const fetchStats = async () => {
        try {
            const [postsRes, groupsRes, resourcesRes, oppsRes] = await Promise.all([
                API.get('/posts?limit=1'),
                API.get('/groups?limit=1'),
                API.get('/resources?limit=1'),
                API.get('/opportunities?limit=1'),
            ]);
            setStats({
                posts: postsRes.data.pagination?.total || 0,
                groups: groupsRes.data.pagination?.total || 0,
                resources: resourcesRes.data.pagination?.total || 0,
                opportunities: oppsRes.data.pagination?.total || 0,
            });
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 rounded-2xl p-8 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl translate-y-24 -translate-x-24" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <HiSparkles className="w-5 h-5 text-amber-300" />
                        <span className="text-sm text-white/80">{getGreeting()}</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-white/80 max-w-lg">
                        Stay connected with your community. Check out trending posts, join study groups, or discover new opportunities.
                    </p>
                    <div className="flex gap-3 mt-6">
                        <Link
                            to="/posts"
                            className="px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-medium hover:bg-white/30 transition-colors"
                        >
                            Explore Posts
                        </Link>
                        <Link
                            to="/groups"
                            className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
                        >
                            Join a Group
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={HiChatBubbleLeftRight}
                    label="Community Posts"
                    value={stats.posts}
                    color="bg-gradient-to-br from-blue-500 to-indigo-600"
                    to="/posts"
                />
                <StatCard
                    icon={HiUserGroup}
                    label="Study Groups"
                    value={stats.groups}
                    color="bg-gradient-to-br from-violet-500 to-purple-600"
                    to="/groups"
                />
                <StatCard
                    icon={HiBookOpen}
                    label="Resources"
                    value={stats.resources}
                    color="bg-gradient-to-br from-emerald-500 to-teal-600"
                    to="/resources"
                />
                <StatCard
                    icon={HiRocketLaunch}
                    label="Opportunities"
                    value={stats.opportunities}
                    color="bg-gradient-to-br from-orange-500 to-red-500"
                    to="/opportunities"
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Trending Posts */}
                <div className="lg:col-span-2 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HiArrowTrendingUp className="w-5 h-5 text-orange-500" />
                            <h2 className="font-semibold text-[var(--text-primary)]">Trending Posts</h2>
                        </div>
                        <Link to="/posts" className="text-sm text-indigo-500 hover:text-indigo-600 font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                        {trending.length > 0 ? (
                            trending.slice(0, 5).map((post) => (
                                <Link
                                    key={post._id}
                                    to={`/posts/${post._id}`}
                                    className="block px-6 py-4 hover:bg-[var(--bg-secondary)] transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-sm font-bold">
                                                {post.author?.name?.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-[var(--text-primary)] truncate">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-[var(--text-muted)] mt-0.5">
                                                {post.author?.name} · {post.author?.college}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                                    <HiHeart className="w-3.5 h-3.5" /> {post.likesCount}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                                    <HiChatBubbleLeft className="w-3.5 h-3.5" /> {post.commentsCount}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                                    <HiEye className="w-3.5 h-3.5" /> {post.views}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                            {post.category}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <p className="text-[var(--text-muted)]">No trending posts yet. Be the first to post!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions & Profile Card */}
                <div className="space-y-4">
                    {/* Profile Card */}
                    <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-2xl object-cover" />
                                ) : (
                                    <span className="text-white text-xl font-bold">
                                        {user?.name?.charAt(0)}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-[var(--text-primary)]">{user?.name}</h3>
                                <p className="text-sm text-[var(--text-muted)]">{user?.college || 'Add your college'}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] rounded-xl">
                            <div className="text-center">
                                <p className="font-bold text-indigo-500">{user?.points || 0}</p>
                                <p className="text-xs text-[var(--text-muted)]">Points</p>
                            </div>
                            <div className="w-px h-8 bg-[var(--border)]" />
                            <div className="text-center">
                                <p className="font-bold text-purple-500">{user?.badges?.length || 0}</p>
                                <p className="text-xs text-[var(--text-muted)]">Badges</p>
                            </div>
                            <div className="w-px h-8 bg-[var(--border)]" />
                            <div className="text-center">
                                <p className="font-bold text-emerald-500">{user?.skills?.length || 0}</p>
                                <p className="text-xs text-[var(--text-muted)]">Skills</p>
                            </div>
                        </div>
                        <Link
                            to="/profile"
                            className="block w-full mt-4 py-2.5 text-center rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                        >
                            View Profile
                        </Link>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-6">
                        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'New Post', to: '/posts', icon: '✍️' },
                                { label: 'Find Groups', to: '/groups', icon: '🔍' },
                                { label: 'Upload Notes', to: '/resources', icon: '📤' },
                                { label: 'Chat', to: '/messages', icon: '💬' },
                            ].map((action) => (
                                <Link
                                    key={action.label}
                                    to={action.to}
                                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--bg-secondary)] border border-[var(--border)] transition-all hover:shadow-sm"
                                >
                                    <span className="text-xl">{action.icon}</span>
                                    <span className="text-xs font-medium text-[var(--text-secondary)]">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
