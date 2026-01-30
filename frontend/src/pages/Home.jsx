import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import HeroSection from '../components/HeroSection';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsResponse, categoriesResponse] = await Promise.all([
                api.get('/products?limit=8'),
                api.get('/categories')
            ]);
            
            setProducts(productsResponse.data.data.data || productsResponse.data.data || []);
            setCategories(categoriesResponse.data.data || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Hero Section */}
            <HeroSection />

            {/* Categories Section */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Shop by Category</h2>
                        <p className="text-gray-600">Browse our wide range of categories</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {categories
                            .filter(cat => !cat.parent_id) // Only show parent categories
                            .slice(0, 10)
                            .map(category => (
                                <CategoryCard key={category.id} category={category} />
                            ))}
                    </div>
                    
                    <div className="text-center mt-8">
                        <Link 
                            to="/products"
                            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                        >
                            View All Products
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Featured Products</h2>
                        <p className="text-gray-600">Check out our latest and greatest products</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.length > 0 ? (
                            products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500">
                                No products found.
                            </div>
                        )}
                    </div>

                    <div className="text-center mt-8">
                        <Link 
                            to="/products"
                            className="inline-block border-2 border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-600 hover:text-white"
                        >
                            Browse All Products
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🚚</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                            <p className="text-gray-600">Get your products delivered within 2-3 business days</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💰</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
                            <p className="text-gray-600">Competitive prices and regular discounts</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🎧</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                            <p className="text-gray-600">Our customer support team is always here to help</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
