# Estructura MVC del Proyecto P.A.R.C.E

Este documento describe la organización del código siguiendo el patrón **Model-View-Controller (MVC)**.

## 📁 Estructura de Carpetas

```
src/
├── models/              # MODELO - Tipos, interfaces, schemas
│   └── (vacío - preparado para tipos TypeScript)
│
├── views/               # VISTA - Componentes UI y páginas
│   ├── components/      # Componentes reutilizables
│   │   ├── Logo.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   └── pages/          # Páginas completas de la aplicación
│       ├── ContactPage.tsx
│       ├── DashboardPage.tsx
│       ├── LandingPage.tsx
│       ├── LoginPage.tsx
│       ├── MechanicOrdersPage.tsx
│       ├── MechanicProfilePage.tsx
│       ├── MechanicVehicleInfoPage.tsx
│       ├── PaymentPage.tsx
│       ├── ProfilePage.tsx
│       ├── RegisterPage.tsx
│       ├── RoleSelectionPage.tsx
│       ├── SatisfactionSurveyPage.tsx
│       ├── ServiceInProgressPage.tsx
│       └── ServicesPage.tsx
│
├── controllers/         # CONTROLADOR - Lógica de negocio
│   └── (preparado para contextos, hooks personalizados, servicios)
│
├── App.tsx             # Configuración de rutas principales
├── main.tsx            # Punto de entrada de la aplicación
└── index.css           # Estilos globales
```

---

## 🎯 Descripción de cada capa MVC

### 📊 **MODEL (models/)**
**Responsabilidad:** Definir la estructura de datos de la aplicación

**Contendrá:**
- Interfaces TypeScript (User, Service, Order, etc.)
- Tipos personalizados
- Schemas de validación
- Constantes de datos

**Ejemplo futuro:**
```typescript
// models/User.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'mechanic' | 'admin';
}
```

---

### 👁️ **VIEW (views/)**
**Responsabilidad:** Presentación visual y experiencia de usuario

#### **views/components/**
Componentes reutilizables sin lógica de negocio compleja:
- `Logo.tsx` - Logo animado de la aplicación
- `Navbar.tsx` - Barra de navegación superior
- `Sidebar.tsx` - Menú lateral de navegación

#### **views/pages/**
Páginas completas que componen las rutas de la aplicación:
- **Públicas:** LandingPage, LoginPage, RegisterPage
- **Usuario:** ServicesPage, ProfilePage, PaymentPage, etc.
- **Mecánico:** MechanicProfilePage, MechanicOrdersPage, MechanicVehicleInfoPage
- **Admin:** DashboardPage

---

### 🎮 **CONTROLLER (controllers/)**
**Responsabilidad:** Lógica de negocio y gestión del estado

**Contendrá:**
- Contextos de React (AuthContext, ServiceContext, etc.)
- Hooks personalizados (useAuth, useService, etc.)
- Servicios API (llamadas HTTP)
- Lógica de validación
- Gestión del estado global

**Ejemplo futuro:**
```typescript
// controllers/AuthContext.tsx
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lógica de autenticación
}

export function useAuth() {
  return useContext(AuthContext);
}
```

---

## 🔄 Flujo de datos MVC en React

```
┌─────────────┐
│   MODEL     │ ← Define estructura de datos (interfaces/tipos)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ CONTROLLER  │ ← Gestiona lógica de negocio (contextos/hooks)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│    VIEW     │ ← Renderiza UI (componentes/páginas)
└─────────────┘
```

---

## 📝 Convenciones de nomenclatura

### Archivos y componentes
- **Componentes:** PascalCase - `Navbar.tsx`, `Logo.tsx`
- **Páginas:** PascalCase + sufijo "Page" - `LoginPage.tsx`, `ProfilePage.tsx`
- **Modelos:** PascalCase - `User.ts`, `Service.ts`
- **Contextos:** PascalCase + sufijo "Context" - `AuthContext.tsx`
- **Hooks:** camelCase + prefijo "use" - `useAuth.ts`, `useService.ts`

### Rutas de import
- Imports de **componentes** desde páginas: `import Navbar from '../components/Navbar'`
- Imports de **páginas** desde App.tsx: `import LoginPage from './views/pages/LoginPage'`
- Imports de **modelos**: `import { User } from './models/User'`
- Imports de **controllers**: `import { useAuth } from './controllers/AuthContext'`

---

## ✅ Ventajas de esta estructura MVC

1. **Separación de responsabilidades**
   - Cada capa tiene un propósito claro
   - Fácil de mantener y escalar

2. **Reusabilidad**
   - Componentes pueden usarse en múltiples páginas
   - Lógica de negocio centralizada en controllers

3. **Testabilidad**
   - Cada capa puede testearse independientemente
   - Mocks más fáciles de crear

4. **Escalabilidad**
   - Estructura preparada para crecimiento del proyecto
   - Fácil agregar nuevas features

5. **Onboarding**
   - Nuevos desarrolladores encuentran código fácilmente
   - Convenciones claras y predecibles

---

## 🚀 Próximos pasos recomendados

### Para completar la arquitectura MVC:

1. **Crear modelos de datos:**
   ```typescript
   // src/models/User.ts
   // src/models/Service.ts
   // src/models/Order.ts
   ```

2. **Mover lógica a controllers:**
   ```typescript
   // src/controllers/AuthContext.tsx
   // src/controllers/ServiceContext.tsx
   // src/controllers/hooks/useAuth.ts
   ```

3. **Extraer tipos/interfaces de las páginas:**
   - Mover interfaces de componentes a `models/`
   - Centralizar tipos compartidos

4. **Crear servicios API:**
   ```typescript
   // src/controllers/services/api.ts
   // src/controllers/services/authService.ts
   ```

---

## 📖 Referencias

- [React Official Docs](https://react.dev/)
- [MVC Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)
- [React Architecture Best Practices](https://www.robinwieruch.de/react-folder-structure/)

---

**Fecha de reorganización:** 2 de junio de 2026  
**Rama:** sebastian  
**Estado:** ✅ Estructura MVC implementada - Solo se movieron archivos, sin cambios en código
