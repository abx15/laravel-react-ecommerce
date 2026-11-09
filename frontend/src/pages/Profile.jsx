import { useEffect, useState } from 'react';
import { MapPin, Save, UserRound } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState('');
    const [addresses, setAddresses] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        let active = true;
        api.get('/user/profile')
            .then((response) => {
                if (!active) return;
                const payload = response.data?.data || {};
                const profile = payload.user || user || {};
                setFormData({
                    name: profile.name || '',
                    email: profile.email || '',
                    phone: profile.mobile || '',
                });
                setAddresses(payload.addresses || []);
            })
            .catch(() => {
                if (active) setFormData({ name: user?.name || '', email: user?.email || '', phone: user?.mobile || '' });
            })
            .finally(() => { if (active) setFetching(false); });
        return () => { active = false; };
    }, [user]);

    const handleChange = (event) => {
        setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const response = await api.put('/user/profile', formData);
            const updatedUser = response.data?.data;
            if (updatedUser) {
                updateUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            setMessage(response.data?.message || 'Profile updated successfully.');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Unable to update your profile. Please check the details.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="min-h-[50vh] flex items-center justify-center text-gray-500">Loading your profile…</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Your account</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Profile settings</h1>
                <p className="mt-2 text-gray-500">Keep your contact details up to date.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-6 items-start">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-7">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center"><UserRound size={21} /></div>
                        <div><h2 className="font-bold text-lg text-gray-900">Personal information</h2><p className="text-sm text-gray-500">Account and contact details</p></div>
                    </div>
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Full name
                            <input name="name" value={formData.name} onChange={handleChange} required maxLength={255} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
                        </label>
                        <label className="block text-sm font-medium text-gray-700">Email address
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required maxLength={255} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
                        </label>
                        <label className="block text-sm font-medium text-gray-700">Mobile number
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} maxLength={20} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
                        </label>
                    </div>
                    {message && <p role="status" className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">{message}</p>}
                    <button type="submit" disabled={loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3.5 font-bold text-gray-950 hover:bg-amber-300 disabled:opacity-60">
                        <Save size={17} /> {loading ? 'Saving…' : 'Save changes'}
                    </button>
                </form>
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-7">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><MapPin size={21} /></div>
                        <div><h2 className="font-bold text-lg text-gray-900">Saved addresses</h2><p className="text-sm text-gray-500">Your delivery locations</p></div>
                    </div>
                    {addresses.length ? (
                        <div className="space-y-3">
                            {addresses.map((address) => (
                                <div key={address.id} className="rounded-xl border border-gray-100 p-4">
                                    <p className="font-semibold text-gray-900">{address.address_line_1}</p>
                                    {address.address_line_2 && <p className="mt-1 text-sm text-gray-600">{address.address_line_2}</p>}
                                    <p className="mt-1 text-sm text-gray-600">{[address.city, address.state, address.zip_code, address.country].filter(Boolean).join(', ')}</p>
                                </div>
                            ))}
                        </div>
                    ) : <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">No saved addresses yet. Your address will be saved when you complete your next checkout.</div>}
                </section>
            </div>
        </div>
    );
};

export default Profile;
