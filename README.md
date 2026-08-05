# P.A.R.C.E

**P**lataforma de **A**sistencia **R**ápida para **C**onductores en **E**mergencia — plataforma de asistencia vial que conecta clientes con mecánicos cercanos en tiempo real.

## 🚀 Stack Tecnológico

- **Backend**: PHP 8.2, MVC propio (sin framework), MySQL/MariaDB, sesiones por cookie httpOnly
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Roles**: Cliente, Mecánico, Administrador, Super-Administrador (RBAC)
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React
- **Gráficos**: Recharts

## 📋 Requisitos Previos

- PHP >= 8.2 con extensión PDO MySQL habilitada
- MySQL/MariaDB (XAMPP funciona bien en desarrollo)
- [Composer](https://getcomposer.org/)
- Node.js 18+ y npm

## 🔧 Instalación Rápida

### 1. Backend (PHP)

```bash
# Clonar e instalar dependencias
git clone <url-del-repo>
cd PARCE
composer install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos
```

### 2. Base de Datos

```sql
CREATE DATABASE parce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
# Ejecutar migraciones
php migrate_run.php migrate

# Poblar datos de prueba
php database/seed.php
```

### 3. Frontend (React)

```bash
# Instalar dependencias
npm install

# Configurar variables (opcional)
cp .env.example .env
# Agregar VITE_GROQ_API_KEY si usas Groq
```

## ▶️ Ejecutar el Proyecto

### Opción A: Servidores Separados (Recomendado)

```bash
# Terminal 1 - Backend PHP
php -S localhost:8000 -t public public/router.php

# Terminal 2 - Frontend Vite
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api

### Opción B: Script Unificado

Ver `INICIAR_SERVIDORES.md` para instrucciones de ejecución con un solo comando.

## 🔐 Cuentas de Prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| `superadmin@parce.local` | `SuperAdmin123!` | Super Administrador |
| `admin@parce.local` | `Admin123!` | Administrador |
| `customer@parce.local` | `Customer123!` | Cliente |
| `mechanic@parce.local` | `Mechanic123!` | Mecánico |

## ✅ Verificar Instalación

```bash
# Probar backend
curl http://localhost:8000/api/health
# {"success":true,"data":{"status":"healthy",...}}

# Frontend: Abrir http://localhost:5173 en el navegador
```

## 📁 Estructura del Proyecto

```
PARCE/
├── app/                      # Backend PHP
│   ├── Controllers/          # Controladores HTTP
│   ├── Core/                 # Framework propio
│   ├── Infrastructure/       # Servicios (Auth, Vehicle, etc.)
│   └── Middleware/           # RBAC, CORS, RateLimiter
├── database/
│   ├── migrations/           # Migraciones de BD
│   └── seeders/              # Datos de prueba
├── public/                   # Punto de entrada PHP
├── src/                      # Frontend React
│   ├── views/
│   │   ├── components/       # Componentes reutilizables
│   │   └── pages/            # Páginas de la aplicación
│   ├── controllers/          # Contextos React
│   ├── services/             # API clients
│   └── models/               # Tipos TypeScript
├── config/routes.php         # Definición de rutas API
├── .env.example              # Variables de entorno
├── package.json              # Dependencias frontend
├── composer.json             # Dependencias backend
└── vite.config.ts            # Configuración Vite
```

## 🎨 Sistema de Diseño

### Paleta de Colores

- **Primary (Oro)**: `#FF8C00` - Color principal de marca
- **Secondary (Antracita)**: `#2C3E50` - Color secundario
- **Dark**: `#050505` a `#1e293b` - Fondos degradados
- **Graphite**: `#1f2937` a `#111827` - Elementos UI

### Características UI

- **Buttons**: Variantes Primary, Secondary, Outline
- **Cards**: Efecto glass-morphism con backdrop blur
- **Inputs**: Tema oscuro con estados focus
- **Sidebar**: Navegación colapsable con iconos
- **Navbar**: Header fijo con menú de usuario
- **Animaciones**: Transiciones suaves con Framer Motion

## 🛠️ Comandos Útiles

### Backend

```bash
# Ver estado de migraciones
php migrate_run.php status

# Rollback de migraciones
php scripts/maintenance/migrate.php rollback [pasos]

# Reset completo de base de datos
php scripts/maintenance/migrate.php reset

# Limpieza de logs antiguos
php scripts/maintenance/cleanup_logs.php [dias]

# Tests
composer test
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview de build
npm run preview

# Linter
npm run lint
```

## 📚 Documentación Adicional

- `INICIAR_SERVIDORES.md` - Guía para levantar el proyecto
- `CREDENCIALES.md` - Cuentas de prueba y accesos
- `DONDE_VER_DATOS.md` - Ubicación de datos en la aplicación
- `DEPLOYMENT.md` - Guía de despliegue a producción
- `BACKLOG.md` - Tareas pendientes y decisiones
- `docs/` - Documentación técnica detallada

## 🔒 Seguridad

- **Argon2id**: Hash de contraseñas (resistente a GPU)
- **RBAC**: Control de acceso basado en roles
- **CORS**: Configurado para localhost en desarrollo
- **Sessions**: Almacenadas en base de datos con HttpOnly cookies
- **SQL Injection**: Prevención con prepared statements
- **XSS**: Sanitización de entradas y salidas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte de un trabajo académico.

## 👥 Equipo

- **Frontend**: Juan, Soto
- **Backend**: Angel, Duvan, Sebastian

---

**P.A.R.C.E** - Asistencia rápida cuando más la necesitas 🚗⚡
