# 🧪 Guía de Pruebas del Módulo de Roles

## Pre-requisitos

1. Backend corriendo en el puerto configurado
2. Usuario autenticado con token válido
3. Base de datos con menús creados

## 📝 Checklist de Pruebas

### 1. Navegación
- [ ] Hacer clic en "Roles" en el sidebar
- [ ] Verificar que la URL cambie a `/roles`
- [ ] Verificar que el botón "Roles" esté resaltado en el sidebar
- [ ] Verificar que se muestre el título "Roles y Permisos"

### 2. Lista de Roles
- [ ] Verificar que se carguen los roles existentes
- [ ] Verificar la paginación (si hay más de 10 roles)
- [ ] Probar la búsqueda por nombre/slug
- [ ] Probar el filtro por estado (Activo/Inactivo)
- [ ] Verificar que se muestre el contador de usuarios
- [ ] Verificar que los roles super admin tengan el badge morado

### 3. Crear Rol
- [ ] Hacer clic en "Nuevo Rol"
- [ ] Verificar que se abra el modal
- [ ] Escribir un nombre y verificar que el slug se auto-genere
- [ ] Agregar una descripción
- [ ] Seleccionar estado
- [ ] Asignar permisos a algunos menús:
  - [ ] Activar solo "Ver" en un menú
  - [ ] Activar "Ver" y "Crear" en otro menú
  - [ ] Usar botón "Todos" para activar todos los permisos
  - [ ] Usar botón "Ninguno" para limpiar permisos
  - [ ] Verificar que no se pueda activar "Crear" sin "Ver"
- [ ] Guardar el rol
- [ ] Verificar que aparezca mensaje de éxito
- [ ] Verificar que el rol aparezca en la lista

### 4. Editar Rol
- [ ] Hacer clic en el ícono de editar de un rol
- [ ] Verificar que el formulario se cargue con los datos del rol
- [ ] Modificar el nombre
- [ ] Cambiar algunos permisos
- [ ] Guardar los cambios
- [ ] Verificar que se muestre mensaje de éxito
- [ ] Verificar que los cambios se reflejen en la lista

### 5. Validaciones
- [ ] Intentar desactivar "Ver" cuando otros permisos estén activos
  - Resultado: Todos los permisos se deben desactivar
- [ ] Intentar activar "Crear" sin "Ver"
  - Resultado: "Ver" se debe activar automáticamente
- [ ] Intentar crear un rol sin nombre
  - Resultado: Debe mostrar error de validación
- [ ] Intentar eliminar un rol super admin
  - Resultado: Debe estar deshabilitado el botón

### 6. Eliminar Rol
- [ ] Crear un rol de prueba sin usuarios
- [ ] Hacer clic en el ícono de eliminar
- [ ] Verificar que aparezca confirmación
- [ ] Confirmar eliminación
- [ ] Verificar mensaje de éxito
- [ ] Verificar que el rol desaparezca de la lista

### 7. Rol con Usuarios Asignados
- [ ] Intentar eliminar un rol que tenga usuarios
- [ ] Verificar que aparezca advertencia sobre usuarios asignados
- [ ] Intentar eliminarlo de todas formas
- [ ] Verificar que el backend rechace la operación

### 8. Paginación
Si tienes más de 10 roles:
- [ ] Verificar que se muestre el paginador
- [ ] Hacer clic en página 2
- [ ] Verificar que se carguen diferentes roles
- [ ] Probar los botones anterior/siguiente
- [ ] Verificar que se muestren los puntos suspensivos "..." cuando hay muchas páginas

### 9. Búsqueda
- [ ] Escribir un término de búsqueda
- [ ] Presionar Enter o hacer clic en "Buscar"
- [ ] Verificar que se filtren los resultados
- [ ] Limpiar la búsqueda y verificar que se muestren todos los roles

### 10. Tema Oscuro
- [ ] Cambiar a tema oscuro
- [ ] Verificar que todos los componentes se vean correctamente
- [ ] Verificar contraste de colores
- [ ] Verificar badges y estados
- [ ] Volver a tema claro

