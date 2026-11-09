import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import api, { assetUrl } from '../services/api';

const money = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
}).format(Number(value || 0));

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busyItem, setBusyItem] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchCart = useCallback(async () => {
        try {
            const response = await api.get('/cart');
            setCart(response.data?.data || null);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to load your cart.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const items = cart?.items || [];
    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0), 0),
        [items]
    );

    const updateQuantity = async (item, quantity) => {
        if (quantity < 1 || quantity > Number(item.product?.stock || 0)) return;
        setBusyItem(item.id);
        setError('');
        try {
            const response = await api.put('/cart/' + item.id, { quantity });
            setCart(response.data?.data || null);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not update this item.');
        } finally {
            setBusyItem(null);
        }
    };

    const removeItem = async (itemId) => {
        setBusyItem(itemId);
        setError('');
        try {
            await api.delete('/cart/' + itemId);
            await fetchCart();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not remove this item.');
        } finally {
            setBusyItem(null);
        }
    };

    if (loading) {
        return <div className="min-h-[55vh] flex items-center justify-center text-gray-500">Loading your cart…</div>;
    }

    if (!items.length) {
        return (
            <div className="max-w-3xl mx-auto py-20 px-4 text-center">
                <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-700"><ShoppingBag size={28} /></div>
                <h1 className="text-2xl font-bold text-gray-900">Your cart is waiting</h1>
                <p className="mt-2 text-gray-500">Discover something you love and add it here.</p>
                <Link to="/products" className="inline-flex mt-6 rounded-full bg-amber-400 px-6 py-3 font-semibold text-gray-900 hover:bg-amber-300">Continue shopping</Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Your selection</p>
                <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Shopping cart</h1>
                <p className="mt-2 text-gray-500">{items.length} {items.length === 1 ? 'item' : 'items'} ready for checkout</p>
            </div>

            {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
                <section className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-100">
                    {items.map((item) => {
                        const product = item.product || {};
                        const stock = Number(product.stock || 0);
                        const busy = busyItem === item.id;
                        return (
                            <article key={item.id} className="p-4 md:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                                <Link to={'/products/' + product.id} className="h-28 w-28 shrink-0 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2">
                                    <img src={assetUrl(product.images?.[0]?.image_path)} alt={product.name || 'Product'} className="max-h-full max-w-full object-contain" />
                                </Link>
                                <div className="min-w-0 flex-1">
                                    <Link to={'/products/' + product.id} className="font-semibold text-gray-900 hover:text-amber-700 line-clamp-2">{product.name}</Link>
                                    <p className="mt-2 text-sm text-gray-500">{stock > 0 ? stock + ' available' : 'Currently out of stock'}</p>
                                    <p className="mt-2 text-lg font-bold text-gray-900">{money(product.price)}</p>
                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <div className="inline-flex items-center rounded-full border border-gray-200 p-1">
                                            <button type="button" aria-label="Decrease quantity" disabled={busy || item.quantity <= 1} onClick={() => updateQuantity(item, Number(item.quantity) - 1)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"><Minus size={14} /></button>
                                            <span className="w-9 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                                            <button type="button" aria-label="Increase quantity" disabled={busy || item.quantity >= stock} onClick={() => updateQuantity(item, Number(item.quantity) + 1)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"><Plus size={14} /></button>
                                        </div>
                                        <button type="button" disabled={busy} onClick={() => removeItem(item.id)} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 disabled:opacity-50"><Trash2 size={15} /> Remove</button>
                                    </div>
                                </div>
                                <div className="sm:text-right sm:min-w-28">
                                    <p className="text-xs text-gray-400">Item total</p>
                                    <p className="mt-1 font-bold text-gray-900">{money(Number(product.price || 0) * Number(item.quantity || 0))}</p>
                                </div>
                            </article>
                        );
                    })}
                </section>

                <aside className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6 lg:sticky lg:top-6">
                    <h2 className="text-lg font-bold text-gray-900">Order summary</h2>
                    <div className="mt-5 space-y-3 text-sm">
                        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                        <div className="flex justify-between text-gray-600"><span>Delivery</span><span className="text-emerald-700">Calculated at checkout</span></div>
                    </div>
                    <div className="border-t border-gray-100 mt-5 pt-5 flex justify-between items-center text-lg font-bold text-gray-900">
                        <span>Estimated total</span><span>{money(subtotal)}</span>
                    </div>
                    <button type="button" onClick={() => navigate('/checkout')} disabled={items.some((item) => Number(item.product?.stock || 0) < Number(item.quantity))} className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-4 font-bold text-gray-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50">
                        Proceed to checkout <ArrowRight size={18} />
                    </button>
                    <p className="mt-3 text-center text-xs text-gray-500">Shipping and final payable amount are confirmed on the next step.</p>
                    <Link to="/products" className="mt-5 block text-center text-sm font-medium text-gray-600 hover:text-gray-900">Continue shopping</Link>
                </aside>
            </div>
        </div>
    );
};

export default Cart;
