import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag } from 'react-icons/fa';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const order = location.state?.order;

    if (!order) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
                <button
                    onClick={() => navigate('/')}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    Go Home
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h1>
                <p className="text-gray-600 mb-6">
                    Thank you for your order. Your order has been placed successfully and will be processed soon.
                </p>

                <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
                    <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="font-medium">Order ID:</span>
                            <span>#{order.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Total Amount:</span>
                            <span>₹{order.total_amount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Status:</span>
                            <span className="text-yellow-600">Pending</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Payment Status:</span>
                            <span className="text-yellow-600">Pending</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        View Orders
                    </button>
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
                    >
                        <FaShoppingBag />
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
