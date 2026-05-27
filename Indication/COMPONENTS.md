# 🧩 Component Library - P.A.R.C.E

Complete reference for all reusable components in the P.A.R.C.E application.

## 📦 Core Components

### Logo Component

**Location**: `src/components/Logo.tsx`

**Purpose**: Displays the P.A.R.C.E brand logo with icon and text.

**Props**:
```typescript
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';  // Default: 'md'
  showText?: boolean;          // Default: true
}
```

**Usage**:
```tsx
import Logo from '@/components/Logo';

// Small logo with text
<Logo size="sm" />

// Large logo without text
<Logo size="lg" showText={false} />

// Default (medium with text)
<Logo />
```

**Sizes**:
- `sm`: 32px icon, text-xl
- `md`: 48px icon, text-2xl
- `lg`: 64px icon, text-4xl

**Features**:
- Animated entrance (fade + scale)
- Gradient background (primary to purple)
- Wrench icon from Lucide
- Text gradient effect

---

### Navbar Component

**Location**: `src/components/Navbar.tsx`

**Purpose**: Top navigation bar with authentication states.

**Props**:
```typescript
interface NavbarProps {
  isAuthenticated?: boolean;  // Default: false
  userName?: string;
  userAvatar?: string;
}
```

**Usage**:
```tsx
import Navbar from '@/components/Navbar';

// Public navbar
<Navbar />

// Authenticated navbar
<Navbar 
  isAuthenticated 
  userName="Juan Gustavo" 
  userAvatar="/avatar.jpg"
/>
```

**Features**:
- Fixed position at top
- Backdrop blur effect
- Responsive mobile menu
- User dropdown menu
- Logout functionality
- Active link highlighting

**States**:
1. **Public**: Shows Login/Register buttons
2. **Authenticated**: Shows user menu and navigation links

---

### Sidebar Component

**Location**: `src/components/Sidebar.tsx`

**Purpose**: Left sidebar navigation for authenticated pages.

**Props**:
```typescript
interface SidebarProps {
  isOpen?: boolean;  // Default: true
}
```

**Usage**:
```tsx
import Sidebar from '@/components/Sidebar';

// Default (open)
<Sidebar />

// Collapsed
<Sidebar isOpen={false} />
```

**Features**:
- Fixed left position
- Active route highlighting
- Icon + text layout
- Smooth animations
- Backdrop blur

**Menu Items**:
- Inicio (Home)
- Servicio (Services)
- Contacto (Contact)

---

## 🎨 Utility Classes

### Button Variants

**Primary Button**:
```tsx
<button className="btn-primary">
  Click Me
</button>
```
- Gradient: primary-600 to primary-500
- Glow effect on hover
- Scale animation
- Focus ring

**Secondary Button**:
```tsx
<button className="btn-secondary">
  Click Me
</button>
```
- Gradient: purple-600 to purple-500
- Purple glow on hover
- Scale animation
- Focus ring

**Outline Button**:
```tsx
<button className="btn-outline">
  Click Me
</button>
```
- Border: primary-500
- Transparent background
- Fills on hover
- Focus ring

### Card Component

**Usage**:
```tsx
<div className="card p-6">
  <h3>Card Title</h3>
  <p>Card content...</p>
</div>
```

**Features**:
- Dark background with transparency
- Backdrop blur
- Border: graphite-800
- Shadow on hover
- Rounded corners

### Input Field

**Usage**:
```tsx
<input 
  type="text" 
  className="input-field" 
  placeholder="Enter text..."
/>
```

**Features**:
- Dark background
- Border: graphite-700
- Focus ring: primary-500
- Placeholder styling
- Full width

### Sidebar Link

**Active Link**:
```tsx
<div className="sidebar-link-active">
  <Icon className="w-5 h-5" />
  <span>Link Text</span>
</div>
```

**Inactive Link**:
```tsx
<div className="sidebar-link">
  <Icon className="w-5 h-5" />
  <span>Link Text</span>
</div>
```

---

## 🎭 Animation Patterns

### Page Entrance

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Page content */}
</motion.div>
```

### Staggered List

```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    {/* Item content */}
  </motion.div>
))}
```

### Button Interaction

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click Me
</motion.button>
```

### Modal Animation

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
>
  {/* Modal content */}
</motion.div>
```

---

## 🎨 Color System

### Primary Colors (Ice Blue)

```tsx
// Background
className="bg-primary-500"

// Text
className="text-primary-400"

// Border
className="border-primary-500"

// Gradient
className="bg-gradient-to-r from-primary-600 to-primary-500"
```

### Purple Colors

```tsx
// Background
className="bg-purple-500"

// Text
className="text-purple-400"

// Gradient
className="bg-gradient-to-r from-purple-600 to-purple-500"
```

### Dark Colors

```tsx
// Backgrounds
className="bg-dark-950"  // Darkest
className="bg-dark-900"  // Dark
className="bg-dark-800"  // Medium dark

// Text
className="text-gray-100"  // Lightest
className="text-gray-300"  // Light
className="text-gray-400"  // Medium
className="text-gray-500"  // Dim
```

### Graphite Colors

```tsx
// Borders
className="border-graphite-800"
className="border-graphite-700"

// Backgrounds
className="bg-graphite-900"
```

---

## 📐 Layout Patterns

### Centered Container

```tsx
<div className="max-w-7xl mx-auto px-4">
  {/* Content */}