### 11. Responsive
- [ ] Reducir el tamaño de la ventana
- [ ] Verificar que la tabla tenga scroll horizontal si es necesario
- [ ] Verificar que el modal se ajuste correctamente
- [ ] Verificar que los botones sean accesibles

### 12. Integración con Backend

#### Verificar respuestas de API:
```bash
# Listar roles
GET http://localhost:8000/api/admin/roles
Authorization: Bearer {token}

# Crear rol
POST http://localhost:8000/api/admin/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Editor de Prueba",
  "slug": "editor-prueba",
  "description": "Rol de prueba",
  "status": "active",
  "is_super_admin": false,
  "menus": [
    {
      "menu_id": "menu-uuid-1",
      "can_view": true,
      "can_create": true,
      "can_edit": false,
      "can_delete": false
    }
  ]
}

# Actualizar rol
PUT http://localhost:8000/api/admin/roles/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Editor Actualizado",
  "status": "inactive"
}

# Eliminar rol
DELETE http://localhost:8000/api/admin/roles/{id}
Authorization: Bearer {token}
```

## 🐛 Problemas Comunes y Soluciones

### Error: "No authentication token found"
**Solución:** Verificar que el usuario esté autenticado y el token exista en localStorage

### Error: "Failed to fetch roles"
**Solución:** 
- Verificar que el backend esté corriendo
- Verificar la URL del API en `apiService.ts`
- Verificar que el token sea válido

### Los menús no aparecen en el formulario
**Solución:** 
- Verificar que existan menús en la base de datos
- Verificar que los menús tengan status 'active'

### La paginación no funciona
**Solución:** Verificar que haya más de 10 roles en la base de datos

### El tema oscuro no se aplica
**Solución:** Verificar que el toggle de tema funcione y que la clase 'dark' se agregue al html

## ✅ Resultado Esperado

Después de completar todas las pruebas:
- ✅ Navegación fluida entre vistas
- ✅ CRUD completo de roles funcionando
- ✅ Validaciones funcionando correctamente
- ✅ Permisos de menús asignándose correctamente
- ✅ Mensajes de éxito/error apropiados
- ✅ UI responsive y accesible
- ✅ Tema oscuro funcionando perfectamente

## 📊 Datos de Prueba Sugeridos

### Rol 1: Administrador
```json
{
  "name": "Administrador",
  "slug": "administrador",
  "description": "Acceso completo al sistema",
  "status": "active",
  "is_super_admin": false,
  "menus": [todos con todos los permisos]
}
```

### Rol 2: Editor
```json
{
  "name": "Editor",
  "slug": "editor",
  "description": "Puede ver y editar contenido",
  "status": "active",
  "is_super_admin": false,
  "menus": [algunos con ver y editar]
}
```

### Rol 3: Viewer
```json
{
  "name": "Visualizador",
  "slug": "visualizador",
  "description": "Solo puede ver información",
  "status": "active",
  "is_super_admin": false,
  "menus": [todos solo con can_view]
}
```

### Rol 4: Inactivo
```json
{
  "name": "Rol Desactivado",
  "slug": "rol-desactivado",
  "description": "Rol de prueba inactivo",
  "status": "inactive",
  "is_super_admin": false,
  "menus": []
}
```

## 🎯 Casos de Uso Reales

1. **Crear rol para nuevo departamento**
   - Crear rol "Ventas"
   - Asignar permisos solo para ver y editar productos
   - Asignar a usuarios del departamento

2. **Modificar permisos de rol existente**
   - Editar rol "Editor"
   - Agregar permiso de eliminar en algunos menús
   - Guardar cambios

3. **Desactivar rol temporalmente**
   - Editar un rol activo
   - Cambiar estado a "inactive"
   - Guardar (los usuarios con ese rol no tendrán acceso)

4. **Eliminar rol obsoleto**
   - Primero reasignar usuarios a otro rol
   - Luego eliminar el rol obsoleto
