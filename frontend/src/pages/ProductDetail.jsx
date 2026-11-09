import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { assetUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        api.get(`/products/${id}`)
            .then(res => setProduct(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    const addToCart = async () => {
        if (!user) {
            alert('Please login');
            return;
        }
        try {
            await api.post('/cart/add', { product_id: product.id, quantity });
            window.dispatchEvent(new Event('cart:updated'));
            alert('Added to cart');
        } catch (err) {
            console.error(err);
            alert('Failed to add');
        }
    };

    if (loading) return <div className="py-10 text-center">Loading...</div>;
    if (!product) return <div className="py-10 text-center">Product not found.</div>;

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
                <div className="md:w-1/2 p-4 bg-gray-100 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                        <img
                            src={assetUrl(product.images[0].image_path)}
                            alt={product.name}
                            className="max-h-96 w-full object-contain"
                        />
                    ) : (
                        <span className="text-gray-400">No Image</span>
                    )}
                </div>
                <div className="md:w-1/2 p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                    <div className="text-2xl text-blue-600 font-semibold mb-4">₹{product.price}</div>
                    <p className="text-gray-600 mb-6">{product.description}</p>

                    <div className="flex items-center space-x-4 mb-6">
                        <label className="font-semibold text-gray-700">Quantity:</label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Math.min(Number(product.stock) || 1, Number.parseInt(e.target.value, 10) || 1)))}
                            className="w-20 border rounded p-2 text-center"
                        />
                    </div>

                    <button
                        onClick={addToCart}
                        disabled={product.stock < 1}
                        className={`w-full py-3 rounded font-bold text-white transition ${product.stock > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
