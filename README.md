# P.A.R.C.E - Plataforma de Asistencia Rápida Para Conductores en Emergencia

Modern React + TypeScript + TailwindCSS application recreating the P.A.R.C.E mockups with a premium dark theme featuring ice blue, purple, and graphite gray accents.

## 🚀 Features

- **Modern Tech Stack**: React 18, TypeScript, Vite, TailwindCSS
- **Premium Dark Theme**: Ice blue, purple, and graphite color palette
- **Smooth Animations**: Framer Motion for fluid transitions
- **Responsive Design**: Mobile, tablet, and desktop support
- **Component Architecture**: Reusable, scalable components
- **Icon System**: Lucide React icons
- **Charts & Visualizations**: Recharts for data display
- **Accessibility**: ARIA labels, focus states, proper contrast

## 📁 Project Structure

```
parce-app/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Logo.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   ├── pages/              # Page components
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── RoleSelectionPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ServicesPage.tsx
│   │   ├── ServiceInProgressPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── MechanicProfilePage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── PaymentPage.tsx
│   │   └── SatisfactionSurveyPage.tsx
│   ├── App.tsx             # Main app with routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🎨 Design System

### Color Palette

- **Primary (Ice Blue)**: `#0ea5e9` - Main brand color
- **Purple**: `#a855f7` - Secondary accent
- **Dark**: `#0f172a` to `#1e293b` - Background gradients
- **Graphite**: `#1f2937` to `#111827` - UI elements

### Components

- **Buttons**: Primary, Secondary, Outline variants
- **Cards**: Glass-morphism effect with backdrop blur
- **Inputs**: Dark theme with focus states
- **Sidebar**: Collapsible navigation
- **Navbar**: Fixed header with user menu

## 🛠️ Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Run development server**:
```bash
npm run dev
```

3. **Build for production**:
```bash
npm run build
```

4. **Preview production build**:
```bash
npm run preview
```

## 📱 Pages Overview

### Public Pages
- **Landing Page** (`/`): Hero section with features
- **Login** (`/login`): User authentication
- **Register** (`/register`): New user registration
- **Role Selection** (`/role-selection`): Choose user type

### Authenticated Pages
- **Dashboard** (`/dashboard`): Statistics and charts
- **Services** (`/services`): Browse available services
- **Service In Progress** (`/service-in-progress`): Track active service
- **Profile** (`/profile`): User profile management
- **Mechanic Profile** (`/mechanic-profile`): Mechanic details
- **Contact** (`/contact`): Contact form
- **Payment** (`/payment`): Payment methods
- **Survey** (`/survey`): Satisfaction survey

## 🎯 Key Features

### Dashboard
- Monthly service history chart
- Active mechanics counter
- User recommendation percentage
- Service rating display
- Interactive calendar
- Comparison charts

### Services
- Service cards with descriptions
- Estimated duration
- Pagination
- Smooth animations
- Service selection

### Payment System
- Multiple payment methods (Cash, Card, Transfer)
- QR code for transfers
- Card details form
- Success confirmation

### Profile Management
- Photo upload
- Editable fields
- Role display
- Account deletion

## 🔧 Customization

### Colors
Edit `tailwind.config.js` to customize the color palette:

```javascript
colors: {
  primary: { ... },
  purple: { ... },
  dark: { ... },
  graphite: { ... },
}
```

### Animations
Modify animation durations in `tailwind.config.js`:

```javascript
animation: {
  'fade-in': 'fadeIn 0.5s ease-in-out',
  'slide-up': 'slideUp 0.5s ease-out',
}
```

## 📦 Dependencies

- **react**: ^18.2.0
- **react-dom**: ^18.2.0
- **react-router-dom**: ^6.20.0
- **framer-motion**: ^10.16.16
- **lucide-react**: ^0.294.0
- **recharts**: ^2.10.3
- **tailwindcss**: ^3.3.6
- **typescript**: ^5.2.2
- **vite**: ^5.0.8

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is private and proprietary.

## 👥 Team

P.A.R.C.E Development Team

---

Built with ❤️ using React, TypeScript, and TailwindCSS
