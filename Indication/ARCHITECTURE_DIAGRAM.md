# 🏗️ P.A.R.C.E - Architecture Diagram

## 📐 Application Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         main.tsx                             │
│                    <AuthProvider>                            │
│                        <App />                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│                    <Router> + Routes                         │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │  Public  │  │Protected │  │Protected │
         │  Routes  │  │  Routes  │  │  Routes  │
         └──────────┘  └──────────┘  └──────────┘
              │             │             │
              ▼             ▼             ▼
         Landing      Admin Routes   User Routes   Mechanic Routes
         Login        ├─ Dashboard   ├─ Services   ├─ Dashboard
         Register     └─ CRUD        ├─ Profile    ├─ Orders
         Role Select                 └─ Contact    ├─ Profile
                                                    └─ Contact
```

## 🔐 Authentication Flow

```
┌──────────────┐
│ AuthContext  │ ◄─── Provides user state & role
└──────────────┘
       │
       ├─► Navbar (displays user info)
       ├─► Sidebar (shows role-specific menu)
       └─► ProtectedRoute (guards routes by role)
```

## 🎭 Role-Based Access Control

```
┌─────────────────────────────────────────────────────────────┐
│                      User Roles                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐   │
│  │  ADMIN   │         │   USER   │         │ MECHANIC │   │
│  └──────────┘         └──────────┘         └──────────┘   │
│       │                    │                     │          │
│       ▼                    ▼                     ▼          │
│  Dashboard            Services             Dashboard        │
│  CRUD                 Contact              Orders           │
│                       Profile              Profile          │
│                                            Contact          │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
PARCE/
├── public/
│   ├── Logo.jpg
│   └── _redirects (SPA routing)
│
├── src/
│   ├── components/
│   │   ├── Logo.tsx
│   │   ├── Navbar.tsx (role-aware)
│   │   ├── Sidebar.tsx (role-aware)
│   │   └── ProtectedRoute.tsx (route guard)
│   │
│   ├── context/
│   │   └── AuthContext.tsx (state management)
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── RoleSelectionPage.tsx
│   │   │
│   │   ├── DashboardPage.tsx (admin)
│   │   ├── CRUDPage.tsx (admin)
│   │   │
│   │   ├── ServicesPage.tsx (user)
│   │   ├── ProfilePage.tsx (user)
│   │   ├── ServiceInProgressPage.tsx (user)
│   │   ├── PaymentPage.tsx (user)
│   │   ├── SatisfactionSurveyPage.tsx (user)
│   │   │
│   │   ├── MechanicDashboardPage.tsx (mechanic)
│   │   ├── MechanicOrdersPage.tsx (mechanic)
│   │   ├── MechanicProfilePage.tsx (mechanic)
│   │   ├── MechanicVehicleInfoPage.tsx (mechanic)
│   │   │
│   │   └── ContactPage.tsx (user + mechanic)
│   │
│   ├── App.tsx (routing)
│   ├── main.tsx (entry point)
│   └── index.css (global styles)
│
├── netlify.toml (deployment config)
├── package.json
├── tailwind.config.js (theme: anthracite + gold)
├── vite.config.ts
└── tsconfig.json
```

## 🎨 Design System

```
┌─────────────────────────────────────────────────────────────┐
│                      Color Palette                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Primary: Anthracite Gray (#2D3436, #1E2022, #0F1011)      │
│  Secondary: Metallic Gold (#D4AF37, #C5A028, #B69121)      │
│  Accents: Dark tones for backgrounds and cards              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

```
┌──────────────┐
│   User       │
└──────┬───────┘
       │
       ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Login Page  │─────►│ AuthContext  │─────►│ Role Select  │
└──────────────┘      └──────────────┘      └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Set User Role│
                      └──────────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
           Admin Route  User Route  Mechanic Route
```

## 🛡️ Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Stack                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Authentication Check (isAuthenticated)            │
│           └─► Redirect to /login if not authenticated       │
│                                                              │
│  Layer 2: Role Verification (allowedRoles)                  │
│           └─► Redirect to role-specific home if unauthorized│
│                                                              │
│  Layer 3: Component-Level Guards                            │
│           └─► Navbar/Sidebar adapt to user role             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment Pipeline

```
┌──────────────┐
│ Local Dev    │
└──────┬───────┘
       │ npm run build
       ▼
┌──────────────┐
│ Build (Vite) │
└──────┬───────┘
       │ generates dist/
       ▼
┌──────────────┐
│   Netlify    │
└──────┬───────┘
       │ deploys from main branch
       ▼
┌──────────────┐
│ Production   │
└──────────────┘
```

## 📊 Component Hierarchy

```
App
├── Router
    ├── Public Routes
    │   ├── LandingPage
    │   │   └── Navbar (public)
    │   ├── LoginPage
    │   │   └── Logo
    │   ├── RegisterPage
    │   │   └── Logo
    │   └── RoleSelectionPage
    │       └── Logo
    │
    └── Protected Routes
        ├── Admin
        │   ├── DashboardPage
        │   │   ├── Navbar (admin)
        │   │   └── Sidebar (admin)
        │   └── CRUDPage
        │       ├── Navbar (admin)
        │       └── Sidebar (admin)
        │
        ├── User
        │   ├── ServicesPage
        │   │   ├── Navbar (user)
        │   │   └── Sidebar (user)
        │   ├── ProfilePage
        │   │   ├── Navbar (user)
        │   │   └── Sidebar (user)
        │   └── ContactPage
        │       └── Navbar (user)
        │
        └── Mechanic
            ├── MechanicDashboardPage
            │   ├── Navbar (mechanic)
            │   └── Sidebar (mechanic)
            ├── MechanicOrdersPage
            │   ├── Navbar (mechanic)
            │   └── Sidebar (mechanic)
            ├── MechanicProfilePage
            │   ├── Navbar (mechanic)
            │   └── Sidebar (mechanic)
            └── ContactPage
                └── Navbar (mechanic)
```

---

**Architecture Version**: 1.0  
**Last Updated**: May 26, 2026  
**Status**: ✅ Production Ready
