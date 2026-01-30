import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [shippingInfo, setShippingInfo] = useState({
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India'
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchCart();
    }, [user, navigate]);

    const fetchCart = async () => {
        try {
            const response = await api.get('/cart');
            setCart(response.data.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setShippingInfo({
            ...shippingInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const orderData = {
                items: cart.items.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price
                })),
                shipping_address: shippingInfo,
                total_amount: cart.total
            };

            const response = await api.post('/orders', orderData);
            
            // Redirect to payment or order confirmation
            navigate('/order-success', { state: { order: response.data.data } });
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Checkout failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading checkout...</p>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
                <button
                    onClick={() => navigate('/products')}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Shipping Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                    <form onSubmit={handleCheckout}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={shippingInfo.address}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={shippingInfo.city}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={shippingInfo.state}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        name="postal_code"
                                        value={shippingInfo.postal_code}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={shippingInfo.country}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full mt-6 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Processing...' : 'Place Order'}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    
                    <div className="space-y-3 mb-4">
                        {cart.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center py-2 border-b">
                                <div className="flex-1">
                                    <h3 className="font-medium">{item.product.name}</h3>
                                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>₹{cart.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span>₹{cart.shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total:</span>
                            <span>₹{cart.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
