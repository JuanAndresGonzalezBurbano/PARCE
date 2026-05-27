# Panel de Administración con CRUD

## Descripción

El administrador ahora tiene acceso exclusivo a un Dashboard con funcionalidad CRUD completa para gestionar la plataforma.

## Acceso del Administrador

### ✅ Puede Acceder:
- **Dashboard** (`/dashboard`) - Panel de administración con CRUD

### ❌ NO Puede Acceder:
- Servicios
- Contacto
- Perfil de usuario
- Otras páginas de la plataforma

El administrador **SOLO** tiene acceso al Dashboard.

## Funcionalidades CRUD

El Dashboard permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre:

### 1. **Usuarios**
Gestión de clientes de la plataforma:
- ✏️ **Crear** nuevo usuario
- 👁️ **Ver** lista de usuarios
- ✏️ **Editar** información del usuario (nombre, email, teléfono, estado)
- 🗑️ **Eliminar** usuario
- 🔍 **Buscar** usuarios por cualquier campo

**Campos:**
- ID
- Nombre
- Email
- Teléfono
- Estado (Activo/Inactivo)

### 2. **Mecánicos**
Gestión de profesionales que ofrecen servicios:
- ✏️ **Crear** nuevo mecánico
- 👁️ **Ver** lista de mecánicos
- ✏️ **Editar** información del mecánico (nombre, email, teléfono, calificación, estado)
- 🗑️ **Eliminar** mecánico
- 🔍 **Buscar** mecánicos por cualquier campo

**Campos:**
- ID
- Nombre
- Email
- Teléfono
- Calificación (1-5 estrellas)
- Estado (Activo/Inactivo)

### 3. **Servicios**
Gestión del catálogo de servicios disponibles:
- ✏️ **Crear** nuevo servicio
- 👁️ **Ver** lista de servicios
- ✏️ **Editar** información del servicio (nombre, descripción, duración, precio, estado)
- 🗑️ **Eliminar** servicio
- 🔍 **Buscar** servicios por cualquier campo

**Campos:**
- ID
- Nombre del servicio
- Descripción
- Duración estimada
- Precio
- Estado (Activo/Inactivo)

## Interfaz del Dashboard

### Estadísticas Generales
En la parte superior se muestran 3 tarjetas con:
- **Total de Usuarios** registrados
- **Total de Mecánicos** registrados
- **Total de Servicios** disponibles

### Pestañas de Navegación
Tres pestañas para cambiar entre secciones:
- **Usuarios**
- **Mecánicos**
- **Servicios**

### Barra de Herramientas
- **Buscador**: Busca en tiempo real en todos los campos
- **Botón "Crear Nuevo"**: Abre modal para crear un nuevo elemento

### Tabla de Datos
Muestra todos los elementos de la sección activa con:
- Columnas adaptadas al tipo de dato
- Indicador visual de estado (Activo/Inactivo)
- Botones de acción por fila:
  - ✏️ **Editar**: Abre modal con formulario prellenado
  - 🗑️ **Eliminar**: Solicita confirmación antes de eliminar

### Modal de Crear/Editar
Formulario dinámico que se adapta según la sección:
- **Usuarios/Mecánicos**: Nombre, Email, Teléfono, Estado
- **Mecánicos**: Incluye campo adicional de Calificación
- **Servicios**: Nombre, Descripción, Duración, Precio, Estado

## Flujo de Uso

### Crear Elemento
1. Seleccionar pestaña (Usuarios, Mecánicos o Servicios)
2. Click en "Crear Nuevo"
3. Llenar formulario en el modal
4. Click en "Crear"
5. El elemento aparece en la tabla

### Editar Elemento
1. Click en botón de editar (✏️) en la fila deseada
2. Modal se abre con datos actuales
3. Modificar campos necesarios
4. Click en "Guardar"
5. Cambios se reflejan en la tabla

### Eliminar Elemento
1. Click en botón de eliminar (🗑️) en la fila deseada
2. Confirmar eliminación en el diálogo
3. Elemento desaparece de la tabla

### Buscar Elemento
1. Escribir en el campo de búsqueda
2. La tabla se filtra automáticamente
3. Muestra solo elementos que coincidan con el término

## Navegación del Administrador

### Sidebar
El administrador solo ve:
- **Dashboard** - Única opción disponible

### Navbar
El administrador solo ve:
- **Dashboard** - Enlace al panel de administración
- **Menú de usuario** - Con opción de cerrar sesión

## Notas Técnicas

- Los datos actualmente son simulados (mock data)
- En producción, estos datos vendrían de una API/base de datos
- Las operaciones CRUD modifican el estado local de React
- Al recargar la página, los cambios se pierden (temporal)
- Para persistencia real, se necesita integrar con un backend

## Seguridad

- Solo usuarios con rol "admin" pueden acceder al Dashboard
- Rutas protegidas mediante `ProtectedRoute`
- Intentos de acceso no autorizado redirigen según el rol del usuario

## Próximos Pasos (Producción)

Para llevar esto a producción se necesita:
1. Conectar con API backend
2. Implementar autenticación real con JWT
3. Agregar validación de formularios
4. Implementar paginación para tablas grandes
5. Agregar confirmaciones y notificaciones toast
6. Implementar manejo de errores de API
7. Agregar filtros avanzados y ordenamiento
8. Implementar exportación de datos (CSV, PDF)
