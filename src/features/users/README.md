# 📁 Módulo de Gestión de Usuarios

Este módulo contiene todo lo necesario para gestionar usuarios en la plataforma P.A.R.C.E.

## 📂 Estructura de Archivos

```
src/features/users/
├── index.ts                    # Exportaciones del módulo
├── types.ts                    # Definiciones de tipos TypeScript
├── UserManagementPage.tsx      # Página principal del CRUD
├── UserList.tsx                # Componente de lista de usuarios
├── UserForm.tsx                # Formulario para crear/editar
├── UserFilters.tsx             # Componente de filtros
└── README.md                   # Este archivo
```

## 🎯 Componentes

### **UserManagementPage**
Página principal que contiene todo el CRUD de usuarios.

**Características:**
- ✅ Crear nuevo usuario
- ✅ Editar usuario existente
- ✅ Eliminar usuario
- ✅ Búsqueda en tiempo real
- ✅ Filtros por rol y estado
- ✅ Estadísticas generales
- ✅ Modal para formulario

### **UserList**
Tabla con la lista de usuarios.

**Características:**
- ✅ Muestra ID, nombre, email, teléfono, rol, estado
- ✅ Acciones de editar y eliminar por fila
- ✅ Estados visuales con colores
- ✅ Hover effects
- ✅ Responsive

### **UserForm**
Formulario modal para crear/editar usuarios.

**Características:**
- ✅ Validación de campos
- ✅ Mensajes de error
- ✅ Modo crear y editar
- ✅ Animaciones con Framer Motion
- ✅ Click fuera para cerrar

### **UserFilters**
Componente de filtros avanzados.

**Características:**
- ✅ Búsqueda por texto (nombre/email)
- ✅ Filtro por rol
- ✅ Filtro por estado
- ✅ Actualización en tiempo real

## 📊 Tipos de Datos

### **User**
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  role: 'user' | 'mechanic' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}
```

### **UserFormData**
```typescript
interface UserFormData {
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  role: 'user' | 'mechanic' | 'admin';
}
```

## 🚀 Cómo Usar

### **1. Agregar la ruta en App.tsx:**

```typescript
import { UserManagementPage } from './features/users';

<Route
  path="/users"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <UserManagementPage />
    </ProtectedRoute>
  }
/>
```

### **2. Agregar al Sidebar (para admin):**

```typescript
const adminMenuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Database, label: 'CRUD', path: '/crud' },
  { icon: Users, label: 'Usuarios', path: '/users' }, // ← Nuevo
];
```

### **3. Importar el componente:**

```typescript
import { UserManagementPage } from './features/users';
```

## ✨ Funcionalidades

### **Crear Usuario:**
1. Click en "Nuevo Usuario"
2. Llenar formulario
3. Click en "Crear"

### **Editar Usuario:**
1. Click en ícono de editar
2. Modificar datos
3. Click en "Actualizar"

### **Eliminar Usuario:**
1. Click en ícono de eliminar
2. Confirmar en el diálogo
3. Usuario eliminado

### **Filtrar Usuarios:**
1. Escribir en el campo de búsqueda
2. Seleccionar filtro de rol
3. Seleccionar filtro de estado

## 📈 Estadísticas

El módulo muestra 6 estadísticas:
- **Total**: Cantidad total de usuarios
- **Activos**: Usuarios con status='active'
- **Inactivos**: Usuarios con status='inactive'
- **Usuarios**: Usuarios con role='user'
- **Mecánicos**: Usuarios con role='mechanic'
- **Admins**: Usuarios con role='admin'

## 🎨 Estilos

Utiliza el sistema de colores de Tailwind configurado:
- **Dorado (Gold)**: Acentos y botones primarios
- **Antracita**: Fondos y cards
- **Verde**: Estados activos
- **Rojo**: Estados inactivos / eliminar
- **Azul**: Rol usuario
- **Púrpura**: Rol mecánico/admin

## 🔐 Seguridad

- ✅ Solo accesible por rol 'admin'
- ✅ Protegido con ProtectedRoute
- ✅ Validación de formularios
- ✅ Confirmación antes de eliminar

## 🔄 Integración con API (Futuro)

Actualmente usa datos mock. Para integrar con API:

```typescript
// En UserManagementPage.tsx, reemplazar:
const [users, setUsers] = useState<User[]>([...])

// Por:
const [users, setUsers] = useState<User[]>([]);

useEffect(() => {
  fetchUsers().then(setUsers);
}, []);

const handleSaveUser = async (data: UserFormData) => {
  if (editingUser) {
    await updateUser(editingUser.id, data);
  } else {
    await createUser(data);
  }
  fetchUsers().then(setUsers);
};
```

## 📝 Notas

- Los datos actuales son **mock** (simulados)
- Se recomienda agregar paginación para +100 usuarios
- Se puede agregar exportación a CSV/Excel
- Se puede agregar importación masiva
- Se puede agregar log de cambios

---

**Desarrollado para P.A.R.C.E**  
**Fecha**: Mayo 2026
