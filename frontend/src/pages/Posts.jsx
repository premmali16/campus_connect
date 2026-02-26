import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../services/api';
import { PageLoader } from '../components/common/LoadingSpinner';
import {
    HiHeart,
    HiChatBubbleLeft,
    HiEye,
    HiPlusCircle,
    HiMagnifyingGlass,
    HiFunnel,
    HiXMark,
    HiPaperAirplane,
    HiPhoto,
} from 'react-icons/hi2';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = ['All', 'General', 'Academic', 'Technical', 'Career', 'Events', 'Projects', 'Doubts', 'Announcements'];

const Posts = () => {
    const { user } = useSelector((state) => state.auth);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General', tags: '' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, [category, page]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (category !== 'All') params.category = category;
            if (search) params.search = search;
            const { data } = await API.get('/posts', { params });
            setPosts(data.data);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchPosts();
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            setCreating(true);
            await API.post('/posts', newPost);
            setShowCreateModal(false);
            setNewPost({ title: '', content: '', category: 'General', tags: '' });
            fetchPosts();
        } catch (error) {
            console.error('Failed to create post');
        } finally {
            setCreating(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const { data } = await API.put(`/posts/${postId}/like`);
            setPosts((prev) =>
                prev.map((post) =>
                    post._id === postId
                        ? { ...post, likes: data.data.likes, likesCount: data.data.likesCount }
                        : post
                )
            );
        } catch (error) {
            console.error('Failed to like post');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Community Posts</h1>
                    <p className="text-[var(--text-muted)] mt-1">Share knowledge, ask questions, and connect</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
                >
                    <HiPlusCircle className="w-5 h-5" />
                    Create Post
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                    />
                </form>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => { setCategory(cat); setPage(1); }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${category === cat
                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                                : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-indigo-300'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Posts Feed */}
            {loading ? (
                <PageLoader />
            ) : posts.length === 0 ? (
                <div className="text-center py-16 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)]">
                    <p className="text-5xl mb-4">📝</p>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No posts yet</h3>
                    <p className="text-[var(--text-muted)]">Be the first to share something!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <div
                            key={post._id}
                            className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-6 hover:shadow-md transition-all"
                        >
                            {/* Post Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                    {post.author?.avatar ? (
                                        <img src={post.author.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <span className="text-white text-sm font-bold">{post.author?.name?.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Link to={`/profile/${post.author?._id}`} className="font-medium text-[var(--text-primary)] hover:text-indigo-500 transition-colors">
                                        {post.author?.name}
                                    </Link>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        {post.author?.college} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                    {post.category}
                                </span>
                            </div>

                            {/* Post Content */}
                            <Link to={`/posts/${post._id}`}>
                                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2 hover:text-indigo-500 transition-colors">
                                    {post.title}
                                </h2>
                                <p className="text-[var(--text-secondary)] line-clamp-3 text-sm leading-relaxed">
                                    {post.content}
                                </p>
                            </Link>

                            {/* Tags */}
                            {post.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {post.tags.map((tag, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-xs text-[var(--text-muted)]">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Post Image */}
                            {post.image && (
                                <img src={post.image} alt="" className="w-full rounded-xl mt-4 max-h-80 object-cover" />
                            )}

                            {/* Post Actions */}
                            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[var(--border)]">
                                <button
                                    onClick={() => handleLike(post._id)}
                                    className={`flex items-center gap-1.5 text-sm transition-colors ${post.likes?.includes(user?._id)
                                            ? 'text-red-500'
                                            : 'text-[var(--text-muted)] hover:text-red-500'
                                        }`}
                                >
                                    <HiHeart className="w-5 h-5" />
                                    <span>{post.likesCount}</span>
                                </button>
                                <Link
                                    to={`/posts/${post._id}`}
                                    className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-indigo-500 transition-colors"
                                >
                                    <HiChatBubbleLeft className="w-5 h-5" />
                                    <span>{post.commentsCount}</span>
                                </Link>
                                <span className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                                    <HiEye className="w-5 h-5" />
                                    <span>{post.views}</span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: pagination.pages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${page === i + 1
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-indigo-300'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--bg-primary)] rounded-2xl w-full max-w-lg border border-[var(--border)] shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Create Post</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-[var(--bg-tertiary)]">
                                <HiXMark className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreatePost} className="p-6 space-y-4">
                            <input
                                type="text"
                                value={newPost.title}
                                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                placeholder="Post title..."
                                required
                                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                            />
                            <textarea
                                value={newPost.content}
                                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                placeholder="What's on your mind?"
                                required
                                rows={5}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={newPost.category}
                                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                    className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                >
                                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={newPost.tags}
                                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                                    placeholder="Tags (comma separated)"
                                    className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25"
                            >
                                {creating ? 'Publishing...' : 'Publish Post'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Posts;
