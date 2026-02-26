import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../store/slices/authSlice';
import API from '../services/api';
import { PageLoader } from '../components/common/LoadingSpinner';
import { HiPencil, HiAcademicCap, HiMapPin, HiLink, HiSparkles } from 'react-icons/hi2';

const Profile = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { user: authUser } = useSelector((state) => state.auth);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});

    const isOwnProfile = !id || id === authUser?._id;

    useEffect(() => { fetchProfile(); }, [id]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            if (isOwnProfile) {
                const { data } = await API.get('/auth/me');
                setProfile(data.data);
                setFormData(data.data);
            } else {
                const { data } = await API.get(`/users/${id}`);
                setProfile(data.data);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleSave = async () => {
        try {
            await dispatch(updateProfile({
                name: formData.name, college: formData.college, branch: formData.branch,
                year: formData.year, bio: formData.bio,
                skills: typeof formData.skills === 'string' ? formData.skills.split(',').map(s => s.trim()) : formData.skills,
                interests: typeof formData.interests === 'string' ? formData.interests.split(',').map(s => s.trim()) : formData.interests,
            }));
            setEditing(false);
            fetchProfile();
        } catch (e) { console.error(e); }
    };

    if (loading) return <PageLoader />;
    if (!profile) return <div className="text-center py-20 text-[var(--text-muted)]">User not found</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Profile Header */}
            <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 relative">
                    <div className="absolute inset-0 opacity-20"><div className="absolute top-10 left-20 w-40 h-40 bg-white rounded-full blur-3xl" /></div>
                </div>
                <div className="px-8 pb-6 -mt-12 relative">
                    <div className="flex items-end gap-4 mb-4">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 border-4 border-[var(--bg-primary)] flex items-center justify-center shadow-lg">
                            {profile.avatar ? <img src={profile.avatar} alt="" className="w-24 h-24 rounded-2xl object-cover" /> : <span className="text-white text-3xl font-bold">{profile.name?.charAt(0)}</span>}
                        </div>
                        <div className="flex-1 pb-1">
                            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{profile.name}</h1>
                            <p className="text-[var(--text-muted)]">{profile.email}</p>
                        </div>
                        {isOwnProfile && (
                            <button onClick={() => editing ? handleSave() : setEditing(true)} className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors flex items-center gap-2">
                                <HiPencil className="w-4 h-4" />{editing ? 'Save' : 'Edit'}
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 mb-4">
                        <div className="flex items-center gap-2"><HiSparkles className="w-4 h-4 text-amber-500" /><span className="font-bold text-[var(--text-primary)]">{profile.points}</span><span className="text-sm text-[var(--text-muted)]">Points</span></div>
                        <div className="flex items-center gap-2"><HiAcademicCap className="w-4 h-4 text-indigo-500" /><span className="text-sm text-[var(--text-secondary)]">{profile.college || 'No college'}</span></div>
                        {profile.branch && <div className="flex items-center gap-2"><HiMapPin className="w-4 h-4 text-emerald-500" /><span className="text-sm text-[var(--text-secondary)]">{profile.branch} · {profile.year}</span></div>}
                    </div>
                </div>
            </div>

            {/* Bio & Details */}
            <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-6">
                <h2 className="font-semibold text-[var(--text-primary)] mb-4">About</h2>
                {editing ? (
                    <div className="space-y-4">
                        <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Name" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                        <textarea value={formData.bio || ''} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Bio" rows={3} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" value={formData.college || ''} onChange={(e) => setFormData({ ...formData, college: e.target.value })} placeholder="College" className="px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
                            <input type="text" value={formData.branch || ''} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} placeholder="Branch" className="px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
                        </div>
                        <select value={formData.year || ''} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                            <option value="">Select Year</option>{['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'].map(y => (<option key={y} value={y}>{y}</option>))}
                        </select>
                        <input type="text" value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills || ''} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} placeholder="Skills (comma separated)" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
                        <input type="text" value={Array.isArray(formData.interests) ? formData.interests.join(', ') : formData.interests || ''} onChange={(e) => setFormData({ ...formData, interests: e.target.value })} placeholder="Interests (comma separated)" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
                        <button onClick={() => setEditing(false)} className="text-sm text-[var(--text-muted)] hover:text-red-500">Cancel</button>
                    </div>
                ) : (
                    <>
                        <p className="text-[var(--text-secondary)] mb-6">{profile.bio || 'No bio yet.'}</p>
                        {profile.skills?.length > 0 && (<div className="mb-4"><h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Skills</h3><div className="flex flex-wrap gap-2">{profile.skills.map((s, i) => (<span key={i} className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-sm text-indigo-600 dark:text-indigo-400">{s}</span>))}</div></div>)}
                        {profile.interests?.length > 0 && (<div><h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Interests</h3><div className="flex flex-wrap gap-2">{profile.interests.map((i, idx) => (<span key={idx} className="px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-sm text-purple-600 dark:text-purple-400">{i}</span>))}</div></div>)}
                    </>
                )}
            </div>

            {/* Badges */}
            {profile.badges?.length > 0 && (
                <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-6">
                    <h2 className="font-semibold text-[var(--text-primary)] mb-4">Badges</h2>
                    <div className="flex flex-wrap gap-3">{profile.badges.map((b, i) => (<div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]"><span className="text-xl">{b.icon || '🏆'}</span><span className="text-sm font-medium">{b.name}</span></div>))}</div>
                </div>
            )}
        </div>
    );
};

export default Profile;
