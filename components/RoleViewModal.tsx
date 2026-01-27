import React from 'react';
import { X, Shield, Users, CheckCircle2, XCircle, Eye, Edit, Trash2, Plus, Star } from 'lucide-react';
import { Role } from '../services/roleService';

interface RoleViewModalProps {
  role: Role;
  onClose: () => void;
}

const RoleViewModal: React.FC<RoleViewModalProps> = ({ role, onClose }) => {
  const getMenuPermissions = () => {
    if (!role.menus || role.menus.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Sin permisos asignados
        </div>
      );
    }

    return role.menus.map((menu) => {
      const actions = [];
      if (menu.can_view) actions.push({ icon: Eye, label: 'Ver', color: 'blue' });
      if (menu.can_create) actions.push({ icon: Plus, label: 'Crear', color: 'green' });
      if (menu.can_edit) actions.push({ icon: Edit, label: 'Editar', color: 'amber' });
      if (menu.can_delete) actions.push({ icon: Trash2, label: 'Eliminar', color: 'red' });

      return (
        <div
          key={menu.id}
          className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
        >
          <div className="font-semibold text-gray-900 dark:text-white mb-2">
            {menu.name}
          </div>
          {actions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {actions.map((action, idx) => {
                const Icon = action.icon;
                const colorClasses = {
                  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                  green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
                  red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
                };
                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${colorClasses[action.color as keyof typeof colorClasses]}`}
                  >
                    <Icon size={12} />
                    {action.label}
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-xs text-red-600 dark:text-red-400">Sin permisos</span>
          )}
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            Detalles del Rol
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info Básica del Rol */}
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-emibytes-primary/10 rounded-xl flex items-center justify-center border-2 border-emibytes-primary/20">
              <Shield className="w-12 h-12 text-emibytes-primary" />
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {role.name}
                  </h3>
                  {role.is_super_admin && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
                      <Star size={12} />
                      Super Admin
                    </span>
                  )}
                </div>
                {role.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {role.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {role.status === 'active' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-bold">
                    <CheckCircle2 size={14} />
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-bold">
                    <XCircle size={14} />
                    Inactivo
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Estadísticas
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Users className="text-emibytes-primary" size={18} />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Usuarios con este rol</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {role.users_count || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Permisos de Menús */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Permisos de Menús
            </h4>
            <div className="space-y-3">
              {getMenuPermissions()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emibytes-primary text-white rounded-xl font-bold hover:opacity-90 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleViewModal;
