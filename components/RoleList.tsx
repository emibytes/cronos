import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, Users, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { roleService, Role, PaginatedResponse } from '../services/roleService';
import Swal from 'sweetalert2';

interface RoleListProps {
  onEdit?: (role: Role) => void;
  onAdd?: () => void;
  onView?: (role: Role) => void;
}

const RoleList: React.FC<RoleListProps> = ({ onEdit, onAdd, onView }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedResponse['meta']>();
  const perPage = 10;

  useEffect(() => {
    loadRoles();
  }, [currentPage, searchTerm, statusFilter]);

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        per_page: perPage,
        sort_by: 'name',
        sort_order: 'asc',
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;

      const data = await roleService.getRoles(params);
      setRoles(data.roles);
      setPagination(data.meta);
      console.log('📄 Roles cargados:', data.meta);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los roles',
        confirmButtonColor: '#138b52',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDelete = async (role: Role) => {
    // Verificar si es super admin
    if (role.is_super_admin) {
      Swal.fire({
        icon: 'error',
        title: 'Acción no permitida',
        text: 'No se puede eliminar un rol de Super Admin',
        confirmButtonColor: '#138b52',
      });
      return;
    }

    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar rol?',
      html: `
        <p>Se eliminará el rol <strong>"${role.name}"</strong>.</p>
        ${role.users_count && role.users_count > 0 
          ? `<p class="text-red-600 font-semibold mt-2">⚠️ Este rol tiene ${role.users_count} usuario(s) asignado(s)</p>` 
          : ''}
        <p class="mt-2">Esta acción no se puede deshacer.</p>
      `,
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await roleService.deleteRole(role.id);
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El rol ha sido eliminado exitosamente',
          confirmButtonColor: '#138b52',
          timer: 2000,
        });
        // Si eliminamos el último de la página, volver a la anterior
        if (roles.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          loadRoles();
        }
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo eliminar el rol',
          confirmButtonColor: '#138b52',
        });
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.last_page) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Roles y Permisos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los roles y sus permisos en el sistema
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emibytes-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={18} />
          Nuevo Rol
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
              placeholder="Buscar roles... (presiona Enter)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-emibytes-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Search size={18} />
            Buscar
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && roles.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emibytes-primary border-t-transparent"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cargando roles...</p>
          </div>
        </div>
      )}

      {/* Tabla */}
      {!isLoading || roles.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading && (
            <div className="bg-emibytes-primary/5 border-b border-emibytes-primary/20 px-4 py-2">
              <div className="flex items-center gap-2 text-sm text-emibytes-primary">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-emibytes-primary border-t-transparent"></div>
                <span>Actualizando...</span>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Usuarios
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Shield className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      No se encontraron roles
                    </p>
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr
                    key={role.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-emibytes-primary/10 rounded-xl flex items-center justify-center">
                          <Shield className="w-5 h-5 text-emibytes-primary" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">
                            {role.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {role.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {role.description || 'Sin descripción'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                        <Users size={14} />
                        {role.users_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {role.status === 'active' ? (
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
                    </td>
                    <td className="px-6 py-4 text-center">
                      {role.is_super_admin ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold">
                          ⭐ Super Admin
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Estándar
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {onView && (
                          <button
                            onClick={() => onView(role)}
                            className="p-2 text-emibytes-primary hover:bg-emibytes-primary/10 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => onEdit?.(role)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Editar rol"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(role)}
                          disabled={role.is_super_admin}
                          className={`p-2 rounded-lg transition-colors ${
                            role.is_super_admin
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
                          }`}
                          title={role.is_super_admin ? 'No se puede eliminar' : 'Eliminar rol'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination && pagination.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {pagination.from} a {pagination.to} de {pagination.total} roles
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => {
                    // Mostrar solo algunas páginas alrededor de la actual
                    if (
                      page === 1 ||
                      page === pagination.last_page ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-emibytes-primary text-white'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.last_page}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      ) : null}
    </div>
  );
};

export default RoleList;
