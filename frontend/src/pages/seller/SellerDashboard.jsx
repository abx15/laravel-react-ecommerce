import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const SellerDashboard = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/seller/products');
            setProducts(response.data.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-text-heading">Seller Dashboard</h1>
                <button
                    onClick={() => navigate('/seller/products/create')}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition shadow"
                >
                    + Add New Product
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Image</th>
                            <th className="px-6 py-4 font-medium">Product Name</th>
                            <th className="px-6 py-4 font-medium">Price</th>
                            <th className="px-6 py-4 font-medium">Stock</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                                            {product.images && product.images.length > 0 && (
                                                <img
                                                    src={`http://localhost:8000${product.images[0].image_path}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-text-heading">{product.name}</td>
                                    <td className="px-6 py-4 text-primary font-bold">₹{product.price}</td>
                                    <td className="px-6 py-4">
                                        {product.stock > 0 ? (
                                            <span className="text-green-600">{product.stock} in stock</span>
                                        ) : (
                                            <span className="text-red-500">Out of stock</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {product.is_active ? 'Active' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => navigate(`/seller/products/${product.id}/edit`)}
                                            className="text-blue-600 hover:underline mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-500 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No products found. Start selling by adding a product!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SellerDashboard;
