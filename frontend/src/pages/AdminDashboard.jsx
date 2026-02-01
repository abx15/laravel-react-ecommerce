import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalResult: 0, pending: 0, approved: 0 });

    useEffect(() => {
        fetchSellers();
    }, []);

    const fetchSellers = async () => {
        try {
            const response = await api.get('/admin/sellers');
            setSellers(response.data);
            calculateStats(response.data);
        } catch (error) {
            console.error('Error fetching sellers:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const pending = data.filter(s => s.status === 'pending').length;
        const approved = data.filter(s => s.status === 'approved').length;
        setStats({ totalResult: data.length, pending, approved });
    };

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this seller?`)) return;

        try {
            await api.post(`/admin/sellers/${id}/${action}`);

            // Optimistic update or refetch
            fetchSellers();
            alert(`Seller ${action}d successfully`);
        } catch (error) {
            console.error(`Error ${action}ing seller:`, error);
            alert(`Failed to ${action} seller`);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

    return (
        <div className="p-6 bg-background min-h-screen">
            <h1 className="text-3xl font-bold text-text-heading mb-6">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Sellers</h3>
                    <p className="text-3xl font-bold text-primary mt-2">{stats.totalResult}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Approvals</h3>
                    <p className="text-3xl font-bold text-status-warning mt-2">{stats.pending}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Active Selleers</h3>
                    <p className="text-3xl font-bold text-status-success mt-2">{stats.approved}</p>
                </div>
            </div>

            {/* Sellers List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-text-heading">Seller Verification</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">Seller Info</th>
                                <th className="px-6 py-4 font-medium">Shop Details</th>
                                <th className="px-6 py-4 font-medium">Documents</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sellers.map((seller) => (
                                <tr key={seller.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-text-heading">{seller.user?.name}</div>
                                        <div className="text-sm text-gray-500">{seller.user?.email}</div>
                                        <div className="text-sm text-gray-500">{seller.user?.mobile}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-text-heading">{seller.shop_name}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">{seller.shop_address}</div>
                                        <div className="text-sm text-gray-500">{seller.city} - {seller.pincode}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a
                                            href={`http://localhost:8000/storage/${seller.id_proof_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline text-sm font-medium"
                                        >
                                            View ID Proof
                                        </a>
                                        {seller.gst_number && (
                                            <div className="text-xs text-gray-500 mt-1">GST: {seller.gst_number}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${seller.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                                            ${seller.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                            ${seller.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                                        `}>
                                            {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {seller.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(seller.id, 'approve')}
                                                        className="px-3 py-1 bg-status-success text-white text-sm rounded hover:opacity-90 transition"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(seller.id, 'reject')}
                                                        className="px-3 py-1 bg-status-error text-white text-sm rounded hover:opacity-90 transition"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
