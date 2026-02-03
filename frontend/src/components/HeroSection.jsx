import { Link } from 'react-router-dom';
import { FaShoppingBag, FaTruck, FaShieldAlt } from 'react-icons/fa';

const HeroSection = () => {
    return (
        <div className="relative w-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div>
            
            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                            Welcome to
                            <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                                OpenShop
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            Discover amazing products at unbeatable prices. Your one-stop shop for quality and convenience.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link 
                                to="/products"
                                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl text-center flex items-center justify-center"
                            >
                                <FaShoppingBag className="mr-3 text-xl" />
                                Shop Now
                            </Link>
                            <Link 
                                to="/register"
                                className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200 text-center"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="flex items-center space-x-4 group">
                                    <div className="bg-white/20 rounded-2xl p-4 group-hover:bg-white/30 transition-colors duration-200">
                                        <FaTruck className="text-3xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Free Shipping</h3>
                                        <p className="text-sm text-blue-100">On orders over ₹500</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 group">
                                    <div className="bg-white/20 rounded-2xl p-4 group-hover:bg-white/30 transition-colors duration-200">
                                        <FaShieldAlt className="text-3xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Secure Payment</h3>
                                        <p className="text-sm text-blue-100">100% secure transactions</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 group">
                                    <div className="bg-white/20 rounded-2xl p-4 group-hover:bg-white/30 transition-colors duration-200">
                                        <FaShoppingBag className="text-3xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Quality Products</h3>
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
