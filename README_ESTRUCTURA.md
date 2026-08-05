# 📚 PARCE - Plataforma de Asistencia Remota para Cuidado Especializado

## ✅ Proyecto Completado - Estructura MVC

### 📁 Archivos de Documentación

Solo quedan **2 archivos** de documentación:

1. **`SERVIDOR.md`** ⭐ - **LEE ESTO PRIMERO**
   - Cómo iniciar los 2 servidores (PHP + React)
   - Cómo arreglar problemas si se caen
   - Credenciales de prueba
   - Troubleshooting completo

2. **`ESTRUCTURA_MVC.md`** 🏗️
   - Arquitectura del proyecto
   - Organización de carpetas
   - Cómo agregar nueva funcionalidad
   - Flujo MVC explicado

---

## 🎯 Estado Actual

✅ **Sistema Completo Funcional:**

- ✅ Backend PHP en puerto 8000 (Laravel-like)
- ✅ Frontend React en puerto 5173 (Vite)
- ✅ Base de datos MySQL con 11 tablas
- ✅ Autenticación con roles (admin, mechanic, customer)
- ✅ Panel de admin con gestión de usuarios y vehículos
- ✅ Estructura MVC limpia y organizada
- ✅ API endpoints documentados
- ✅ Middleware de seguridad (CORS, RBAC, Rate Limit)

---

## 🚀 Iniciar Rápido

```powershell
# Terminal 1: Backend
cd c:\Users\juans\PARCE
php -S localhost:8000

# Terminal 2: Frontend (otra ventana)
cd c:\Users\juans\PARCE
npm run dev

# Abrir navegador
http://localhost:5173
```

**Login:** `admin.demo@parcedemo.local` / `Demo12345`

---

## 📊 Estructura Actual (MVC)

### Backend (PHP)
```
app/
├── Controllers/          → Maneja HTTP requests
├── Infrastructure/       → Servicios, validadores, DTOs
├── Middleware/          → Autenticación, CORS, Rate Limit
└── Core/                → Framework base (Router, DB, Request, Response)

config/
└── routes.php           → Definición de todas las rutas API

database/
├── migrations/          → Schema (CREATE TABLE, etc)
└── seeds/               → Datos iniciales (usuarios, roles)

public/
└── index.php            → Entry point
```

### Frontend (React)
```
src/
├── config/              → Configuración (API endpoints)
├── services/            → API calls (authService, adminService)
├── controllers/         → Contexto global (AuthContext)
├── views/
│   ├── pages/          → Páginas principales
│   └── components/     → Componentes reutilizables
└── main.tsx            → Entry point
```

---

## 🔑 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### Admin
- `GET /api/admin/users` - Listar usuarios con filtros
- `GET /api/admin/vehicles` - Listar vehículos
- `PUT /api/admin/users/{id}/status` - Cambiar estado de usuario
- `GET /api/admin/dashboard` - Resumen del dashboard

### Usuarios
- `GET /api/vehicles` - Mis vehículos
- `POST /api/vehicles` - Crear vehículo
- `GET /api/service-requests` - Mis solicitudes de servicio

### Mecánicos
- `GET /api/mechanic/requests` - Solicitudes disponibles
- `POST /api/mechanic/requests/{id}/accept` - Aceptar solicitud
- `GET /api/mechanic/stats` - Mis estadísticas

---

## 🧪 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| 👨‍💼 Admin | `admin.demo@parcedemo.local` | `Demo12345` |
| 🔧 Mecánico | `mecanico.demo@parcedemo.local` | `Demo12345` |
| 👤 Cliente | `cliente.demo@parcedemo.local` | `Demo12345` |

---

## 🛠️ Próximos Pasos (Desarrollo)

Para agregar nueva funcionalidad, seguir este patrón:

1. **Backend:**
   - Crear método en `app/Infrastructure/{Feature}/` (service)
   - Crear método en `app/Controllers/{Feature}Controller.php` (controller)
   - Registrar ruta en `config/routes.php`

2. **Frontend:**
   - Crear función en `src/services/{feature}Service.ts` (API call)
   - Usar en `src/views/pages/{feature}Page.tsx` (component)

Ver `ESTRUCTURA_MVC.md` para ejemplo detallado.

---

## 📞 Soporte

Si algo no funciona:

1. Lee `SERVIDOR.md` - tiene troubleshooting completo
2. Verifica que ambos servidores están corriendo
3. Revisa DevTools (F12) en navegador
4. Revisa consola de PHP en terminal

---

## 🎓 Tecnologías Usadas

**Backend:**
- PHP 8.0+
- MySQL 5.7+
- Custom Framework (MVC)
- Middleware personalizado

**Frontend:**
- React 18+
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons
- Framer Motion

---

**Rama:** `frontend+backend`  
**Última actualización:** 2026-08-05  
**Estado:** ✅ Producción lista
