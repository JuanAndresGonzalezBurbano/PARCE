# Estructura Dashboard + CRUD

## Resumen

El sistema ahora tiene **dos páginas separadas** para el administrador:

1. **Dashboard** - Estadísticas y métricas de la plataforma
2. **CRUD** - Gestión de usuarios, mecánicos y servicios

## 📊 Dashboard (`/dashboard`)

### Descripción
Panel principal con estadísticas y métricas visuales de la plataforma.

### Contenido
- **Estadísticas Generales**:
  - Servicios del último mes (125)
  - Recomendación de usuarios (98%)
  - Mecánicos activos (423)
  - Calificación promedio (4.8 ⭐)

- **Gráficos**:
  - Historial mensual de servicios (gráfico de barras)
  - Calendario interactivo
  - Comparaciones anuales (gráfico de líneas)

### Características
- Vista de solo lectura
- Visualización de datos con gráficos
- Métricas en tiempo real
- Diseño con Recharts para gráficos

## 🔧 CRUD (`/crud`)

### Descripción
Página dedicada a la gestión completa de datos (Crear, Leer, Actualizar, Eliminar).

### Contenido
- **3 Secciones con pestañas**:
  1. Usuarios
  2. Mecánicos
  3. Servicios

### Funcionalidades

#### ✏️ Crear
- Botón "Crear Nuevo" abre modal
- Formularios dinámicos según la sección
- Validación de campos

#### 👁️ Ver/Leer
- Tabla con todos los registros
- Columnas adaptadas por sección
- Indicadores visuales de estado

#### ✏️ Editar
- Botón de editar por fila
- Modal con formulario prellenado
- Actualización en tiempo real

#### 🗑️ Eliminar
- Botón de eliminar por fila
- Confirmación antes de eliminar
- Eliminación instantánea

#### 🔍 Buscar
- Buscador en tiempo real
- Filtra por cualquier campo
- Resultados instantáneos

### Estadísticas CRUD
- Total de usuarios
- Total de mecánicos
- Total de servicios
- Contadores de activos/inactivos

## 🎯 Navegación del Administrador

### Sidebar
El administrador ve dos opciones:
- **Dashboard** - Estadísticas y métricas
- **CRUD** - Gestión de datos

### Navbar
Enlaces rápidos a:
- Dashboard
- CRUD
- Cerrar Sesión

## 📁 Archivos

### Páginas
- `src/pages/DashboardPage.tsx` - Dashboard con estadísticas
- `src/pages/CRUDPage.tsx` - Gestión CRUD completa

### Componentes
- `src/components/Sidebar.tsx` - Menú lateral con opciones de admin
- `src/components/Navbar.tsx` - Barra superior con navegación

### Rutas
- `src/App.tsx` - Configuración de rutas protegidas

## 🔐 Seguridad

Ambas páginas están protegidas:
- Solo accesibles para rol "admin"
- Rutas protegidas con `ProtectedRoute`
- Redirección automática si no autorizado

## 🎨 Diseño

Ambas páginas mantienen:
- Tema anthracite/gold consistente
- Animaciones con Framer Motion
- Diseño responsive
- Iconos de Lucide React

## 🚀 Flujo de Uso

### Para ver estadísticas:
1. Login como administrador
2. Seleccionar rol "Administrador"
3. Ir a **Dashboard**
4. Ver métricas y gráficos

### Para gestionar datos:
1. Login como administrador
2. Seleccionar rol "Administrador"
3. Ir a **CRUD**
4. Seleccionar pestaña (Usuarios/Mecánicos/Servicios)
5. Realizar operaciones CRUD

## 📊 Comparación

| Característica | Dashboard | CRUD |
|----------------|-----------|------|
| **Propósito** | Visualización | Gestión |
| **Operaciones** | Solo lectura | Crear, Editar, Eliminar |
| **Contenido** | Gráficos y métricas | Tablas y formularios |
| **Interacción** | Pasiva | Activa |
| **Datos** | Agregados | Individuales |

## 💡 Ventajas de la Separación

1. **Claridad**: Cada página tiene un propósito específico
2. **Organización**: Fácil encontrar lo que necesitas
3. **Rendimiento**: Carga solo lo necesario
4. **Mantenibilidad**: Código más limpio y separado
5. **Escalabilidad**: Fácil agregar más funcionalidades

## 🔄 Próximas Mejoras

### Dashboard
- Gráficos en tiempo real
- Filtros por fecha
- Exportar reportes
- Más métricas personalizadas

### CRUD
- Paginación de tablas
- Filtros avanzados
- Importar/Exportar datos
- Historial de cambios
- Validación de formularios mejorada
