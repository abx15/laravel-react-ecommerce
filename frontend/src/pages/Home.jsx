import { useEffect, useState } from 'react';
import api from '../services/api';
import ProductSlider from '../components/ProductSlider';
import CategorySlider from '../components/CategorySlider';
import Hero from '../components/home/Hero';

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

            const productsData = productsResponse.data.data;
            setProducts(productsData.data || productsData || []);

            const categoriesData = categoriesResponse.data.data;
            setCategories(categoriesData || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F3A847] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen pb-0">
            {/* Full Width Hero */}
            <Hero />

            {/* Content Wrapper - Overlapping Hero */}
            <div className="relative z-10 -mt-16 md:-mt-24 lg:-mt-32 pb-12">

                {/* 1. Categories & Featured Slider (Contained) */}
                <div className="container-custom space-y-8">
                    {/* Categories Slider */}
                    <div className="bg-white p-4 md:p-6 rounded-sm shadow-sm">
                        <CategorySlider
                            categories={categories}
                            title="Shop by Category"
                            subtitle="Browse our wide range of categories"
                        />
                    </div>

                    {/* Featured Products Slider */}
                    <div className="bg-white p-4 md:p-6 rounded-sm shadow-sm">
                        <ProductSlider
                            products={products}
                            title="Featured Products"
                            subtitle="Check out our latest and greatest products"
                        />
                    </div>
                </div>

                {/* 2. Full Width Promotional Banner */}
                <div className="w-full bg-[#232f3e] text-white py-12 mt-8">
                    <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold mb-2">Deal of the Day</h2>
                            <p className="text-gray-300 text-lg">Get up to 50% off on top tech brands. Limited time only!</p>
                        </div>
                        <button className="bg-[#FFD814] text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                            View All Deals
                        </button>
                    </div>
                </div>

                {/* 3. More Content (Contained) */}
                <div className="container-custom mt-8">
                    <div className="bg-white p-4 md:p-6 rounded-sm shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 px-4">New Arrivals</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4">
                            {products.slice(0, 4).map(product => (
                                <div key={product.id} className="border border-gray-100 p-4 rounded-lg flex flex-col items-center text-center hover:shadow-lg transition-shadow bg-gray-50">
                                    <div className="h-32 w-full flex items-center justify-center mb-4 mix-blend-multiply">
                                        <img src={product.images?.[0]?.image_path || '/placeholder.jpg'} alt={product.name} className="max-h-full max-w-full" />
                                    </div>
                                    <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h3>
                                    <span className="text-[#B12704] font-bold">${product.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Full Width 'Why Choose Us' Section */}
                <section className="w-full bg-white py-16 mt-12 border-t border-gray-200">
                    <div className="container-custom text-center">
                        <h2 className="text-3xl font-bold mb-10 text-[#131921]">Why Choose OpenShop</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-6 transition-transform hover:-translate-y-1">
                                <div className="w-16 h-16 bg-[#e7f4ff] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                    🚚
                                </div>
                                <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
                                <p className="text-sm text-gray-600">Get your products delivered fast with real-time tracking.</p>
                            </div>
                            <div className="p-6 transition-transform hover:-translate-y-1">
                                <div className="w-16 h-16 bg-[#f0fdf4] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                    💰
                                </div>
                                <h3 className="text-xl font-bold mb-2">Best Prices</h3>
                                <p className="text-sm text-gray-600">Competitive prices and daily deals to save you money.</p>
                            </div>
                            <div className="p-6 transition-transform hover:-translate-y-1">
                                <div className="w-16 h-16 bg-[#faf5ff] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                    🎧
                                </div>
                                <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
                                <p className="text-sm text-gray-600">Our customer support team is always here to help you.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
