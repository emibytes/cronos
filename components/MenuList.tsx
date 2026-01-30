import React, { useState, useEffect } from 'react';
import { Menu, menuService } from '../services/menuService';
import { Edit2, Trash2, Search, Plus, Menu as MenuIcon, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface MenuListProps {
  onEdit: (menu: Menu) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onView?: (menu: Menu) => void;
  refreshKey?: number;
}

const MenuList: React.FC<MenuListProps> = ({ onEdit, onDelete, onAdd, onView, refreshKey = 0 }) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchMenus();
  }, [currentPage, debouncedSearchTerm, statusFilter, refreshKey]);

  const fetchMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: currentPage,
        limit: 15,
      };

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const data = await menuService.getMenus(params);
      setMenus(data.menus || []);
      
      if (data.meta) {
        setTotalPages(data.meta.last_page);
        setTotal(data.meta.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar menús');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold">
          <CheckCircle2 size={14} />
          Activo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold">
        <XCircle size={14} />
        Inactivo
      </span>
    );
  };

  const getTargetBadge = (target: string | null) => {
    if (target === '_blank') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
          Nueva pestaña
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium">
        Misma pestaña
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Menús del Sistema</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona la estructura de navegación del sistema
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emibytes-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={18} />
          Nuevo Menú
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
            setCurrentPage(1);
          }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all font-medium"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <div className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar menús..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchMenus()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all"
            />
          </div>
          <button
            onClick={fetchMenus}
            className="px-4 py-2.5 bg-emibytes-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Search size={18} />
            Buscar
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {loading && menus.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emibytes-primary border-t-transparent"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cargando menús...</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && menus.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Padre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {menus.map((menu) => (
                  <tr key={menu.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MenuIcon className="text-gray-400" size={18} />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {menu.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {menu.url || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTargetBadge(menu.target)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {menu.parent?.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold">
                        {menu.order}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(menu.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onView && (
                          <button
                            onClick={() => onView(menu)}
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(menu)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(menu.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando <span className="font-bold text-gray-900 dark:text-white">{menus.length}</span> de{' '}
                  <span className="font-bold text-gray-900 dark:text-white">{total}</span> menús
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-bold text-gray-900 dark:text-white px-4">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && menus.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <MenuIcon className="text-gray-300 dark:text-gray-600" size={48} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              No hay menús
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Comienza agregando tu primer menú al sistema
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuList;
