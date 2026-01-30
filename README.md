# 🛒 OpenShop - Open Source E-Commerce Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Laravel](https://img.shields.io/badge/backend-Laravel_11-red.svg)
![React](https://img.shields.io/badge/frontend-React_18-cyan.svg)
![Vercel](https://img.shields.io/badge/deploy-Vercel-black.svg)
![Status](https://img.shields.io/badge/status-Production_Ready-green.svg)

A production-grade, fully open-source E-Commerce platform built with **Laravel 11 (API)** and **React 18**. Designed for scalability, security, and exceptional developer experience.

## 🚀 Key Features

### 🎯 Core Functionality
- **Multi-role Authentication**: Users, Admins, and Super Admins
- **Product Catalog**: Complete CRUD with image uploads and categories
- **Shopping Cart**: Persistent cart with real-time updates
- **Order Management**: Full order lifecycle with status tracking
- **Payment Integration**: Secure Razorpay payments with server-side verification
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend (Laravel API)
- **Authentication**: Laravel Sanctum token-based authentication
- **RBAC**: Role-Based Access Control via Spatie Permissions
- **API Standards**: RESTful design with proper HTTP codes
- **Database**: MySQL with optimized migrations and seeders
- **Security**: Input validation, rate limiting, and CORS protection

### Frontend (React)
- **Modern Stack**: React 18, Vite, Tailwind CSS
- **State Management**: Context API with custom hooks
- **Components**: Reusable UI components with consistent design
- **Routing**: React Router with protected routes
- **Admin Dashboard**: Complete admin panel for store management

## 🛠 Tech Stack

### Backend
- **PHP 8.2+**, **Laravel 11**, **MySQL 8**
- **Laravel Sanctum** (Authentication)
- **Spatie Laravel-Permission** (RBAC)
- **Intervention Image** (Image Processing)
- **Razorpay** (Payment Gateway)

### Frontend
- **React 18**, **Vite**, **Tailwind CSS 3**
- **React Router DOM**, **Axios**
- **React Icons**, **Lucide Icons**
- **PostCSS**, **Autoprefixer**

### DevOps & Deployment
- **Vercel** (Frontend Hosting)
- **GitHub Actions** (CI/CD)
- **Docker Ready** (Coming Soon)

## 📂 Project Structure

```bash
ecomer/
├── backend/                 # Laravel API Backend
│   ├── app/                # Application logic
│   ├── database/           # Migrations & Seeders
│   ├── routes/             # API routes
│   ├── storage/            # File uploads
│   └── tests/              # PHPUnit tests
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── public/             # Static assets
├── .github/               # GitHub workflows
├── docs/                  # Documentation
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- **PHP 8.2+** & **Composer**
- **Node.js 18+** & **NPM**
- **MySQL 8+** or **MariaDB**
- **Git**

### 1. Clone & Setup
```bash
git clone https://github.com/YOUR_USERNAME/ecomer.git
cd ecomer
```

### 2. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Configure .env
DB_DATABASE=ecomer
DB_USERNAME=root
DB_PASSWORD=

# Setup database
php artisan migrate --seed
php artisan storage:link

# Start development server
php artisan serve
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5175
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:5175/admin

## 🔐 Default Credentials

### Admin User
- **Email**: admin@example.com
- **Password**: password

### Regular User
- **Email**: user@example.com  
- **Password**: password

## 📦 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `frontend/dist`
4. Deploy automatically on push to main branch

### Backend (Production)
```bash
# Environment variables
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database and cache optimization
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
php artisan test
```

### Frontend Tests (Coming Soon)
```bash
cd frontend
npm test
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Product Endpoints
- `GET /api/products` - List products
- `GET /api/products/{id}` - Get product details
- `POST /api/admin/products` - Create product (Admin)
- `PUT /api/admin/products/{id}` - Update product (Admin)
- `DELETE /api/admin/products/{id}` - Delete product (Admin)

### Cart & Order Endpoints
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/{id}` - Update cart item
- `DELETE /api/cart/{id}` - Remove from cart
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders

## 🎨 Customization

### Theming
Update `tailwind.config.js` to customize colors and design system.

### Adding New Features
1. Backend: Create controllers, models, and routes
2. Frontend: Create components and add routes
3. Update documentation

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Laravel](https://laravel.com) - The PHP Framework for Web Artisans
- [React](https://reactjs.org) - A JavaScript library for building user interfaces
- [Tailwind CSS](https://tailwindcss.com) - A utility-first CSS framework
- [Razorpay](https://razorpay.com) - Payment gateway solution

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 💝 Support & Sponsorship

Love OpenShop? Consider supporting our development:

- ⭐ **Star us on GitHub** - It helps others discover the project
- 💝 **Sponsor us** - [GitHub Sponsors](https://github.com/sponsors)
- 🐛 **Report issues** - Help us improve
- 📢 **Spread the word** - Share with your network

### How to Become a Sponsor

We welcome sponsors at all levels! Your support helps us maintain and improve OpenShop.

#### 🏆 Platinum Sponsors ($500+/month)
- Featured placement in README
- Logo on our website
- Priority support
- Custom integration opportunities

#### 🥈 Gold Sponsors ($200+/month)
- Featured placement in README
- Logo on our website
- Priority support

#### 🥉 Silver Sponsors ($50+/month)
- Logo placement in README
- Mention in release notes

#### ⭐ Bronze Sponsors ($10+/month)
- Name recognition in README
- Our eternal gratitude

To become a sponsor, please visit our [GitHub Sponsors page](https://github.com/sponsors) or contact us directly.

## �� Support

- 📧 Email: support@openshop.com
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR_USERNAME/ecomer/issues)
- 🤝 Discussions: [GitHub Discussions](https://github.com/YOUR_USERNAME/ecomer/discussions)
- 🎮 Discord: [Join our community](https://discord.gg/openshop)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

⭐ If this project helped you, please give it a star!

**Made with ❤️ by the OpenShop Community**
