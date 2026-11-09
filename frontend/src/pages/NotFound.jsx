import { Link } from 'react-router-dom';
import { ArrowLeft, Home, SearchX } from 'lucide-react';

const NotFound = () => (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <SearchX className="h-10 w-10" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Error 404</p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">Page not found</h1>
        <p className="mt-3 max-w-md text-gray-600">
            The page may have moved, or the link may be incorrect. Let’s get you back to shopping.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700">
                <Home className="h-4 w-4" aria-hidden="true" />
                Go to homepage
            </Link>
            <Link to="/products" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Browse products
            </Link>
        </div>
    </main>
);

export default NotFound;
