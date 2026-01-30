import { Link } from 'react-router-dom';
import { FaShoppingBag, FaTruck, FaShieldAlt } from 'react-icons/fa';

const HeroSection = () => {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Welcome to OpenShop
                        </h1>
                        <p className="text-xl mb-8 text-blue-100">
                            Discover amazing products at unbeatable prices. Your one-stop shop for quality and convenience.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link 
                                to="/products"
                                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
                            >
                                <FaShoppingBag className="inline mr-2" />
                                Shop Now
                            </Link>
                            <Link 
                                to="/register"
                                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-center"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center space-x-4">
                                    <FaTruck className="text-3xl" />
                                    <div>
                                        <h3 className="font-semibold">Free Shipping</h3>
                                        <p className="text-sm text-blue-100">On orders over ₹500</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <FaShieldAlt className="text-3xl" />
                                    <div>
                                        <h3 className="font-semibold">Secure Payment</h3>
                                        <p className="text-sm text-blue-100">100% secure transactions</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <FaShoppingBag className="text-3xl" />
                                    <div>
                                        <h3 className="font-semibold">Quality Products</h3>
                                        <p className="text-sm text-blue-100">Curated selection</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
