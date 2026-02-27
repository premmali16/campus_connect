import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api';
import io from 'socket.io-client';
import { HiPaperAirplane, HiMagnifyingGlass, HiUserCircle } from 'react-icons/hi2';
import { formatDistanceToNow } from 'date-fns';

const Messages = () => {
    const { user } = useSelector((state) => state.auth);
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const messagesEnd = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
        socketRef.current = io(socketUrl, { withCredentials: true });
        socketRef.current.emit('user_online', user?._id);
        socketRef.current.on('receive_message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });
        return () => { if (socketRef.current) socketRef.current.disconnect(); };
    }, []);

    useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const fetchConversations = async () => {
        try { const { data } = await API.get('/messages/conversations'); setConversations(data.data); } catch (e) { console.error(e); }
    };

    const selectConversation = async (conv) => {
        setSelectedConv(conv);
        setLoading(true);
        try {
            const { data } = await API.get(`/messages/${conv._id}`);
            setMessages(data.data);
            socketRef.current?.emit('join_room', conv._id);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMsg.trim() || !selectedConv) return;
        try {
            const { data } = await API.post('/messages', { conversationId: selectedConv._id, content: newMsg });
            setMessages((prev) => [...prev, data.data]);
            socketRef.current?.emit('send_message', { roomId: selectedConv._id, message: data.data });
            setNewMsg('');
            fetchConversations();
        } catch (e) { console.error(e); }
    };

    const searchUsers = async (q) => {
        setSearch(q);
        if (q.length < 2) { setSearchResults([]); return; }
        try { const { data } = await API.get(`/users/search?q=${q}`); setSearchResults(data.data); } catch (e) { console.error(e); }
    };

    const startConversation = async (userId) => {
        try {
            const { data } = await API.post('/messages/conversation', { userId });
            setSearchResults([]); setSearch('');
            await fetchConversations();
            selectConversation(data.data);
        } catch (e) { console.error(e); }
    };

    const getOtherUser = (conv) => conv.participants?.find((p) => p._id !== user?._id);

    return (
        <div className="flex h-[calc(100vh-7rem)] bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] overflow-hidden animate-fade-in">
            {/* Sidebar */}
            <div className="w-80 border-r border-[var(--border)] flex flex-col">
                <div className="p-4 border-b border-[var(--border)]">
                    <h2 className="font-bold text-lg text-[var(--text-primary)] mb-3">Messages</h2>
                    <div className="relative">
                        <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input type="text" value={search} onChange={(e) => searchUsers(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                    </div>
                    {searchResults.length > 0 && (
                        <div className="mt-2 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] max-h-40 overflow-y-auto">
                            {searchResults.map((u) => (
                                <button key={u._id} onClick={() => startConversation(u._id)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--bg-tertiary)] transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center"><span className="text-white text-xs font-bold">{u.name?.charAt(0)}</span></div>
                                    <div className="text-left"><p className="text-sm font-medium">{u.name}</p><p className="text-xs text-[var(--text-muted)]">{u.college}</p></div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => {
                        const other = conv.isGroup ? null : getOtherUser(conv);
                        return (
                            <button key={conv._id} onClick={() => selectConversation(conv)} className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors border-b border-[var(--border)] ${selectedConv?._id === conv._id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-sm font-bold">{conv.isGroup ? conv.groupRef?.name?.charAt(0) : other?.name?.charAt(0) || '?'}</span>
                                </div>
                                <div className="flex-1 min-w-0 text-left"><p className="font-medium text-sm truncate">{conv.isGroup ? conv.groupRef?.name : other?.name || 'Unknown'}</p>
                                    <p className="text-xs text-[var(--text-muted)] truncate">{conv.lastMessage?.content || 'Start chatting'}</p></div>
                            </button>
                        );
                    })}
                    {conversations.length === 0 && <p className="text-center text-[var(--text-muted)] py-8 text-sm">No conversations yet</p>}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConv ? (
                    <>
                        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{(selectedConv.isGroup ? selectedConv.groupRef?.name : getOtherUser(selectedConv)?.name)?.charAt(0)}</span>
                            </div>
                            <div><p className="font-semibold text-[var(--text-primary)]">{selectedConv.isGroup ? selectedConv.groupRef?.name : getOtherUser(selectedConv)?.name}</p>
                                <p className="text-xs text-[var(--text-muted)]">{getOtherUser(selectedConv)?.isOnline ? '🟢 Online' : 'Offline'}</p></div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                            {messages.map((msg, i) => {
                                const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                                return (
                                    <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-indigo-500 text-white rounded-br-md' : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-md'}`}>
                                            {!isMe && <p className="text-xs font-medium mb-1 text-indigo-500">{msg.sender?.name}</p>}
                                            <p>{msg.content}</p>
                                            <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>{msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : 'Just now'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEnd} />
                        </div>
                        <form onSubmit={sendMessage} className="px-6 py-4 border-t border-[var(--border)] flex gap-3">
                            <input type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                            <button type="submit" disabled={!newMsg.trim()} className="px-4 py-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 transition-all"><HiPaperAirplane className="w-5 h-5" /></button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center"><div className="text-center"><HiUserCircle className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" /><h3 className="font-semibold text-[var(--text-primary)] mb-1">Select a conversation</h3><p className="text-sm text-[var(--text-muted)]">Choose a chat or search for users to start messaging</p></div></div>
                )}
            </div>
        </div>
    );
};

export default Messages;
