import React, { useState, useEffect } from 'react';
import { User } from '../services/userService';
import { Role, roleService, MenuPermission } from '../services/roleService';
import { Menu, menuService } from '../services/menuService';
import { X, Eye, Plus, Edit, Trash, Shield, Lock, Save, Upload, User as UserIcon } from 'lucide-react';

interface UserFormProps {
  user?: User | null;
  onSubmit: (userData: {
    name: string;
    username: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    role_id?: string | null;
    status: 'active' | 'inactive';
    menus: MenuPermission[];
    avatar?: File | null;
  }) => void;
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onClose }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [roleId, setRoleId] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [menuPermissions, setMenuPermissions] = useState<MenuPermission[]>([]);
  const [availableMenus, setAvailableMenus] = useState<Menu[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (user) {
      console.log('Cargando datos de usuario para editar:', user);
      setName(user.name);
      setUsername(user.username);
      setEmail(user.email);
      setRoleId(user.role_id || '');
      setStatus(user.status);
      
      // Cargar avatar preview si existe
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
      
      // Load user permissions
      if (user.permissions && user.permissions.length > 0) {
        console.log('Permisos del usuario:', user.permissions);
        setMenuPermissions(user.permissions);
      }
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [menusData, rolesData] = await Promise.all([
        menuService.getMenus(),
        roleService.getRoles({ per_page: 100 })
      ]);
      
      setAvailableMenus(menusData);
      setAvailableRoles(rolesData.roles || []);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (selectedRoleId: string) => {
    setRoleId(selectedRoleId);
    
    if (!selectedRoleId) {
      // Si no hay rol seleccionado, limpiar permisos solo si no es edición
      if (!user) {
        setMenuPermissions([]);
      }
      return;
    }

    try {
      setLoading(true);
      // Cargar permisos del rol seleccionado como plantilla
      const roleData = await roleService.getRole(selectedRoleId);
      console.log('✅ Datos del rol cargado:', roleData);
      console.log('📋 Permisos del rol:', roleData.permissions);
      
      if (roleData.permissions && roleData.permissions.length > 0) {
        console.log(`✅ Precargando ${roleData.permissions.length} permisos del rol "${roleData.name}"`);
        setMenuPermissions([...roleData.permissions]);
      } else {
        console.log('⚠️ El rol no tiene permisos configurados');
        setMenuPermissions([]);
      }
    } catch (error) {
      console.error('❌ Error cargando permisos del rol:', error);
      setMenuPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, avatar: 'Por favor selecciona una imagen válida' });
        return;
      }
      
      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, avatar: 'La imagen no debe superar los 2MB' });
        return;
      }
      
      setAvatar(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Limpiar error de avatar si existía
      const newErrors = { ...errors };
      delete newErrors.avatar;
      setErrors(newErrors);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(user?.avatar_url || null);
    const newErrors = { ...errors };
    delete newErrors.avatar;
    setErrors(newErrors);
  };

  const handlePermissionChange = (
    menuId: string,
    permission: 'can_view' | 'can_create' | 'can_edit' | 'can_delete',
    checked: boolean
  ) => {
    setMenuPermissions((prev) => {
      const existingIndex = prev.findIndex((p) => p.menu_id === menuId);
      
      if (existingIndex >= 0) {
        // Actualizar permiso existente
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          [permission]: checked,
        };
        return updated;
      } else {
        // Crear nuevo permiso
        return [
          ...prev,
          {
            menu_id: menuId,
            can_view: permission === 'can_view' ? checked : false,
            can_create: permission === 'can_create' ? checked : false,
            can_edit: permission === 'can_edit' ? checked : false,
            can_delete: permission === 'can_delete' ? checked : false,
          },
        ];
      }
    });
  };

  const getPermissionValue = (
    menuId: string,
    permission: 'can_view' | 'can_create' | 'can_edit' | 'can_delete'
  ): boolean => {
    const menuPermission = menuPermissions.find((p) => p.menu_id === menuId);
    return menuPermission?.[permission] || false;
  };

  const toggleAllPermissions = (menuId: string, checked: boolean) => {
    setMenuPermissions((prev) => {
      const existingIndex = prev.findIndex((p) => p.menu_id === menuId);
      
      if (checked) {
        // Marcar todos
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            menu_id: menuId,
            can_view: true,
            can_create: true,
            can_edit: true,
            can_delete: true,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              menu_id: menuId,
              can_view: true,
              can_create: true,
              can_edit: true,
              can_delete: true,
            },
          ];
        }
      } else {
        // Desmarcar todos
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated.splice(existingIndex, 1);
          return updated;
        }
        return prev;
      }
    });
  };

  const hasAllPermissions = (menuId: string): boolean => {
    const perm = menuPermissions.find((p) => p.menu_id === menuId);
    return perm ? perm.can_view && perm.can_create && perm.can_edit && perm.can_delete : false;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!username.trim()) {
      newErrors.username = 'El username es requerido';
    }

    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'El email no es válido';
    }

    // Validar contraseña solo si es un nuevo usuario o si se está cambiando
    if (!user && !password) {
      newErrors.password = 'La contraseña es requerida';
    }

    if (password && password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (password !== passwordConfirmation) {
      newErrors.password_confirmation = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const userData: any = {
      name,
      username,
      email,
      role_id: roleId || null,
      status,
      menus: menuPermissions,
      avatar: avatar,
    };

    // Solo incluir password si se proporcionó
    if (password) {
      userData.password = password;
      userData.password_confirmation = passwordConfirmation;
    }

    onSubmit(userData);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emibytes-primary border-t-transparent"></div>
      </div>
    );
  }

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
                {user ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user ? 'Actualiza la información del usuario' : 'Crea un nuevo usuario con permisos'}
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
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all`}
                    placeholder="Juan Pérez"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all`}
                    placeholder="juanperez"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all`}
                  placeholder="juan@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Foto de Perfil
                </label>
                <div className="flex items-center gap-4">
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    {avatarPreview ? (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                        {avatar && (
                          <button
                            type="button"
                            onClick={removeAvatar}
                            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg hover:bg-red-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Upload button */}
                  <div className="flex-1">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-all font-medium">
                      <Upload size={18} />
                      <span>Seleccionar imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      JPG, PNG o GIF (máx. 2MB)
                    </p>
                    {errors.avatar && (
                      <p className="mt-1 text-sm text-red-600">{errors.avatar}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Contraseña {!user && '*'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all`}
                    placeholder={user ? 'Dejar en blanco para no cambiar' : 'Mínimo 8 caracteres'}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Confirmar Contraseña {!user && '*'}
                  </label>
                  <input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.password_confirmation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all`}
                    placeholder="Confirmar contraseña"
                  />
                  {errors.password_confirmation && (
                    <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Rol (Plantilla de permisos)
                  </label>
                  <select
                    value={roleId}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all font-medium"
                  >
                    <option value="">Sin rol</option>
                    {availableRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Al seleccionar un rol, se precargarán sus permisos como plantilla. Puedes personalizarlos a continuación.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all font-medium"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Permisos de menús */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Permisos de Menús</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Personaliza los permisos para este usuario. Los permisos se precargan desde el rol seleccionado.
            </p>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-300 dark:border-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Menú
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-20">
                      <div className="flex flex-col items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>Ver</span>
                      </div>
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-20">
                      <div className="flex flex-col items-center gap-1">
                        <Plus className="w-4 h-4" />
                        <span>Crear</span>
                      </div>
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-20">
                      <div className="flex flex-col items-center gap-1">
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </div>
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-20">
                      <div className="flex flex-col items-center gap-1">
                        <Trash className="w-4 h-4" />
                        <span>Eliminar</span>
                      </div>
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-emibytes-primary uppercase tracking-wider w-20">
                      <div className="flex flex-col items-center gap-1">
                        <span>Todos</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-300 dark:divide-gray-600">
                  {availableMenus.map((menu) => (
                    <tr key={menu.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                        {menu.name}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={getPermissionValue(menu.id, 'can_view')}
                          onChange={(e) =>
                            handlePermissionChange(menu.id, 'can_view', e.target.checked)
                          }
                          className="w-4 h-4 text-emibytes-primary border-gray-300 dark:border-gray-600 rounded focus:ring-emibytes-primary focus:ring-1"
                        />
                      </td>
                      <td className="px-2 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={getPermissionValue(menu.id, 'can_create')}
                          onChange={(e) =>
                            handlePermissionChange(menu.id, 'can_create', e.target.checked)
                          }
                          className="w-4 h-4 text-emibytes-primary border-gray-300 dark:border-gray-600 rounded focus:ring-emibytes-primary focus:ring-1"
                        />
                      </td>
                      <td className="px-2 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={getPermissionValue(menu.id, 'can_edit')}
                          onChange={(e) =>
                            handlePermissionChange(menu.id, 'can_edit', e.target.checked)
                          }
                          className="w-4 h-4 text-emibytes-primary border-gray-300 dark:border-gray-600 rounded focus:ring-emibytes-primary focus:ring-1"
                        />
                      </td>
                      <td className="px-2 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={getPermissionValue(menu.id, 'can_delete')}
                          onChange={(e) =>
                            handlePermissionChange(menu.id, 'can_delete', e.target.checked)
                          }
                          className="w-4 h-4 text-emibytes-primary border-gray-300 dark:border-gray-600 rounded focus:ring-emibytes-primary focus:ring-1"
                        />
                      </td>
                      <td className="px-2 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={hasAllPermissions(menu.id)}
                          onChange={(e) => toggleAllPermissions(menu.id, e.target.checked)}
                          className="w-4 h-4 text-emibytes-primary border-gray-300 dark:border-gray-600 rounded focus:ring-emibytes-primary focus:ring-1"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-300 dark:border-gray-600">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-bold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-emibytes-primary text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Save size={18} />
            {user ? 'Actualizar' : 'Crear'} Usuario
          </button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
