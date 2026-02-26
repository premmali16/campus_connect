import { useState, useEffect } from 'react';
import API from '../services/api';
import { PageLoader } from '../components/common/LoadingSpinner';
import { HiBookOpen, HiPlusCircle, HiMagnifyingGlass, HiArrowDown, HiStar, HiXMark } from 'react-icons/hi2';

const CATEGORIES = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Other'];
const TYPES = ['All', 'notes', 'pdf', 'link', 'video', 'other'];

const Resources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [type, setType] = useState('All');
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [newRes, setNewRes] = useState({ title: '', description: '', type: 'notes', subject: '', category: 'Computer Science', externalLink: '', tags: '' });
    const [creating, setCreating] = useState(false);

    useEffect(() => { fetchResources(); }, [category, type]);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const params = {};
            if (category !== 'All') params.category = category;
            if (type !== 'All') params.type = type;
            if (search) params.search = search;
            const { data } = await API.get('/resources', { params });
            setResources(data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try { setCreating(true); await API.post('/resources', newRes); setShowCreate(false); fetchResources(); }
        catch (e) { console.error(e); } finally { setCreating(false); }
    };

    const handleDownload = async (id) => {
        try { await API.put(`/resources/${id}/download`); fetchResources(); } catch (e) { console.error(e); }
    };

    const handleRate = async (id, rating) => {
        try { await API.put(`/resources/${id}/rate`, { rating }); fetchResources(); } catch (e) { console.error(e); }
    };

    const typeIcons = { notes: '📝', pdf: '📄', link: '🔗', video: '🎥', other: '📦' };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-[var(--text-primary)]">Resources</h1><p className="text-[var(--text-muted)] mt-1">Share and discover study materials</p></div>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/25"><HiPlusCircle className="w-5 h-5" /> Upload Resource</button>
            </div>

            <div className="relative">
                <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchResources()} placeholder="Search resources..." className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map((c) => (<button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${category === c ? 'bg-indigo-500 text-white shadow-md' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>{c}</button>))}
            </div>

            {loading ? <PageLoader /> : resources.length === 0 ? (
                <div className="text-center py-16 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)]"><p className="text-5xl mb-4">📚</p><h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No resources found</h3></div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.map((res) => (
                        <div key={res._id} className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-6 hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl">{typeIcons[res.type]}</span>
                                <div className="flex-1 min-w-0"><h3 className="font-semibold text-[var(--text-primary)] truncate">{res.title}</h3><p className="text-xs text-[var(--text-muted)]">{res.subject} · {res.category}</p></div>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">{res.description}</p>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map((s) => (<button key={s} onClick={() => handleRate(res._id, s)} className={`w-4 h-4 ${s <= Math.round(res.averageRating) ? 'text-amber-400' : 'text-gray-300'}`}><HiStar /></button>))}<span className="text-xs text-[var(--text-muted)] ml-1">{res.averageRating || 0}</span></div>
                                <span className="text-xs text-[var(--text-muted)]"><HiArrowDown className="w-3 h-3 inline" /> {res.downloads}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-3"><span>By {res.uploadedBy?.name}</span></div>
                            <button onClick={() => handleDownload(res._id)} className="w-full py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                                {res.fileUrl ? 'Download' : res.externalLink ? 'Open Link' : 'View'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--bg-primary)] rounded-2xl w-full max-w-lg border border-[var(--border)] shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]"><h2 className="text-lg font-semibold">Upload Resource</h2><button onClick={() => setShowCreate(false)}><HiXMark className="w-5 h-5" /></button></div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <input type="text" value={newRes.title} onChange={(e) => setNewRes({ ...newRes, title: e.target.value })} placeholder="Title" required className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                            <textarea value={newRes.description} onChange={(e) => setNewRes({ ...newRes, description: e.target.value })} placeholder="Description" rows={3} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none" />
                            <div className="grid grid-cols-2 gap-3">
                                <select value={newRes.type} onChange={(e) => setNewRes({ ...newRes, type: e.target.value })} className="px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">{TYPES.filter(t => t !== 'All').map(t => (<option key={t} value={t}>{t}</option>))}</select>
                                <input type="text" value={newRes.subject} onChange={(e) => setNewRes({ ...newRes, subject: e.target.value })} placeholder="Subject" required className="px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
                            </div>
                            <select value={newRes.category} onChange={(e) => setNewRes({ ...newRes, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">{CATEGORIES.filter(c => c !== 'All').map(c => (<option key={c} value={c}>{c}</option>))}</select>
                            <input type="text" value={newRes.externalLink} onChange={(e) => setNewRes({ ...newRes, externalLink: e.target.value })} placeholder="External link (optional)" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
                            <button type="submit" disabled={creating} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold disabled:opacity-50 shadow-lg shadow-indigo-500/25">{creating ? 'Uploading...' : 'Upload Resource'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Resources;
