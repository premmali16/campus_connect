import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api';
import { PageLoader } from '../components/common/LoadingSpinner';
import { HiRocketLaunch, HiPlusCircle, HiMagnifyingGlass, HiBookmark, HiCalendar, HiMapPin, HiBanknotes, HiXMark } from 'react-icons/hi2';
import { format } from 'date-fns';

const TYPES = ['All', 'internship', 'hackathon', 'event', 'scholarship', 'job', 'workshop'];

const Opportunities = () => {
    const { user } = useSelector((state) => state.auth);
    const [opps, setOpps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('All');
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [newOpp, setNewOpp] = useState({ title: '', description: '', type: 'internship', company: '', location: '', link: '', deadline: '', stipend: '', tags: '' });
    const [creating, setCreating] = useState(false);

    useEffect(() => { fetchOpps(); }, [type]);

    const fetchOpps = async () => {
        try {
            setLoading(true); const params = {}; if (type !== 'All') params.type = type; if (search) params.search = search;
            const { data } = await API.get('/opportunities', { params }); setOpps(data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try { setCreating(true); await API.post('/opportunities', newOpp); setShowCreate(false); setNewOpp({ title: '', description: '', type: 'internship', company: '', location: '', link: '', deadline: '', stipend: '', tags: '' }); fetchOpps(); }
        catch (e) { console.error(e); } finally { setCreating(false); }
    };

    const handleSave = async (id) => {
        try { await API.put(`/opportunities/${id}/save`); fetchOpps(); } catch (e) { console.error(e); }
    };

    const handleApply = async (id) => {
        try { await API.put(`/opportunities/${id}/apply`); fetchOpps(); } catch (e) { console.error(e); }
    };

    const typeColors = { internship: 'from-blue-500 to-indigo-600', hackathon: 'from-orange-500 to-red-500', event: 'from-emerald-500 to-teal-600', scholarship: 'from-violet-500 to-purple-600', job: 'from-cyan-500 to-blue-600', workshop: 'from-amber-500 to-orange-500' };
    const typeEmojis = { internship: '💼', hackathon: '🏆', event: '🎉', scholarship: '🎓', job: '👨‍💻', workshop: '🔧' };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-[var(--text-primary)]">Opportunities</h1><p className="text-[var(--text-muted)] mt-1">Discover internships, hackathons, events & more</p></div>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/25"><HiPlusCircle className="w-5 h-5" /> Post Opportunity</button>
            </div>

            <div className="relative"><HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchOpps()} placeholder="Search opportunities..." className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40" /></div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {TYPES.map((t) => (<button key={t} onClick={() => setType(t)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap capitalize transition-all ${type === t ? 'bg-indigo-500 text-white shadow-md' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>{t}</button>))}
            </div>

            {loading ? <PageLoader /> : opps.length === 0 ? (
                <div className="text-center py-16 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)]"><p className="text-5xl mb-4">🚀</p><h3 className="text-lg font-semibold mb-2">No opportunities found</h3></div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {opps.map((opp) => (
                        <div key={opp._id} className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-md transition-all">
                            <div className={`h-2 bg-gradient-to-r ${typeColors[opp.type] || 'from-gray-400 to-gray-500'}`} />
                            <div className="p-6">
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="text-2xl">{typeEmojis[opp.type]}</span>
                                    <div className="flex-1 min-w-0"><h3 className="font-semibold text-[var(--text-primary)] line-clamp-2">{opp.title}</h3><p className="text-xs text-[var(--text-muted)] capitalize">{opp.type} · {opp.company}</p></div>
                                    <button onClick={() => handleSave(opp._id)} className={`p-1.5 rounded-lg ${opp.savedBy?.includes(user?._id) ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'}`}><HiBookmark className="w-5 h-5" /></button>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] line-clamp-3 mb-4">{opp.description}</p>
                                <div className="space-y-2 mb-4">
                                    {opp.location && <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><HiMapPin className="w-3.5 h-3.5" />{opp.location}</div>}
                                    {opp.stipend && <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><HiBanknotes className="w-3.5 h-3.5" />{opp.stipend}</div>}
                                    {opp.deadline && <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><HiCalendar className="w-3.5 h-3.5" />Deadline: {format(new Date(opp.deadline), 'MMM dd, yyyy')}</div>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleApply(opp._id)} disabled={opp.applicants?.includes(user?._id)} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${opp.applicants?.includes(user?._id) ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}>{opp.applicants?.includes(user?._id) ? '✓ Applied' : 'Apply'}</button>
                                    {opp.link && <a href={opp.link} target="_blank" rel="noopener noreferrer" className="py-2 px-4 rounded-xl border border-[var(--border)] text-sm font-medium hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]">Link ↗</a>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--bg-primary)] rounded-2xl w-full max-w-lg border border-[var(--border)] shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-primary)] z-10"><h2 className="text-lg font-semibold">Post Opportunity</h2><button onClick={() => setShowCreate(false)}><HiXMark className="w-5 h-5" /></button></div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <input type="text" value={newOpp.title} onChange={(e) => setNewOpp({ ...newOpp, title: e.target.value })} placeholder="Title" required className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
                            <textarea value={newOpp.description} onChange={(e) => setNewOpp({ ...newOpp, description: e.target.value })} placeholder="Description" required rows={3} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] resize-none" />
                            <div className="grid grid-cols-2 gap-3">
                                <select value={newOpp.type} onChange={(e) => setNewOpp({ ...newOpp, type: e.target.value })} className="px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">{TYPES.filter(t => t !== 'All').map(t => (<option key={t} value={t}>{t}</option>))}</select>
                                <input type="text" value={newOpp.company} onChange={(e) => setNewOpp({ ...newOpp, company: e.target.value })} placeholder="Company/Org" className="px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" value={newOpp.location} onChange={(e) => setNewOpp({ ...newOpp, location: e.target.value })} placeholder="Location" className="px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
                                <input type="text" value={newOpp.stipend} onChange={(e) => setNewOpp({ ...newOpp, stipend: e.target.value })} placeholder="Stipend" className="px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
                            </div>
                            <input type="url" value={newOpp.link} onChange={(e) => setNewOpp({ ...newOpp, link: e.target.value })} placeholder="Application link" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
                            <input type="date" value={newOpp.deadline} onChange={(e) => setNewOpp({ ...newOpp, deadline: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
                            <button type="submit" disabled={creating} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold disabled:opacity-50">{creating ? 'Posting...' : 'Post Opportunity'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Opportunities;
