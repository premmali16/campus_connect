import { useState, useEffect } from 'react';
import API from '../services/api';
import { PageLoader } from '../components/common/LoadingSpinner';
import { HiTrophy, HiSparkles } from 'react-icons/hi2';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchLeaderboard(); }, []);

    const fetchLeaderboard = async () => {
        try { const { data } = await API.get('/users/leaderboard'); setUsers(data.data); } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const medals = ['🥇', '🥈', '🥉'];
    const bgColors = ['from-amber-500/10 to-amber-500/5', 'from-gray-400/10 to-gray-400/5', 'from-orange-600/10 to-orange-600/5'];

    if (loading) return <PageLoader />;

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center mb-8"><HiTrophy className="w-10 h-10 mx-auto text-amber-500 mb-2" /><h1 className="text-2xl font-bold text-[var(--text-primary)]">Leaderboard</h1><p className="text-[var(--text-muted)] mt-1">Top contributors in the community</p></div>

            {/* Top 3 */}
            <div className="grid grid-cols-3 gap-4">
                {users.slice(0, 3).map((u, i) => (
                    <div key={u._id} className={`bg-gradient-to-b ${bgColors[i]} bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-6 text-center ${i === 0 ? 'transform scale-105 shadow-lg' : ''}`}>
                        <span className="text-4xl">{medals[i]}</span>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 mx-auto mt-3 flex items-center justify-center">
                            {u.avatar ? <img src={u.avatar} alt="" className="w-16 h-16 rounded-full object-cover" /> : <span className="text-white text-xl font-bold">{u.name?.charAt(0)}</span>}
                        </div>
                        <h3 className="font-semibold text-[var(--text-primary)] mt-3">{u.name}</h3>
                        <p className="text-xs text-[var(--text-muted)]">{u.college}</p>
                        <div className="flex items-center justify-center gap-1 mt-2"><HiSparkles className="w-4 h-4 text-amber-500" /><span className="font-bold text-indigo-500">{u.points} pts</span></div>
                    </div>
                ))}
            </div>

            {/* Rest */}
            <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
                {users.slice(3).map((u, i) => (
                    <div key={u._id} className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--bg-secondary)] transition-colors">
                        <span className="w-8 text-center font-bold text-[var(--text-muted)]">#{i + 4}</span>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center"><span className="text-white text-sm font-bold">{u.name?.charAt(0)}</span></div>
                        <div className="flex-1"><p className="font-medium text-[var(--text-primary)]">{u.name}</p><p className="text-xs text-[var(--text-muted)]">{u.college}</p></div>
                        <div className="flex items-center gap-1"><HiSparkles className="w-4 h-4 text-amber-500" /><span className="font-bold text-indigo-500">{u.points} pts</span></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
