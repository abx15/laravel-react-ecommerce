import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
    return (
        <Link
            to={`/products?category=${category.id}`}
            className="group block bg-white rounded-lg cursor-pointer hover:shadow-lg transition-transform duration-300 transform hover:scale-105 overflow-hidden border border-gray-100 h-full flex flex-col"
        >
            <div className="relative aspect-square bg-[#F7F7F7] flex items-center justify-center p-4">
                <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300 filter drop-shadow-sm">
                    {category.name === 'Electronics' && '📱'}
                    {category.name === 'Fashion' && '👕'}
                    {category.name === 'Home' && '🏠'}
                    {category.name === 'Beauty' && '💄'}
                    {category.name === 'Sports' && '⚽'}
                    {category.name === 'Books' && '📚'}
                    {category.name === 'Smartphones' && '📲'}
                    {category.name === 'Laptops' && '💻'}
                    {category.name === 'Headphones' && '🎧'}
                    {!['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Smartphones', 'Laptops', 'Headphones'].includes(category.name) && '📦'}
                </div>
            </div>

            <div className="p-3 text-center flex-grow flex flex-col justify-center">
                <h3 className="font-bold text-gray-900 group-hover:text-[#C7511F] text-sm md:text-base line-clamp-2">
                    {category.name}
                </h3>
            </div>
        </Link>
    );
};

export default CategoryCard;
