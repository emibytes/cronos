# Módulo de Gestión de Roles

Este módulo permite gestionar roles y permisos en el sistema Cronos.

## 📁 Archivos Creados

### Servicios
- **`services/roleService.ts`**: Servicio para consumir las APIs de roles
- **`services/menuService.ts`**: Servicio para obtener menús disponibles

### Componentes
- **`components/RoleList.tsx`**: Lista de roles con paginación, búsqueda y filtros
- **`components/RoleForm.tsx`**: Formulario para crear/editar roles y asignar permisos
- **`components/RoleManagement.tsx`**: Componente integrador

### Tipos
- **`types.ts`**: Interfaces Role, Menu y MenuPermission agregadas

## 🔌 APIs Consumidas

### Listar Roles
```typescript
GET /api/admin/roles
Params: {
  status?: 'active' | 'inactive',
  search?: string,
  page?: number,
  per_page?: number,
  sort_by?: string,
  sort_order?: 'asc' | 'desc'
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Roles listados exitosamente",
  "data": {
    "roles": [
      {
        "id": "uuid",
        "name": "Administrador",
        "slug": "administrador",
        "description": "Rol con acceso completo",
        "is_super_admin": false,
        "status": "active",
        "users_count": 5,
        "created_at": "2026-01-26T00:00:00.000000Z",
        "updated_at": "2026-01-26T00:00:00.000000Z"
      }
    ],
    "meta": {
      "current_page": 1,
      "last_page": 3,
      "per_page": 10,
      "total": 25
    }
  }
}
```

### Crear Rol
```typescript
POST /api/admin/roles
Body: {
  name: string,
  slug: string,
  description?: string,
  is_super_admin?: boolean,
  status?: 'active' | 'inactive',
  menus?: MenuPermission[]
}
```

**Ejemplo de payload:**
```json
{
  "name": "Editor",
  "slug": "editor",
  "description": "Rol para editar contenido",
  "is_super_admin": false,
  "status": "active",
  "menus": [
    {
      "menu_id": "menu-uuid-1",
      "can_view": true,
      "can_create": true,
      "can_edit": true,
      "can_delete": false
    },
    {
      "menu_id": "menu-uuid-2",
      "can_view": true,
      "can_create": false,
      "can_edit": false,
      "can_delete": false
    }
  ]
}
```

### Ver Rol
```typescript
GET /api/admin/roles/{id}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "role": {
      "id": "uuid",
      "name": "Administrador",
      "slug": "administrador",
      "description": "Rol con acceso completo",
      "is_super_admin": false,
      "status": "active",
      "users_count": 5,
      "menus": [...],
      "permissions": [
        {
          "menu_id": "uuid",
          "menu_name": "Dashboard",
          "can_view": true,
          "can_create": true,
          "can_edit": true,
          "can_delete": true
        }
      ]
    }
  }
}
```

### Actualizar Rol
```typescript
PUT /api/admin/roles/{id}
Body: {
  name?: string,
  slug?: string,
  description?: string,
  is_super_admin?: boolean,
  status?: 'active' | 'inactive',
  menus?: MenuPermission[]
}
```

### Eliminar Rol
```typescript
DELETE /api/admin/roles/{id}
```

**Nota:** No se puede eliminar un rol que tenga usuarios asignados o que sea super admin.

### Asignar Menús
```typescript
POST /api/admin/roles/{id}/menus
Body: {
  menus: MenuPermission[]
}
```

### Obtener Menús del Rol
```typescript
GET /api/admin/roles/{id}/menus
```

## 🎨 Características del Frontend

### RoleList
- ✅ Paginación con navegación de páginas
- ✅ Búsqueda por nombre o slug
- ✅ Filtro por estado (activo/inactivo)
- ✅ Muestra cantidad de usuarios por rol
- ✅ Indicador visual de super admin
- ✅ Botones de acción (editar/eliminar)
- ✅ Validación antes de eliminar (previene eliminar super admin)
- ✅ Diseño responsive y tema oscuro

### RoleForm
- ✅ Formulario para crear/editar roles
- ✅ Auto-generación de slug desde el nombre
- ✅ Campo de descripción opcional
- ✅ Toggle para super admin
- ✅ Selector de estado (activo/inactivo)
- ✅ Gestión de permisos por menú con 4 niveles:
  - 👁️ Ver (can_view)
  - ➕ Crear (can_create)
  - ✏️ Editar (can_edit)
  - 🗑️ Eliminar (can_delete)
- ✅ Botones de acciones rápidas (Todos/Ninguno por menú)
- ✅ Validación automática (no permite crear/editar/eliminar sin ver)
- ✅ Diseño modal con scroll para muchos menús

## 🚀 Uso

### Opción 1: Usar el componente integrado
```tsx
import RoleManagement from './components/RoleManagement';

function App() {
  return <RoleManagement />;
}
```

### Opción 2: Usar componentes por separado
```tsx
import RoleList from './components/RoleList';
import RoleForm from './components/RoleForm';
import { Role } from './services/roleService';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  return (
    <>
      <RoleList 
        onAdd={() => setShowForm(true)}
        onEdit={(role) => {
          setSelectedRole(role);
          setShowForm(true);
        }}
      />
      {showForm && (
        <RoleForm
          role={selectedRole}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            // Refrescar lista si es necesario
            setShowForm(false);
          }}
        />
      )}
    </>
  );
}
```

## 💡 Ejemplos de Uso del Servicio

### Obtener roles con filtros
```typescript
import { roleService } from './services/roleService';

// Obtener roles activos con búsqueda
const roles = await roleService.getRoles({
  status: 'active',
  search: 'admin',
  page: 1,
  per_page: 10,
  sort_by: 'name',
  sort_order: 'asc'
});
```

### Crear un rol
```typescript
const newRole = await roleService.createRole({
  name: 'Editor',
  slug: 'editor',
  description: 'Rol para editores de contenido',
  status: 'active',
  is_super_admin: false,
  menus: [
    {
      menu_id: 'menu-1',
      can_view: true,
      can_create: true,
      can_edit: true,
      can_delete: false
    }
  ]
});
```

### Actualizar un rol
```typescript
const updatedRole = await roleService.updateRole('role-id', {
  name: 'Editor Senior',
  description: 'Editor con más permisos',
  menus: [...]
});
```

### Eliminar un rol
```typescript
await roleService.deleteRole('role-id');
```

## 🎯 Permisos y Validaciones

### En el Frontend
- Los permisos de crear, editar y eliminar solo se pueden activar si "ver" está activo
- Al desactivar "ver", se desactivan automáticamente todos los demás permisos
- No se puede eliminar un rol marcado como super admin
- Se muestra advertencia al eliminar un rol con usuarios asignados

### En el Backend
- No se puede eliminar un rol con usuarios asignados (error 422)
- Los roles super admin tienen protección especial
- Todas las operaciones requieren autenticación con token Bearer

## 🔐 Autenticación

Todas las peticiones requieren un token de autenticación que se obtiene del localStorage:

```typescript
const token = localStorage.getItem('emibytes_auth_token');
```

El token se envía en el header:
```
Authorization: Bearer {token}
```

## 📝 Notas Importantes

1. El slug se auto-genera desde el nombre en modo creación
2. Los roles super admin no pueden ser eliminados desde la UI
3. La paginación muestra hasta 10 roles por página por defecto
4. Los menús inactivos no aparecen en el formulario de permisos
5. Al actualizar permisos, se sincronizan completamente (reemplaza los existentes)