</div>
```

### Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

### Two Column Layout

```tsx
<div className="grid lg:grid-cols-2 gap-6">
  <div>{/* Left column */}</div>
  <div>{/* Right column */}</div>
</div>
```

### Sidebar Layout

```tsx
<div className="ml-64 pt-16 p-8">
  {/* Main content with sidebar offset */}
</div>
```

---

## 🔤 Typography

### Headings

```tsx
// Page Title
<h1 className="text-3xl font-bold text-white">Title</h1>

// Section Title
<h2 className="text-2xl font-bold text-white">Section</h2>

// Card Title
<h3 className="text-xl font-bold text-white">Card Title</h3>
```

### Body Text

```tsx
// Primary text
<p className="text-gray-300">Regular text</p>

// Secondary text
<p className="text-gray-400">Secondary text</p>

// Muted text
<p className="text-gray-500">Muted text</p>
```

### Gradient Text

```tsx
<span className="text-gradient">
  Gradient Text
</span>
```

---

## 🎯 Icon Usage

### Lucide React Icons

```tsx
import { 
  Home, 
  User, 
  Settings, 
  Mail, 
  Phone 
} from 'lucide-react';

// Standard size
<Home className="w-5 h-5 text-primary-500" />

// Large size
<User className="w-8 h-8 text-white" />

// With background
<div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
  <Settings className="w-6 h-6 text-white" />
</div>
```

---

## 📊 Chart Components

### Bar Chart

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={250}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
    <XAxis dataKey="month" stroke="#9ca3af" />
    <YAxis stroke="#9ca3af" />
    <Tooltip
      contentStyle={{
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '8px',
      }}
    />
    <Bar dataKey="services" fill="url(#colorGradient)" />
    <defs>
      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
  </BarChart>
</ResponsiveContainer>
```

### Line Chart

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={250}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
    <XAxis dataKey="year" stroke="#9ca3af" />
    <YAxis stroke="#9ca3af" />
    <Tooltip
      contentStyle={{
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '8px',
      }}
    />
    <Line
      type="monotone"
      dataKey="value"
      stroke="#0ea5e9"
      strokeWidth={3}
      dot={{ fill: '#0ea5e9', r: 6 }}
    />
  </LineChart>
</ResponsiveContainer>
```

---

## 🎨 Special Effects

### Glass Morphism

```tsx
<div className="bg-glass">
  {/* Content with glass effect */}
</div>
```

### Glow Effect

```tsx
// Blue glow
<div className="shadow-glow-blue">
  {/* Content */}
</div>

// Purple glow
<div className="shadow-glow-purple">
  {/* Content */}
</div>
```

### Gradient Background

```tsx
// Dark gradient
<div className="bg-gradient-dark">
  {/* Content */}
</div>

// Purple gradient
<div className="bg-gradient-purple">
  {/* Content */}
</div>
```

### Animated Background

```tsx
<div className="relative overflow-hidden">
  <div className="absolute inset-0">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
  </div>
  {/* Content */}
</div>
```

---

## 🔧 Form Components

### Text Input with Icon

```tsx
<div className="relative">
  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
  <input
    type="email"
    placeholder="email@example.com"
    className="input-field pl-10"
  />
</div>
```

### Password Input with Toggle

```tsx
const [showPassword, setShowPassword] = useState(false);

<div className="relative">
  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
  <input
    type={showPassword ? 'text' : 'password'}
    className="input-field pl-10 pr-10"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2"
  >
    {showPassword ? <EyeOff /> : <Eye />}
  </button>
</div>
```

### Star Rating

```tsx
const [rating, setRating] = useState(0);

<div className="flex gap-2">
  {[1, 2, 3, 4, 5].map((star) => (
    <button
      key={star}
      onClick={() => setRating(star)}
      className="transition-transform hover:scale-110"
    >
      <Star
        className={`w-8 h-8 ${
          star <= rating
            ? 'text-yellow-500 fill-yellow-500'
            : 'text-gray-600'
        }`}
      />
    </button>
  ))}
</div>
```

---

## 📱 Responsive Utilities

### Hide on Mobile

```tsx
<div className="hidden md:block">
  {/* Visible on tablet and desktop only */}
</div>
```

### Show on Mobile Only

```tsx
<div className="block md:hidden">
  {/* Visible on mobile only */}
</div>
```

### Responsive Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 1 column mobile, 2 tablet, 3 desktop */}
</div>
```

### Responsive Text

```tsx
<h1 className="text-3xl md:text-5xl lg:text-7xl">
  Responsive Heading
</h1>
```

---

## 🎯 Best Practices

### Component Structure

```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from 'lucide-react';

interface ComponentProps {
  // Props definition
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  // State
  const [state, setState] = useState();

  // Handlers
  const handleAction = () => {
    // Logic
  };

  // Render
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* JSX */}
    </motion.div>
  );
}
```

### Naming Conventions

- **Components**: PascalCase (`DashboardPage`)
- **Props**: camelCase (`userName`)
- **Handlers**: camelCase with `handle` prefix (`handleSubmit`)
- **State**: camelCase (`isOpen`, `formData`)

### File Organization

```
src/
├── components/
│   ├── Logo.tsx
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── pages/
│   ├── LandingPage.tsx
│   └── DashboardPage.tsx
└── App.tsx
```

---

**Component Library Version**: 1.0.0  
**Last Updated**: May 22, 2026
