# HD Notes - Full Stack Notes Application

A modern, secure notes application built with React, TypeScript, Node.js, Express, and PostgreSQL. Features email OTP authentication, Google OAuth, and real-time note management.

## 🚀 Features

### Authentication

- **Email OTP Authentication** - Secure login with one-time passwords sent via email
- **Google OAuth** - Quick sign-in with Google accounts
- **JWT Token Management** - Automatic token refresh and secure session handling
- **Profile Completion** - Complete profile setup for Google OAuth users

### Notes Management

- **Create Notes** - Add personal notes up to 1000 characters
- **View Notes** - Browse all your notes with timestamps
- **Delete Notes** - Remove individual notes or bulk delete multiple notes
- **Real-time Updates** - Instant synchronization across sessions

### Security & UX

- **Rate Limiting** - Protection against spam and abuse
- **Input Validation** - Client and server-side validation
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Error Handling** - Comprehensive error management
- **Loading States** - Smooth user experience with loading indicators

## 🛠️ Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS 4** for styling
- **Lucide React** for icons
- **React Router DOM** for navigation

### Backend

- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL
- **Passport.js** for authentication strategies
- **Nodemailer** for email services
- **JWT** for token management

### Database

- **PostgreSQL** for data persistence
- **Prisma** for database migrations and queries

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database
- **Gmail account** (for email OTP)
- **Google Cloud Console** account (for Google OAuth)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hd-assignment
```

### 2. Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Environment Variables

Create `backend/.env` file:

```env
# Database
CLOUD_DB_URI="postgresql://username:password@localhost:5432/hd_notes"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Email Configuration (Gmail)
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASS="your-app-specific-password"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# Server
PORT=5000
NODE_ENV="development"
```

#### Frontend Environment Variables

Create `frontend/.env` file:

```env
VITE_API_BASE="http://localhost:5000/api"
```

### 4. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hd_notes;
\q
```

#### Run Migrations

```bash
cd backend
npm run db:generate
npm run db:migrate
```

### 5. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Set application type to **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://your-domain.vercel.app/api/auth/google/callback` (production)
7. Copy **Client ID** and **Client Secret** to your `.env` file

### 6. Gmail App Password Setup

1. Enable **2-Factor Authentication** on your Gmail account
2. Go to **Google Account** → **Security** → **App passwords**
3. Generate a new app password for "Mail"
4. Use this password in the `EMAIL_PASS` environment variable

### 7. Run the Application

#### Development Mode

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Access the application at `http://localhost:3000`

#### Production Build

**Backend:**

```bash
cd backend
npm run build
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```
