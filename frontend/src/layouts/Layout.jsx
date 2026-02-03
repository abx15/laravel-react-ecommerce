import { Link, Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col w-full relative overflow-x-hidden font-sans">
            <Navbar />
            <main className="flex-grow w-full mt-24 lg:mt-28"> {/* Offset for fixed navbar */}
                <Outlet />
            </main>

            {/* Amazon-style Footer */}
            <footer className="w-full bg-[#232f3e] text-white mt-auto">
                <div className="py-8 bg-[#37475a] text-center cursor-pointer hover:bg-[#485769] transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <span className="font-medium text-sm">Back to top</span>
                </div>

                <div className="w-full max-w-[1000px] mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold mb-3 text-base">Get to Know Us</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link to="/about" className="hover:underline">About Us</Link></li>
                            <li><Link to="/careers" className="hover:underline">Careers</Link></li>
                            <li><Link to="/press" className="hover:underline">Press Releases</Link></li>
                            <li><Link to="/science" className="hover:underline">OpenShop Science</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-3 text-base">Make Money with Us</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link to="/sell" className="hover:underline">Sell on OpenShop</Link></li>
                            <li><Link to="/affiliate" className="hover:underline">Become an Affiliate</Link></li>
                            <li><Link to="/advertise" className="hover:underline">Advertise Your Products</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-3 text-base">Payment Products</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link to="/card" className="hover:underline">OpenShop Business Card</Link></li>
                            <li><Link to="/points" className="hover:underline">Shop with Points</Link></li>
                            <li><Link to="/reload" className="hover:underline">Reload Your Balance</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-3 text-base">Let Us Help You</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link to="/covid" className="hover:underline">OpenShop and COVID-19</Link></li>
                            <li><Link to="/account" className="hover:underline">Your Account</Link></li>
                            <li><Link to="/orders" className="hover:underline">Your Orders</Link></li>
                            <li><Link to="/help" className="hover:underline">Help</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-600 py-8 text-center bg-[#131921]">
                    <div className="flex justify-center items-center gap-8 text-xs text-gray-300 mb-2">
                        <Link to="/privacy" className="hover:underline">Conditions of Use</Link>
                        <Link to="/privacy" className="hover:underline">Privacy Notice</Link>
                        <Link to="/ads" className="hover:underline">Consumer Health Data Privacy Disclosure</Link>
                    </div>
                    <p className="text-xs text-gray-400">&copy; 1996-{new Date().getFullYear()}, OpenShop.com, Inc. or its affiliates</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
