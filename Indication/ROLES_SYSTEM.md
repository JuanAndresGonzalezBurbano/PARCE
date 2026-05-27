# Sistema de Roles - P.A.R.C.E

## Descripción General

El sistema de roles permite que diferentes tipos de usuarios tengan acceso a diferentes funcionalidades de la plataforma.

## Roles Disponibles

### 1. Usuario (user)
**Descripción:** Clientes que solicitan servicios de asistencia vehicular

**Acceso:**
- ✅ Página de Servicios (`/services`)
- ✅ Página de Contacto (`/contact`)
- ✅ Perfil de Usuario (`/profile`)
- ✅ Servicio en Progreso (`/service-in-progress`)
- ✅ Pago (`/payment`)
- ✅ Encuesta de Satisfacción (`/survey`)
- ❌ Dashboard de Administrador
- ❌ Dashboard de Mecánico

**Menú del Sidebar:**
- Servicios
- Contacto

### 2. Mecánico (mechanic)
**Descripción:** Profesionales que ofrecen servicios de reparación y asistencia

**Acceso:**
- ✅ Dashboard de Mecánico (`/mechanic-dashboard`)
- ✅ Perfil de Mecánico (`/mechanic-profile`)
- ✅ Página de Contacto (`/contact`)
- ✅ Servicio en Progreso (`/service-in-progress`)
- ❌ Dashboard de Administrador
- ❌ Página de Servicios (solicitar servicios)

**Menú del Sidebar:**
- Inicio (Dashboard de Mecánico)
- Solicitudes
- Mi Perfil
- Contacto

**Funcionalidades Especiales:**
- Ver solicitudes de servicio pendientes
- Aceptar solicitudes de servicio
- Rechazar solicitudes de servicio
- Ver servicios aceptados en progreso
- Ver estadísticas personales (calificación, servicios completados)

### 3. Administrador (admin)
**Descripción:** Gestores de la plataforma con acceso completo

**Acceso:**
- ✅ Dashboard de Administrador (`/dashboard`)
- ✅ Página de Servicios (`/services`)
- ✅ Página de Contacto (`/contact`)
- ✅ Perfil (`/profile`)
- ✅ Todas las demás páginas
- ✅ Acceso completo a la plataforma

**Menú del Sidebar:**
- Dashboard
- Servicios
- Contacto
- Perfil

**Funcionalidades Especiales:**
- Ver estadísticas generales de la plataforma
- Historial de servicios por mes
- Comparaciones anuales
- Métricas de usuarios y mecánicos
- Calificaciones promedio

## Flujo de Autenticación

1. **Login** (`/login`)
   - Usuario ingresa credenciales
   - Sistema autentica al usuario

2. **Selección de Rol** (`/role-selection`)
   - Usuario selecciona su rol (Usuario, Mecánico, o Administrador)
   - Sistema guarda el rol seleccionado

3. **Redirección Automática**
   - **Usuario** → `/services`
   - **Mecánico** → `/mechanic-dashboard`
   - **Administrador** → `/dashboard`

## Protección de Rutas

Todas las rutas están protegidas mediante el componente `ProtectedRoute`:

- Si el usuario no está autenticado → Redirige a `/login`
- Si el usuario no tiene permisos para una ruta → Redirige a su página principal según su rol

## Componentes Principales

### AuthContext
Maneja el estado de autenticación global:
- `user`: Información del usuario actual
- `login()`: Función para iniciar sesión
- `logout()`: Función para cerrar sesión
- `selectRole()`: Función para seleccionar el rol
- `isAuthenticated`: Estado de autenticación

### ProtectedRoute
Componente que protege rutas según roles:
```tsx
<ProtectedRoute allowedRoles={['admin']}>
  <DashboardPage />
</ProtectedRoute>
```

### Sidebar
Muestra menú dinámico según el rol del usuario

### Navbar
Muestra opciones de navegación según el rol del usuario

## Páginas Nuevas

### MechanicDashboardPage
Dashboard exclusivo para mecánicos con:
- Lista de solicitudes pendientes
- Botones para aceptar/rechazar servicios
- Estadísticas personales
- Servicios en progreso

## Uso en Desarrollo

Para probar diferentes roles:

1. Ir a `/login`
2. Ingresar cualquier email/contraseña
3. En `/role-selection`, seleccionar el rol deseado
4. El sistema redirigirá a la página correspondiente

## Notas Técnicas

- El sistema usa React Context API para manejar el estado global
- Las rutas están protegidas con React Router
- El rol se mantiene en memoria (se pierde al recargar la página)
- En producción, el rol debería guardarse en localStorage o en un token JWT
