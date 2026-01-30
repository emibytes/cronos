import React from 'react';
import { X, Link as LinkIcon, Menu as MenuIcon, CheckCircle2, XCircle, Hash, FolderTree } from 'lucide-react';
import { Menu } from '../services/menuService';

interface MenuViewModalProps {
  menu: Menu;
  onClose: () => void;
}

const MenuViewModal: React.FC<MenuViewModalProps> = ({ menu, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emibytes-primary/10 flex items-center justify-center">
              <MenuIcon className="text-emibytes-primary" size={20} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              Detalles del Menú
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Información Principal */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Información Principal
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 space-y-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{menu.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID</div>
                  <div className="text-sm font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {menu.id}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estado</div>
                  <div>
                    {menu.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold">
                        <CheckCircle2 size={14} />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold">
                        <XCircle size={14} />
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* URL y Target */}
          {menu.url && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Configuración de Enlace
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <LinkIcon className="text-gray-400 mt-1" size={18} />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">URL</div>
                    <div className="text-sm font-mono text-gray-900 dark:text-white break-all bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                      {menu.url}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Abrir en</div>
                  <div>
                    {menu.target === '_blank' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                        Nueva pestaña (_blank)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium">
                        Misma pestaña (_self)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Jerarquía */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Jerarquía y Orden
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <FolderTree className="text-gray-400 mt-1" size={18} />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Menú Padre</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {menu.parent?.name || (
                        <span className="text-gray-400 italic">Menú raíz</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Hash className="text-gray-400 mt-1" size={18} />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Orden</div>
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emibytes-primary/10 text-emibytes-primary text-lg font-bold">
                      {menu.order}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submenús */}
          {menu.children && menu.children.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Submenús ({menu.children.length})
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
                {menu.children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center gap-2">
                      <MenuIcon className="text-gray-400" size={16} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {child.name}
                      </span>
                    </div>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold">
                      {child.order}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fechas */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Información de Sistema
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Creado</div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {new Date(menu.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Actualizado</div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {new Date(menu.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuViewModal;
