import { useState, useEffect } from 'react';
import API from '../services/api';
import { HiBell, HiCheck, HiTrash } from 'react-icons/hi2';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchNotifications(); }, []);

    const fetchNotifications = async () => {
        try { const { data } = await API.get('/notifications'); setNotifications(data.data); setUnread(data.unreadCount); }
        catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const markRead = async (id) => {
        try { await API.put(`/notifications/${id}/read`); fetchNotifications(); } catch (e) { console.error(e); }
    };

    const markAllRead = async () => {
        try { await API.put('/notifications/read-all'); fetchNotifications(); } catch (e) { console.error(e); }
    };

    const deleteNotif = async (id) => {
        try { await API.delete(`/notifications/${id}`); fetchNotifications(); } catch (e) { console.error(e); }
    };

    const typeIcons = { like: '❤️', comment: '💬', follow: '👤', group_invite: '👥', group_join: '✅', message: '📩', mention: '@', opportunity: '🎯', badge: '🏆', system: '🔔' };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1><p className="text-[var(--text-muted)] mt-1">{unread} unread</p></div>
                {unread > 0 && <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-100 transition-colors"><HiCheck className="w-4 h-4" />Mark all read</button>}
            </div>
            <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
                {notifications.length === 0 ? (
                    <div className="text-center py-16"><HiBell className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" /><p className="text-[var(--text-muted)]">No notifications yet</p></div>
                ) : notifications.map((n) => (
                    <div key={n._id} className={`flex items-center gap-4 px-6 py-4 transition-colors ${!n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-[var(--bg-secondary)]'}`}>
                        <span className="text-xl">{typeIcons[n.type] || '🔔'}</span>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!n.isRead ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{n.message}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            {!n.isRead && <button onClick={() => markRead(n._id)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]"><HiCheck className="w-4 h-4" /></button>}
                            <button onClick={() => deleteNotif(n._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-muted)] hover:text-red-500"><HiTrash className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
