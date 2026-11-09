import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, LockKeyhole, MapPin, ShieldCheck } from 'lucide-react';
import api, { assetUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

const initialAddress = {
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'India',
};

const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existingScript = document.querySelector('script[data-razorpay-checkout]');
    if (existingScript) {
        existingScript.addEventListener('load', () => resolve(true), { once: true });
        existingScript.addEventListener('error', () => resolve(false), { once: true });
        return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
});

const money = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
}).format(Number(value || 0));

const Checkout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [address, setAddress] = useState(initialAddress);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        api.get('/cart')
            .then((response) => {
                if (active) setCart(response.data?.data || null);
            })
            .catch((requestError) => {
                if (active) setError(requestError.response?.data?.message || 'Unable to load your cart.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, []);

    const items = cart?.items || [];
    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0), 0),
        [items]
    );

    const updateAddress = (event) => {
        setAddress((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleCheckout = async (event) => {
        event.preventDefault();
        setError('');
        setProcessing(true);

        try {
            const loaded = await loadRazorpay();
            if (!loaded || !window.Razorpay) {
                throw new Error('Secure payment checkout could not be loaded. Please check your connection and try again.');
            }

            const orderResponse = await api.post('/orders', {
                shipping_address: address,
            });
            const orderData = orderResponse.data?.data;

            if (!orderData?.razorpay_order_id || !orderData?.key || !orderData?.order?.id) {
                throw new Error('The server returned an incomplete payment order. Please contact support.');
            }

            const checkout = new window.Razorpay({
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency || 'INR',
                name: 'OpenShop',
                description: 'Order #' + orderData.order.id,
                order_id: orderData.razorpay_order_id,
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                },
                notes: { order_id: String(orderData.order.id) },
                theme: { color: '#F59E0B' },
                handler: async (paymentResponse) => {
                    try {
                        const verification = await api.post('/payment/verify', {
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                            razorpay_payment_id: paymentResponse.razorpay_payment_id,
                            razorpay_signature: paymentResponse.razorpay_signature,
                        });
                        navigate('/order-success', {
                            replace: true,
                            state: { order: verification.data?.data || orderData.order },
                        });
                    } catch (verificationError) {
                        setError(
                            verificationError.response?.data?.message
                            || 'Payment was received but could not be verified. Please contact support before retrying.'
                        );
                        setProcessing(false);
                    }
                },
                modal: {
                    ondismiss: () => setProcessing(false),
                    escape: true,
                    confirm_close: true,
                },
            });

            checkout.on('payment.failed', (paymentError) => {
                setError(paymentError.error?.description || 'Payment failed. Your order is still pending.');
                setProcessing(false);
            });

            checkout.open();
        } catch (checkoutError) {
            setError(checkoutError.response?.data?.message || checkoutError.message || 'Checkout failed. Please try again.');
            setProcessing(false);
        }
    };

    if (loading) {
        return <div className="min-h-[55vh] flex items-center justify-center text-gray-500">Loading secure checkout…</div>;
    }

    if (!items.length) {
        return (
            <div className="max-w-3xl mx-auto py-20 px-4 text-center">
                <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <MapPin size={28} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
                <p className="mt-2 text-gray-500">Add something to your cart before checking out.</p>
                <Link to="/products" className="inline-flex mt-6 rounded-full bg-amber-400 px-6 py-3 font-semibold text-gray-900 hover:bg-amber-300">Explore products</Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
            <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-7">
                <ArrowLeft size={16} /> Back to cart
            </Link>

            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Almost yours</p>
                <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Secure checkout</h1>
                <p className="mt-2 text-gray-500">Confirm your delivery address and complete payment securely.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8 items-start">
                <form onSubmit={handleCheckout} className="bg-white border border-gray-100 rounded-2xl p-5 md:p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center"><MapPin size={20} /></div>
                        <div>
                            <h2 className="font-bold text-lg text-gray-900">Delivery address</h2>
                            <p className="text-sm text-gray-500">Where should we deliver your order?</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="sm:col-span-2 block text-sm font-medium text-gray-700">
                            Address line 1
                            <input name="address_line_1" value={address.address_line_1} onChange={updateAddress} required maxLength={255} autoComplete="address-line1" placeholder="House number, street, area" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
                        </label>
                        <label className="sm:col-span-2 block text-sm font-medium text-gray-700">
                            Address line 2 <span className="font-normal text-gray-400">(optional)</span>
                            <input name="address_line_2" value={address.address_line_2} onChange={updateAddress} maxLength={255} autoComplete="address-line2" placeholder="Landmark, apartment, floor" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
                        </label>
                        <label className="block text-sm font-medium text-gray-700">
                            City
                            <input name="city" value={address.city} onChange={updateAddress} required maxLength={120} autoComplete="address-level2" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
                        </label>
                        <label className="block text-sm font-medium text-gray-700">
                            State
                            <input name="state" value={address.state} onChange={updateAddress} required maxLength={120} autoComplete="address-level1" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
                        </label>
                        <label className="block text-sm font-medium text-gray-700">
                            PIN code
                            <input name="zip_code" value={address.zip_code} onChange={updateAddress} required maxLength={20} inputMode="numeric" autoComplete="postal-code" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
                        </label>
                        <label className="block text-sm font-medium text-gray-700">
                            Country
                            <input name="country" value={address.country} onChange={updateAddress} required maxLength={100} autoComplete="country-name" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
                        </label>
                    </div>

                    {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                    <button type="submit" disabled={processing} className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-4 font-bold text-gray-950 shadow-sm transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60">
                        <LockKeyhole size={18} /> {processing ? 'Preparing secure payment…' : 'Continue to payment'}
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <ShieldCheck size={15} className="text-emerald-600" /> Payments are processed securely by Razorpay
                    </div>
                </form>

                <aside className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900">Order summary</h2>
                    <div className="mt-5 space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-3">
                                <img src={assetUrl(item.product?.images?.[0]?.image_path)} alt={item.product?.name || 'Product'} className="h-16 w-16 rounded-xl bg-gray-50 object-contain border border-gray-100" />
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm text-gray-900 line-clamp-2">{item.product?.name}</p>
                                    <p className="mt-1 text-xs text-gray-500">Qty {item.quantity}</p>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{money(Number(item.product?.price || 0) * Number(item.quantity || 0))}</p>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-100 mt-6 pt-5 space-y-3 text-sm">
                        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                        <div className="flex justify-between text-gray-600"><span>Delivery</span><span className="text-emerald-700 font-medium">Calculated at checkout</span></div>
                        <div className="flex justify-between border-t border-gray-100 pt-4 text-base font-bold text-gray-900"><span>Items total</span><span>{money(subtotal)}</span></div>
                    </div>
                    <div className="mt-5 rounded-xl bg-emerald-50 p-3 flex gap-2 text-xs text-emerald-800">
                        <CheckCircle2 size={16} className="shrink-0" /> Final payable amount is calculated and verified by the server.
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Checkout;
