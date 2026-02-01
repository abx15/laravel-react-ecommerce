# E-Commerce Platform - Login Details

## 🔐 Admin Access

### Super Admin Login
- **Email**: `superadmin@example.com`
- **Password**: `password123`
- **Role**: Super Admin
- **Access**: Complete system control, admin management, seller verification

### Admin Login
- **Email**: `admin@example.com`
- **Password**: `password123`
- **Role**: Admin
- **Access**: Product management, order management, user management

### Test User Login
- **Email**: `test@example.com`
- **Password**: `password123`
- **Role**: Customer
- **Access**: Shopping, order placement, profile management

## 🌐 Application Access

### Frontend (React)
- **Local Development**: `http://localhost:5175/`
- **Production**: `https://your-domain.com`

### Backend (Laravel API)
- **Local Development**: `http://localhost:8000/api`
- **Production**: `https://your-domain.com/api`

## 📋 Dashboard Features

### Admin Dashboard
- **Products**: Full CRUD operations (Create, Read, Update, Delete)
- **Orders**: Order management and status tracking
- **Users**: User management and viewing
- **Sellers**: Seller performance monitoring
- **Overview**: Statistics and revenue charts

### Super Admin Dashboard
- **Admin Management**: Add, edit, delete admin accounts
- **System Overview**: Platform-wide statistics
- **User Management**: Complete user oversight
- **Seller Verification**: Approve/reject seller applications
- **System Settings**: Platform configuration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PHP 8.2+
- MySQL 8+
- Composer
- npm/yarn

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/abx15/laravel-react-ecommerce.git
   cd laravel-react-ecommerce
   ```

2. **Backend Setup**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access Application**
   - Open `http://localhost:5175/` in your browser
   - Use the login credentials provided above

## 🔧 Development Commands

### Backend
```bash
php artisan serve          # Start development server
php artisan migrate        # Run migrations
php artisan db:seed        # Seed database
php artisan tinker         # Laravel console
```

### Frontend
```bash
npm run dev               # Start development server
npm run build             # Build for production
npm run preview           # Preview production build
```

## 📊 Database Structure

### Main Tables
- `users` - User accounts and authentication
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Customer orders
- `order_items` - Order line items
- `sellers` - Seller information

### Sample Data
The database comes pre-seeded with:
- 14 sample products
- 5 product categories
- 3 user accounts (as listed above)
- Sample orders and data

## 🎨 UI Features

### Premium Design Elements
- Gradient headers with modern styling
- Responsive design for all screen sizes
- Interactive charts and statistics
- Smooth animations and transitions
- Professional color schemes

### Key Components
- Tabbed dashboard interfaces
- Modal dialogs for CRUD operations
- Search and filtering functionality
- Data tables with sorting
- Form validation and error handling

## 🔒 Security Notes

- All passwords are for development/demo purposes only
- Change default passwords in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Regular security updates recommended

## 📞 Support

For issues or questions:
1. Check the documentation
2. Review error logs
3. Test with provided credentials
4. Report bugs with detailed information

---

**⚠️ Important**: This file contains sensitive information and should not be committed to version control in production environments.
