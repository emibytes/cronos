import React, { useState, useEffect } from 'react';
import { Menu, menuService } from '../services/menuService';
import { X, Save, Menu as MenuIcon } from 'lucide-react';

interface MenuFormProps {
  menu?: Menu | null;
  onSubmit: (menuData: {
    name: string;
    url?: string | null;
    target?: '_self' | '_blank' | null;
    parent_id?: string | null;
    order?: number | null;
    status: 'active' | 'inactive';
  }) => void;
  onClose: () => void;
}

const MenuForm: React.FC<MenuFormProps> = ({ menu, onSubmit, onClose }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [target, setTarget] = useState<'_self' | '_blank'>('_self');
  const [parentId, setParentId] = useState<string>('');
  const [order, setOrder] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [availableParents, setAvailableParents] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadParentMenus();
  }, []);

  useEffect(() => {
    if (menu) {
      setName(menu.name);
      setUrl(menu.url || '');
      setTarget(menu.target || '_self');
      setParentId(menu.parent_id || '');
      setOrder(menu.order?.toString() || '');
      setStatus(menu.status);
    }
  }, [menu]);

  const loadParentMenus = async () => {
    try {
      setLoading(true);
      const data = await menuService.getMenus({ status: 'active', limit: 100 });
      // Si estamos editando, filtrar el menú actual y sus hijos para evitar loops
      const filtered = menu 
        ? data.menus.filter(m => m.id !== menu.id && m.parent_id !== menu.id)
        : data.menus;
      setAvailableParents(filtered || []);
    } catch (error) {
      console.error('Error cargando menús padre:', error);
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const menuData: any = {
      name: name.trim(),
      url: url.trim() || null,
      target: target || '_self',
      parent_id: parentId || null,
      order: order ? parseInt(order) : null,
      status,
    };

    onSubmit(menuData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emibytes-primary/10 flex items-center justify-center">
              <MenuIcon className="text-emibytes-primary" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {menu ? 'Editar Menú' : 'Nuevo Menú'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {menu ? 'Modifica los datos del menú' : 'Completa la información del nuevo menú'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.name
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-200 dark:border-gray-700 focus:ring-emibytes-primary'
              } bg-white dark:bg-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all`}
              placeholder="Ej: Dashboard, Usuarios, Reportes"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all"
              placeholder="Ej: /dashboard, /users, https://example.com"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Puede ser una ruta relativa o una URL completa
            </p>
          </div>

          {/* Grid de 2 columnas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Target */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Abrir en
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as '_self' | '_blank')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all"
              >
                <option value="_self">Misma pestaña</option>
                <option value="_blank">Nueva pestaña</option>
              </select>
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Orden
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all"
                placeholder="Auto"
                min="1"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Dejar vacío para auto-asignar
              </p>
            </div>
          </div>

          {/* Parent Menu */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Menú Padre
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all disabled:opacity-50"
            >
              <option value="">Sin padre (menú raíz)</option>
              {availableParents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Selecciona un menú padre para crear un submenú
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-emibytes-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
            >
              <Save size={18} />
              {menu ? 'Guardar Cambios' : 'Crear Menú'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuForm;
