import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../services/api';
import { PageLoader } from '../components/common/LoadingSpinner';
import { HiHeart, HiChatBubbleLeft, HiEye, HiArrowLeft, HiPaperAirplane, HiTrash } from 'react-icons/hi2';
import { formatDistanceToNow } from 'date-fns';

const PostDetail = () => {
    const { id } = useParams();
    const { user } = useSelector((state) => state.auth);
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            const { data } = await API.get(`/posts/${id}`);
            setPost(data.data);
            setComments(data.data.comments || []);
        } catch (error) {
            console.error('Failed to fetch post');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        try {
            const { data } = await API.put(`/posts/${id}/like`);
            setPost((prev) => ({ ...prev, likes: data.data.likes, likesCount: data.data.likesCount }));
        } catch (error) {
            console.error('Failed to like');
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            setSubmitting(true);
            const { data } = await API.post(`/posts/${id}/comments`, { content: commentText });
            setComments((prev) => [data.data, ...prev]);
            setPost((prev) => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
            setCommentText('');
        } catch (error) {
            console.error('Failed to comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await API.delete(`/posts/${id}/comments/${commentId}`);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
            setPost((prev) => ({ ...prev, commentsCount: Math.max(0, prev.commentsCount - 1) }));
        } catch (error) {
            console.error('Failed to delete comment');
        }
    };

    if (loading) return <PageLoader />;
    if (!post) return <div className="text-center py-20 text-[var(--text-muted)]">Post not found</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <Link to="/posts" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-indigo-500 transition-colors">
                <HiArrowLeft className="w-4 h-4" /> Back to Posts
            </Link>

            {/* Post */}
            <article className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-8">
                {/* Author */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                        {post.author?.avatar ? (
                            <img src={post.author.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                            <span className="text-white font-bold">{post.author?.name?.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <p className="font-semibold text-[var(--text-primary)]">{post.author?.name}</p>
                        <p className="text-sm text-[var(--text-muted)]">
                            {post.author?.college} · {post.author?.branch} · {post.author?.year}
                        </p>
                    </div>
                    <span className="ml-auto px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {post.category}
                    </span>
                </div>

                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{post.title}</h1>
                <div className="prose max-w-none text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                    {post.content}
                </div>

                {post.image && (
                    <img src={post.image} alt="" className="w-full rounded-xl mt-6 max-h-96 object-cover" />
                )}

                {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6">
                        {post.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 rounded-lg bg-[var(--bg-secondary)] text-sm text-[var(--text-muted)]">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 mt-6 pt-6 border-t border-[var(--border)]">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${post.likes?.includes(user?._id)
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                                : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'
                            }`}
                    >
                        <HiHeart className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.likesCount} Likes</span>
                    </button>
                    <span className="flex items-center gap-2 text-[var(--text-muted)]">
                        <HiChatBubbleLeft className="w-5 h-5" />
                        <span className="text-sm">{post.commentsCount} Comments</span>
                    </span>
                    <span className="flex items-center gap-2 text-[var(--text-muted)]">
                        <HiEye className="w-5 h-5" />
                        <span className="text-sm">{post.views} Views</span>
                    </span>
                    <span className="ml-auto text-sm text-[var(--text-muted)]">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                </div>
            </article>

            {/* Comment Form */}
            <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-6">
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Comments ({comments.length})</h3>
                <form onSubmit={handleComment} className="flex gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{user?.name?.charAt(0)}</span>
                    </div>
                    <div className="flex-1 flex gap-2">
                        <input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={submitting || !commentText.trim()}
                            className="px-4 py-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 transition-all"
                        >
                            <HiPaperAirplane className="w-4 h-4" />
                        </button>
                    </div>
                </form>

                {/* Comments list */}
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment._id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                                {comment.author?.avatar ? (
                                    <img src={comment.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <span className="text-white text-xs font-bold">{comment.author?.name?.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex-1 bg-[var(--bg-secondary)] rounded-xl p-4">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm text-[var(--text-primary)]">{comment.author?.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[var(--text-muted)]">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                        {(comment.author?._id === user?._id || user?.role === 'admin') && (
                                            <button
                                                onClick={() => handleDeleteComment(comment._id)}
                                                className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                            >
                                                <HiTrash className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <p className="text-center text-[var(--text-muted)] py-4">No comments yet. Be the first!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
