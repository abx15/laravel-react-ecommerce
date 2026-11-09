import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, PackageCheck, ShoppingBag } from 'lucide-react';
import api from '../services/api';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(() => !location.state?.order && Boolean(sessionStorage.getItem('lastOrderId')));
    const [error, setError] = useState('');

    useEffect(() => {
        if (order) return;
        const orderId = sessionStorage.getItem('lastOrderId');
        if (!orderId) return;

        let active = true;
        api.get('/orders/' + orderId)
            .then((response) => {
                if (active) setOrder(response.data?.data || null);
            })
            .catch((requestError) => {
                if (active) setError(requestError.response?.data?.message || 'We could not load this order.');
            })
            .finally(() => { if (active) setLoading(false); });

        return () => { active = false; };
    }, [order]);

    if (loading) return <div className="min-h-[50vh] flex items-center justify-center text-gray-500">Loading your order…</div>;

    if (!order) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20 text-center">
                <PackageCheck size={42} className="mx-auto text-gray-400" />
                <h2 className="mt-5 text-2xl font-bold text-gray-900">Order details unavailable</h2>
                <p className="mt-2 text-gray-500">{error || 'Open your account orders to view the latest order status.'}</p>
                <Link to="/user/orders" className="inline-flex mt-6 rounded-full bg-amber-400 px-6 py-3 font-semibold text-gray-950">View my orders</Link>
            </div>
        );
    }

    const paid = order.payment_status === 'paid';

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
            <div className="rounded-3xl border border-gray-100 bg-white p-7 md:p-10 text-center shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={42} />
                </div>
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">{paid ? 'Payment confirmed' : 'Order created'}</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{paid ? 'Thank you for your order!' : 'Your order is awaiting payment'}</h1>
                <p className="mt-3 text-gray-500">{paid ? 'Your payment was verified securely. We’ll keep you updated as your order moves forward.' : 'Your order has been saved, but payment is not yet confirmed.'}</p>

                <div className="mt-8 rounded-2xl bg-gray-50 p-5 text-left">
                    <h2 className="font-bold text-gray-900">Order summary</h2>
                    <div className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between gap-4"><span className="text-gray-500">Order number</span><span className="font-semibold text-gray-900">#{order.id}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-gray-500">Total amount</span><span className="font-semibold text-gray-900">₹{Number(order.total_amount || 0).toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-gray-500">Order status</span><span className="font-semibold capitalize text-gray-900">{order.status}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-gray-500">Payment status</span><span className={paid ? 'font-semibold text-emerald-700' : 'font-semibold text-amber-700'}>{paid ? 'Paid' : 'Pending'}</span></div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                    <button type="button" onClick={() => navigate('/user/orders')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800">
                        <PackageCheck size={18} /> View orders
                    </button>
                    <Link to="/products" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-semibold text-gray-950 hover:bg-amber-300">
                        <ShoppingBag size={18} /> Continue shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
