
import React, { useState, useEffect } from 'react';
import { Folder, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { projectService, Project, PaginatedResponse } from '../services/projectService';
import Swal from 'sweetalert2';

interface ProjectListProps {
  onEdit?: (project: Project) => void;
  onAdd?: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ onEdit, onAdd }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedResponse['meta']>();
  const perPage = 10;

  useEffect(() => {
    loadProjects();
  }, [currentPage, searchTerm, statusFilter]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;

      const data = await projectService.getProjects(params);
      setProjects(data.projects);
      setPagination(data.meta);
      console.log('📄 Paginación:', data.meta);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los proyectos',
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

  const handleDelete = async (project: Project) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar proyecto?',
      text: `Se eliminará el proyecto "${project.name}". Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await projectService.deleteProject(project.id);
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El proyecto ha sido eliminado exitosamente',
          confirmButtonColor: '#138b52',
          timer: 2000,
        });
        // Si eliminamos el último de la página, volver a la anterior
        if (projects.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          loadProjects();
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el proyecto',
          confirmButtonColor: '#138b52',
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emibytes-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Proyectos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los proyectos de tu organización
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emibytes-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={18} />
          Nuevo Proyecto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar proyectos... (presiona Enter)"
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
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              statusFilter === 'all'
                ? 'bg-emibytes-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              statusFilter === 'active'
                ? 'bg-emibytes-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              statusFilter === 'inactive'
                ? 'bg-emibytes-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Inactivos
          </button>
        </div>
      </div>

      {/* Lista de proyectos */}
      {projects.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
          <Folder size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-semibold">
            {searchTerm || statusFilter !== 'all' ? 'No se encontraron proyectos' : 'No hay proyectos registrados'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {searchTerm || statusFilter !== 'all' ? 'Intenta con otros filtros' : 'Crea tu primer proyecto para comenzar'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group bg-white dark:bg-emibytes-dark-card rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: `${project.color}20` }}
                  >
                    {project.logo ? (
                      <img 
                        src={project.logo} 
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Folder size={24} style={{ color: project.color }} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white">{project.name}</h3>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold mt-1 ${
                        project.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {project.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              {project.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {project.tasks_count || 0} tareas
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit?.(project)}
                    className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(project)}
                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>

          {/* Paginación */}
          {pagination && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              {/* Info de paginación */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando <span className="font-bold text-gray-900 dark:text-white">{pagination.from || 0}</span> a{' '}
                  <span className="font-bold text-gray-900 dark:text-white">{pagination.to || 0}</span> de{' '}
                  <span className="font-bold text-gray-900 dark:text-white">{pagination.total || 0}</span> proyectos
                </div>
                
                {pagination.last_page > 1 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Página {pagination.current_page} de {pagination.last_page}
                  </div>
                )}
              </div>
              
              {/* Controles de navegación */}
              {pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    <ChevronLeft size={18} />
                    Anterior
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => {
                      // Mostrar solo páginas cercanas a la actual
                      if (
                        page === 1 ||
                        page === pagination.last_page ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                              page === currentPage
                                ? 'bg-emibytes-primary text-white'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="text-gray-400">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.last_page}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    Siguiente
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectList;
