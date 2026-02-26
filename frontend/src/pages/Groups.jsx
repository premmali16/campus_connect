import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api';
import { PageLoader } from '../components/common/LoadingSpinner';
import { HiUserGroup, HiPlusCircle, HiMagnifyingGlass, HiXMark, HiUsers, HiArrowRightOnRectangle, HiArrowLeftOnRectangle } from 'react-icons/hi2';

const CATEGORIES = ['All', 'Study', 'Project', 'Club', 'Sports', 'Cultural', 'Technical', 'Other'];

const Groups = () => {
    const { user } = useSelector((state) => state.auth);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '', category: 'Study', tags: '' });
    const [creating, setCreating] = useState(false);

    useEffect(() => { fetchGroups(); }, [category]);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const params = {};
            if (category !== 'All') params.category = category;
            if (search) params.search = search;
            const { data } = await API.get('/groups', { params });
            setGroups(data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            setCreating(true);
            await API.post('/groups', newGroup);
            setShowCreate(false);
            setNewGroup({ name: '', description: '', category: 'Study', tags: '' });
            fetchGroups();
        } catch (e) { console.error(e); } finally { setCreating(false); }
    };

    const handleJoinLeave = async (groupId, isMember) => {
        try {
            if (isMember) { await API.put(`/groups/${groupId}/leave`); }
            else { await API.put(`/groups/${groupId}/join`); }
            fetchGroups();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Study Groups</h1>
                    <p className="text-[var(--text-muted)] mt-1">Join groups, collaborate, and learn together</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
                    <HiPlusCircle className="w-5 h-5" /> Create Group
                </button>
            </div>

            <div className="relative">
                <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchGroups()} placeholder="Search groups..." className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${category === cat ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-indigo-300'}`}>{cat}</button>
                ))}
            </div>

            {loading ? <PageLoader /> : groups.length === 0 ? (
                <div className="text-center py-16 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)]">
                    <p className="text-5xl mb-4">👥</p>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No groups found</h3>
                    <p className="text-[var(--text-muted)]">Create the first group!</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((group) => {
                        const isMember = group.members?.some((m) => m._id === user?._id);
                        const isCreator = group.creator?._id === user?._id;
                        return (
                            <div key={group._id} className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-6 hover:shadow-md transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
                                        <HiUserGroup className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-[var(--text-primary)] truncate">{group.name}</h3>
                                        <span className="text-xs text-[var(--text-muted)]">{group.category}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">{group.description}</p>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex -space-x-2">
                                        {group.members?.slice(0, 4).map((member, i) => (
                                            <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-[var(--bg-primary)] flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">{member.name?.charAt(0)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-xs text-[var(--text-muted)]">
                                        <HiUsers className="w-3.5 h-3.5 inline mr-1" />{group.members?.length} members
                                    </span>
                                </div>
                                {!isCreator ? (
                                    <button onClick={() => handleJoinLeave(group._id, isMember)} className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${isMember ? 'border border-red-200 text-red-500 hover:bg-red-50' : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/20'}`}>
                                        {isMember ? <span className="flex items-center justify-center gap-1.5"><HiArrowRightOnRectangle className="w-4 h-4" /> Leave</span> : <span className="flex items-center justify-center gap-1.5"><HiArrowLeftOnRectangle className="w-4 h-4" /> Join</span>}
                                    </button>
                                ) : <div className="py-2 text-center text-xs text-[var(--text-muted)]">✨ You created this group</div>}
                            </div>
                        );
                    })}
                </div>
            )}

            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--bg-primary)] rounded-2xl w-full max-w-lg border border-[var(--border)] shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                            <h2 className="text-lg font-semibold">Create Study Group</h2>
                            <button onClick={() => setShowCreate(false)}><HiXMark className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
                            <input type="text" value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} placeholder="Group name" required className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                            <textarea value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} placeholder="Description" rows={3} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                            <select value={newGroup.category} onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input type="text" value={newGroup.tags} onChange={(e) => setNewGroup({ ...newGroup, tags: e.target.value })} placeholder="Tags (comma separated)" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
                            <button type="submit" disabled={creating} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold disabled:opacity-50 shadow-lg shadow-indigo-500/25">{creating ? 'Creating...' : 'Create Group'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groups;
