import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Lock, Eye, Plus, Edit, Trash } from 'lucide-react';
import { roleService, Role, MenuPermission } from '../services/roleService';
import { menuService, Menu } from '../services/menuService';
import Swal from 'sweetalert2';

interface RoleFormProps {
  role?: Role | null;
  onClose: () => void;
  onSuccess: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableMenus, setAvailableMenus] = useState<Menu[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_super_admin: false,
    status: 'active' as 'active' | 'inactive',
  });
  const [menuPermissions, setMenuPermissions] = useState<Map<string, MenuPermission>>(new Map());

  useEffect(() => {
    loadMenus();
    if (role) {
      console.log('🔍 Cargando rol para editar:', role);
      console.log('📋 Permisos del rol:', role.permissions);
      
      setFormData({
        name: role.name,
        slug: role.slug,
        description: role.description || '',
        is_super_admin: role.is_super_admin,
        status: role.status,
      });

      // Cargar permisos existentes
      if (role.permissions && role.permissions.length > 0) {
        const permissionsMap = new Map<string, MenuPermission>();
        role.permissions.forEach((perm) => {
          console.log('➕ Agregando permiso:', perm);
          permissionsMap.set(perm.menu_id, perm);
        });
        setMenuPermissions(permissionsMap);
        console.log('✅ Mapa de permisos cargado:', permissionsMap.size, 'permisos');
      } else {
        console.log('⚠️ No hay permisos para cargar');
      }
    }
  }, [role]);

  const loadMenus = async () => {
    try {
      const menus = await menuService.getMenus({ status: 'active' });
      setAvailableMenus(menus);
    } catch (error) {
      console.error('Error loading menus:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los menús',
        confirmButtonColor: '#138b52',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    // Auto-generar slug desde el nombre
    if (name === 'name' && !role) {
      const slug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const toggleMenuPermission = (menuId: string, permission: 'can_view' | 'can_create' | 'can_edit' | 'can_delete') => {
    setMenuPermissions(prev => {
      const newMap = new Map(prev);
      const defaultPerm: MenuPermission = {
        menu_id: menuId,
        can_view: false,
        can_create: false,
        can_edit: false,
        can_delete: false,
      };
      const current = (newMap.get(menuId) as MenuPermission | undefined) || defaultPerm;

      // Si desactivan view, desactivar todos los demás
      if (permission === 'can_view' && current.can_view) {
        newMap.set(menuId, {
          ...current,
          can_view: false,
          can_create: false,
          can_edit: false,
          can_delete: false,
        });
      } else if (permission === 'can_view') {
        // Si activan view, activarlo
        newMap.set(menuId, { ...current, can_view: true });
      } else {
        // Para otros permisos, activar view automáticamente si no está activo
        newMap.set(menuId, {
          ...current,
          can_view: true,
          [permission]: !current[permission],
        });
      }

      return newMap;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convertir el Map a array de permisos
      const menusArray = Array.from(menuPermissions.values()).filter(
        (perm: MenuPermission) => perm.can_view || perm.can_create || perm.can_edit || perm.can_delete
      ) as MenuPermission[];

      const payload = {
        ...formData,
        menus: menusArray,
      };

      if (role) {
        await roleService.updateRole(role.id, payload);
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'El rol ha sido actualizado exitosamente',
          confirmButtonColor: '#138b52',
          timer: 2000,
        });
      } else {
        await roleService.createRole(payload);
        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'El rol ha sido creado exitosamente',
          confirmButtonColor: '#138b52',
          timer: 2000,
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error al guardar el rol',
        confirmButtonColor: '#138b52',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectAllPermissions = (menuId: string) => {
    setMenuPermissions(prev => {
      const newMap = new Map(prev);
      newMap.set(menuId, {
        menu_id: menuId,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
      });
      return newMap;
    });
  };

  const clearAllPermissions = (menuId: string) => {
    setMenuPermissions(prev => {
      const newMap = new Map(prev);
      newMap.delete(menuId);
      return newMap;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emibytes-primary/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-emibytes-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {role ? 'Editar Rol' : 'Nuevo Rol'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {role ? 'Actualiza la información del rol' : 'Crea un nuevo rol con permisos'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Información Básica</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Rol *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all"
                    placeholder="Ej: Administrador"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all"
                    placeholder="Ej: administrador"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Descripción del rol..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="checkbox"
                      name="is_super_admin"
                      checked={formData.is_super_admin}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-emibytes-primary rounded focus:ring-emibytes-primary"
                    />
                    <div>
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        Super Administrador
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Acceso completo al sistema
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Permisos de menús */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Permisos de Menús</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {menuPermissions.size} menú(s) seleccionado(s)
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 space-y-3">
                {availableMenus.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No hay menús disponibles
                  </div>
                ) : (
                  availableMenus.map(menu => {
                    const perm = menuPermissions.get(menu.id);
                    const hasAnyPermission = perm && (perm.can_view || perm.can_create || perm.can_edit || perm.can_delete);

                    return (
                      <div
                        key={menu.id}
                        className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-2 transition-all ${
                          hasAnyPermission
                            ? 'border-emibytes-primary'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">
                                {menu.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {menu.slug}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => selectAllPermissions(menu.id)}
                              className="text-xs px-2 py-1 text-emibytes-primary hover:bg-emibytes-primary/10 rounded transition-colors"
                            >
                              Todos
                            </button>
                            <button
                              type="button"
                              onClick={() => clearAllPermissions(menu.id)}
                              className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                              Ninguno
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={perm?.can_view || false}
                              onChange={() => toggleMenuPermission(menu.id, 'can_view')}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <Eye size={14} className="text-blue-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Ver</span>
                          </label>

                          <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={perm?.can_create || false}
                              onChange={() => toggleMenuPermission(menu.id, 'can_create')}
                              disabled={!perm?.can_view}
                              className="w-4 h-4 text-green-600 rounded focus:ring-green-500 disabled:opacity-50"
                            />
                            <Plus size={14} className="text-green-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Crear</span>
                          </label>

                          <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={perm?.can_edit || false}
                              onChange={() => toggleMenuPermission(menu.id, 'can_edit')}
                              disabled={!perm?.can_view}
                              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 disabled:opacity-50"
                            />
                            <Edit size={14} className="text-orange-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Editar</span>
                          </label>

                          <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={perm?.can_delete || false}
                              onChange={() => toggleMenuPermission(menu.id, 'can_delete')}
                              disabled={!perm?.can_view}
                              className="w-4 h-4 text-red-600 rounded focus:ring-red-500 disabled:opacity-50"
                            />
                            <Trash size={14} className="text-red-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Eliminar</span>
                          </label>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-emibytes-primary text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {role ? 'Actualizar Rol' : 'Crear Rol'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;
