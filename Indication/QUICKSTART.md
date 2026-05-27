# 🚀 Quick Start Guide - P.A.R.C.E

Get the P.A.R.C.E application running in 5 minutes!

## Prerequisites

Make sure you have installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

Check your versions:
```bash
node --version  # Should be v18+
npm --version   # Should be v9+
```

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React & React DOM
- TypeScript
- TailwindCSS
- Framer Motion
- Lucide React (icons)
- Recharts (charts)
- React Router

### 2. Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### 3. Open in Browser

Navigate to: **http://localhost:5173**

You should see the P.A.R.C.E landing page!

## 🗺️ Navigation Guide

### Public Routes (No Login Required)

1. **Landing Page** - `http://localhost:5173/`
   - Hero section with P.A.R.C.E branding
   - Features showcase
   - Call-to-action buttons

2. **Login** - `http://localhost:5173/login`
   - Email and password fields
   - Click "Iniciar Sesión" to access dashboard

3. **Register** - `http://localhost:5173/register`
   - Create new account
   - Email, password, confirm password
   - Leads to role selection

4. **Role Selection** - `http://localhost:5173/role-selection`
   - Choose: Usuario, Mecánico, or Administrador
   - Each role has different dashboard views

### Authenticated Routes (After Login)

5. **Dashboard** - `http://localhost:5173/dashboard`
   - Statistics and charts
   - Monthly service history
   - Active mechanics counter
   - Rating display

6. **Services** - `http://localhost:5173/services`
   - Browse available services
   - Service cards with descriptions
   - Pagination controls

7. **Service In Progress** - `http://localhost:5173/service-in-progress`
   - Track active service
   - Map view (placeholder)
   - Mechanic information
   - Estimated time

8. **Profile** - `http://localhost:5173/profile`
   - Edit personal information
   - Change password
   - Upload profile photo
   - Delete account

9. **Mechanic Profile** - `http://localhost:5173/mechanic-profile`
   - View mechanic details
   - Service portfolio
   - Ratings and reviews
   - Contact information

10. **Contact** - `http://localhost:5173/contact`
    - Contact form
    - Business hours
    - Phone number

11. **Payment** - `http://localhost:5173/payment`
    - Choose payment method
    - Cash, Card, or Transfer
    - Payment forms

12. **Survey** - `http://localhost:5173/survey`
    - Satisfaction survey
    - 5-star rating system
    - Multiple questions

## 🎨 Testing the UI

### Try These Interactions

1. **Landing Page**
   - Click "Registro" → Goes to register page
   - Click "Ver Servicios" → Goes to services page

2. **Login Flow**
   - Enter any email/password
   - Click "Iniciar Sesión"
   - Redirects to dashboard

3. **Dashboard**
   - View animated charts
   - Check statistics cards
   - Navigate using sidebar

4. **Services**
   - Browse service cards
   - Use pagination arrows
   - Click "PEDIR" on any service

5. **Payment**
   - Select payment method
   - Fill out forms
   - Click confirm to see success modal

6. **Survey**
   - Click stars to rate
   - Submit survey

## 🎯 Key Features to Explore

### Animations
- Page transitions (fade in + slide up)
- Button hover effects (scale + glow)
- Card hover animations
- Modal animations

### Responsive Design
- Resize browser window
- Test mobile view (< 768px)
- Test tablet view (768px - 1024px)
- Test desktop view (> 1024px)

### Dark Theme
- Premium dark backgrounds
- Ice blue accents (#0ea5e9)
- Purple highlights (#a855f7)
- Graphite UI elements

### Interactive Elements
- Sidebar navigation
- User menu dropdown
- Mobile hamburger menu
- Form validations
- Star ratings

## 🛠️ Development Commands

### Start Development Server
```bash
npm run dev
```
- Hot reload enabled
- Opens at http://localhost:5173

### Build for Production
```bash
npm run build
```
- Creates optimized build in `dist/` folder
- Minifies code
- Removes unused CSS

### Preview Production Build
```bash
npm run preview
```
- Test production build locally
- Opens at http://localhost:4173

### Type Check
```bash
npx tsc --noEmit
```
- Check TypeScript errors
- No output files generated

## 📁 Project Structure Overview

```
parce-app/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Logo.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   ├── pages/           # Page components (routes)
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── ... (12 pages total)
│   ├── App.tsx          # Main app with routing
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles + Tailwind
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript config
└── vite.config.ts       # Vite config
```

## 🎨 Customization Quick Tips

### Change Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#YOUR_COLOR', // Change ice blue
  },
  purple: {
    500: '#YOUR_COLOR', // Change purple
  },
}
```

### Modify Logo

Edit `src/components/Logo.tsx`:
- Change icon (import from lucide-react)
- Adjust sizes
- Modify gradient colors

### Update Text Content

All text is in Spanish. To change:
- Open any page component
- Find text strings
- Replace with your content

### Add New Page

1. Create file in `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`:
```typescript
<Route path="/your-path" element={<YourPage />} />
```

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is busy:
```bash
# Kill process on port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9
```

### Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Check for errors
npx tsc --noEmit

# Most errors are type-related and won't prevent running
```

### Styles Not Applying

```bash
# Restart dev server
# Press Ctrl+C to stop
npm run dev
```

## 📚 Learn More

### Technologies Used

- **React**: [react.dev](https://react.dev)
- **TypeScript**: [typescriptlang.org](https://www.typescriptlang.org)
- **TailwindCSS**: [tailwindcss.com](https://tailwindcss.com)
- **Framer Motion**: [framer.com/motion](https://www.framer.com/motion)
- **Vite**: [vitejs.dev](https://vitejs.dev)

### Documentation

- `README.md` - Project overview
- `IMPLEMENTATION.md` - Detailed technical docs
- `QUICKSTART.md` - This file!

## 🎉 Next Steps

1. ✅ Install dependencies
2. ✅ Start dev server
3. ✅ Explore all pages
4. ✅ Test responsive design
5. ✅ Try animations
6. 📝 Customize for your needs
7. 🚀 Deploy to production

## 💡 Tips

- Use browser DevTools to inspect elements
- Check console for any errors
- Test on different screen sizes
- Try keyboard navigation
- Experiment with color changes

## 🤝 Need Help?

- Check `IMPLEMENTATION.md` for detailed docs
- Review component code for examples
- Look at TailwindCSS docs for styling
- Check React Router docs for navigation

---

**Happy Coding! 🚀**

Built with ❤️ using React, TypeScript, and TailwindCSS
