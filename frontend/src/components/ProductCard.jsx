import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import api from '../services/api';

const ProductCard = ({ product }) => {
    const { user } = useAuth();

    const addToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            alert('Please login to add to cart'); // Replace with toast later
            return;
        }
        try {
            await api.post('/cart/add', { product_id: product.id, quantity: 1 });
            alert('Added to cart!'); // Replace with toast later
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="group bg-white rounded-lg border border-gray-100 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-shadow duration-300 overflow-hidden h-full flex flex-col relative">

            {/* Discount Badge */}
            {product.discount_percentage > 0 && (
                <span className="absolute top-2 left-2 bg-[#CC0C39] text-white text-xs font-bold px-2 py-1 rounded-sm z-10">
                    -{product.discount_percentage}%
                </span>
            )}

            {/* Image Container */}
            <Link to={`/products/${product.id}`} className="block relative pt-4 px-4 h-52 flex items-center justify-center bg-white group-hover:scale-105 transition-transform duration-300">
                <img
                    src={product.images && product.images.length > 0 ? product.images[0].image_path : '/placeholder.jpg'}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                />
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Title */}
                <Link to={`/products/${product.id}`} className="text-sm font-medium text-gray-900 hover:text-[#C7511F] line-clamp-2 mb-1 min-h-[40px]" title={product.name}>
                    {product.name}
                </Link>

                {/* Rating */}
                <div className="flex items-center mb-2">
                    <div className="flex text-[#F08804]">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">1,234</span>
                </div>

                {/* Price */}
                <div className="mt-auto">
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-gray-900">
                            ${product.price}
                        </span>
                        {product.original_price && (
                            <span className="text-xs text-gray-500 line-through">
                                ${product.original_price}
                            </span>
                        )}
                    </div>

                    {/* Add to Cart Button (Hidden by default, shown on hover/mobile) */}
                    <button
                        onClick={addToCart}
                        className="w-full mt-3 bg-[#FFD814] hover:bg-[#F7CA00] text-black border border-[#FCD200] rounded-full py-2 text-sm font-medium transition-colors shadow-sm active:scale-95 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
