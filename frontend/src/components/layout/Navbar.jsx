import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, Search, ShoppingCart, User, Heart, X, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Unused state placeholder
    const searchCategory = 'All';

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-[#131921] text-white">
            {/* Main Navbar */}
            <div className="w-full h-16 flex items-center px-4 justify-between gap-4">

                {/* Left: Mobile Menu & Logo */}
                <div className="flex items-center gap-2 lg:gap-4">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="lg:hidden p-1 hover:border hover:border-white rounded"
                    >
                        <Menu className="w-7 h-7" />
                    </button>

                    <Link to="/" className="flex flex-col leading-none hover:border hover:border-white p-1 rounded">
                        <span className="text-xl font-bold tracking-wide">OpenShop</span>
                        <span className="text-xs text-gray-300 italic -mt-1 text-right">prime</span>
                    </Link>
                </div>

                {/* Center: Search Bar (Hidden on Mobile, shown below) */}
                <div className="hidden lg:flex flex-1 max-w-3xl h-10 bg-white rounded-md overflow-hidden focus-within:ring-3 focus-within:ring-[#F3A847]">
                    <div className="bg-gray-100 border-r border-gray-300 px-3 flex items-center text-gray-600 text-xs cursor-pointer hover:bg-gray-200 transition-colors">
                        <span className="mr-1">{searchCategory}</span>
                        <ChevronDown className="w-3 h-3" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search OpenShop"
                        className="flex-1 px-3 text-black focus:outline-none"
                    />
                    <button className="bg-[#FEBD69] hover:bg-[#F3A847] w-12 flex items-center justify-center transition-colors">
                        <Search className="w-6 h-6 text-black" />
                    </button>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 lg:gap-4 text-sm font-medium">

                    {/* Account & Lists */}
                    <div className="hidden lg:flex flex-col p-2 hover:border hover:border-white rounded cursor-pointer relative group">
                        <span className="text-xs text-gray-300 font-normal">Hello, {user?.name || 'sign in'}</span>
                        <div className="flex items-center font-bold leading-none">
                            Account & Lists <ChevronDown className="w-3 h-3 ml-1" />
                        </div>

                        {/* Dropdown */}
                        <div className="absolute top-12 right-0 w-64 bg-white text-black rounded shadow-lg hidden group-hover:block p-4">
                            <div className="text-center mb-4">
                                {!user ? (
                                    <>
                                        <Link to="/login" className="block w-full bg-[#FFD814] py-1 rounded text-xs font-bold mb-2 shadow-sm">Sign in</Link>
                                        <p className="text-xs">New customer? <Link to="/register" className="text-blue-600 hover:align-text-bottom">Start here.</Link></p>
                                    </>
                                ) : (
                                    <button onClick={handleLogout} className="block w-full bg-gray-100 hover:bg-gray-200 border py-1 rounded text-xs font-bold">Sign Out</button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h4 className="font-bold mb-2">Your Lists</h4>
                                    <Link to="/wishlist" className="block text-gray-600 hover:text-[#E47911] hover:underline text-xs mb-1">Wish List</Link>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-2">Your Account</h4>
                                    <Link to="/profile" className="block text-gray-600 hover:text-[#E47911] hover:underline text-xs mb-1">Account</Link>
                                    <Link to="/orders" className="block text-gray-600 hover:text-[#E47911] hover:underline text-xs mb-1">Orders</Link>
                                    {user?.roles?.some(r => ['admin', 'seller'].includes(r.name)) && (
                                        <Link to="/dashboard" className="block text-gray-600 hover:text-[#E47911] hover:underline text-xs mb-1">Dashboard</Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Returns & Orders */}
                    <Link to="/orders" className="hidden lg:flex flex-col p-2 hover:border hover:border-white rounded cursor-pointer">
                        <span className="text-xs text-gray-300 font-normal">Returns</span>
                        <span className="font-bold leading-none">& Orders</span>
                    </Link>

                    {/* Cart */}
                    <Link to="/cart" className="flex items-end p-2 hover:border hover:border-white rounded cursor-pointer relative">
                        <div className="relative">
                            <ShoppingCart className="w-8 h-8" />
                            <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[#F08804] font-bold text-base">0</span>
                        </div>
                        <span className="font-bold hidden lg:inline mb-1">Cart</span>
                    </Link>
                </div>
            </div>

            {/* Mobile Search - Visible Only on Mobile */}
            <div className="lg:hidden bg-[#232f3e] p-3">
                <div className="h-10 bg-white rounded-md flex overflow-hidden">
                    <input
                        type="text"
                        placeholder="Search OpenShop"
                        className="flex-1 px-3 text-black focus:outline-none"
                    />
                    <button className="bg-[#FEBD69] w-10 flex items-center justify-center">
                        <Search className="w-5 h-5 text-black" />
                    </button>
                </div>
            </div>

            {/* Secondary Navbar (Categories) */}
            <div className="bg-[#232f3e] h-10 flex items-center px-4 text-sm font-medium gap-4 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="flex items-center gap-1 hover:border hover:border-white px-2 py-1 rounded"
                >
                    <Menu className="w-4 h-4" /> All
                </button>
                {['Today\'s Deals', 'Customer Service', 'Registry', 'Gift Cards', 'Sell'].map((item) => (
                    <Link key={item} to="/" className="whitespace-nowrap hover:border hover:border-white px-2 py-1 rounded">
                        {item}
                    </Link>
                ))}
            </div>

            {/* Mobile Sidebar Navigation */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/80 z-[60]"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            className="fixed top-0 left-0 w-[80%] max-w-[365px] h-full bg-white z-[70] text-black overflow-y-auto"
                        >
                            <div className="bg-[#232f3e] text-white p-4 font-bold text-lg flex items-center gap-2">
                                <User className="w-6 h-6" /> Hello, {user?.name || 'Sign in'}
                                <button className="ml-auto" onClick={() => setIsMenuOpen(false)}>
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>

                            <div className="p-4 space-y-6">
                                <div className="border-b pb-4">
                                    <h3 className="font-bold text-lg mb-2">Trending</h3>
                                    <div className="space-y-3 text-sm text-gray-700">
                                        <p>Best Sellers</p>
                                        <p>New Releases</p>
                                        <p>Movers & Shakers</p>
                                    </div>
                                </div>
                                <div className="border-b pb-4">
                                    <h3 className="font-bold text-lg mb-2">Shop By Category</h3>
                                    <div className="space-y-3 text-sm text-gray-700">
                                        <p>Electronics</p>
                                        <p>Computers</p>
                                        <p>Smart Home</p>
                                        <p>Arts & Crafts</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-2">Help & Settings</h3>
                                    <div className="space-y-3 text-sm text-gray-700">
                                        <p>Your Account</p>
                                        <p>Customer Service</p>
                                        <p>Sign Out</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
