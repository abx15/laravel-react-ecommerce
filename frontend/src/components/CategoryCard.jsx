import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
    return (
        <Link 
            to={`/products?category=${category.id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
        >
            <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="text-4xl mb-2">
                        {category.name === 'Electronics' && '📱'}
                        {category.name === 'Clothing' && '👕'}
                        {category.name === 'Home & Garden' && '🏠'}
                        {category.name === 'Sports' && '⚽'}
                        {category.name === 'Books' && '📚'}
                        {category.name === 'Smartphones' && '📱'}
                        {category.name === 'Laptops' && '💻'}
                        {category.name === 'Headphones' && '🎧'}
                        {category.name === 'Men\'s Clothing' && '👔'}
                        {category.name === 'Women\'s Clothing' && '👗'}
                        {category.name === 'Kids Clothing' && '👶'}
                        {!['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Smartphones', 'Laptops', 'Headphones', 'Men\'s Clothing', 'Women\'s Clothing', 'Kids Clothing'].includes(category.name) && '📦'}
                    </div>
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {category.name}
                </h3>
                {category.children && category.children.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                        {category.children.length} subcategories
                    </p>
                )}
            </div>
        </Link>
    );
};

export default CategoryCard;
