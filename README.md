# 🛒 OpenShop - Professional E-Commerce Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![CI](https://github.com/abx15/laravel-react-ecommerce/actions/workflows/ci.yml/badge.svg)
![Laravel](https://img.shields.io/badge/backend-Laravel_11-red.svg)
![React](https://img.shields.io/badge/frontend-React_18-cyan.svg)
![Docker](https://img.shields.io/badge/docker-ready-2496ED.svg)

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
- **Security**: Input validation, rate limiting, and CORS protection

### Frontend (React)

- **Modern Stack**: React 18, Vite, Tailwind CSS
- **State Management**: Context API with custom hooks
- **Admin Dashboard**: Complete admin panel for store management
- **SPA Architecture**: Seamless client-side routing

## 🛠 Tech Stack

| Component | Technology |
|Info|Details|
| :--- | :--- |
| **Backend** | PHP 8.2+, Laravel 11, MySQL 8 |
| **Frontend** | React 18, Vite, Tailwind CSS, Headless UI |
| **Auth** | Laravel Sanctum, Spatie Permission |
| **DevOps** | Docker, GitHub Actions, Vercel |

## 📂 Project Structure

```bash
ecomer/
├── backend/                 # Laravel API Backend
├── frontend/                # React Frontend
├── .github/                 # CI/CD & Community Files
├── docker/                  # Docker Configs
├── vercel.json              # Vercel Deployment Config
├── Dockerfile               # Production Frontend Build
└── README.md                # Documentation
```

## 🚀 Quick Start (Local Development)

### Prerequisites

- PHP 8.2+ & Composer
- Node.js 18+ & NPM
- MySQL 8+

### 1. Clone & Setup

```bash
git clone https://github.com/abx15/laravel-react-ecommerce.git
cd laravel-react-ecommerce
```

### 2. Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Access the app at `http://localhost:5175`.

## 🐳 Docker Usage

We provide a production-ready Docker setup for the frontend.

### Build and Run

```bash
# Build the image
docker build -t ecomer-frontend .

# Run the container
docker run -p 8080:80 ecomer-frontend
```

Access the frontend at `http://localhost:8080`.

## 🔄 CI/CD Pipeline

This repository uses **GitHub Actions** for continuous integration:

- **Frontend Build**: Linting and building the React application.
- **Backend Tests**: Running PHPUnit tests with a MySQL service.

Check `.github/workflows/ci.yml` for details.

## ☁️ Deployment

### Vercel (Frontend)

This project is configured for Vercel. The `vercel.json` ensures that client-side routing works correctly.

1.  Import project to Vercel.
2.  Set Root Directory to `frontend` (or keep root and set Build Command `npm run build` in `frontend`).
3.  Deploy!

### Environment Variables

See `backend/.env.example` and `frontend/.env.example` for required variables.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 💖 Support & Sponsorship

If you find this project useful, please consider sponsoring:

- [**GitHub Sponsors**](https://github.com/sponsors/abx15)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Maintained by [Arun Kumar Bind](https://github.com/abx15)**
