/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#16A34A', // Brand / CTA / Add to Cart
                    dark: '#166534',    // Navbar / Footer / Hover
                },
                accent: {
                    DEFAULT: '#FACC15', // Offers / Buy Now / Discount
                },
                background: '#F7FEE7',  // Page Background
                card: '#FFFFFF',        // Cards / Modals
                text: {
                    heading: '#14532D',
                    body: '#1F2937',
                    muted: '#6B7280',
                },
                status: {
                    success: '#22C55E',
                    error: '#EF4444',
                    warning: '#F59E0B',
                },
                border: '#E5E7EB', // Gray-200
            }
        },
    },
    plugins: [],
}
