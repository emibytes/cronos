
import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { Clock, Trash2, FileIcon, User, ExternalLink, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onDelete: (id: string) => void;
  onTaskClick: (task: Task) => void;
}

// Helper to strip HTML tags for preview
const stripHtml = (html: string) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const TaskList: React.FC<TaskListProps> = ({ tasks, onDelete, onTaskClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;
  
  // Calcular paginación
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-emibytes-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="inline-block p-4 rounded-full bg-gray-50 dark:bg-gray-800 mb-4">
          <Clock size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold">No hay tareas</h3>
        <p className="text-gray-500">Comienza creando tu primera tarea del día.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Tareas Recientes</h2>
        {tasks.length > 0 && (
          <span className="text-sm text-gray-500">
            Mostrando {indexOfFirstTask + 1}-{Math.min(indexOfLastTask, tasks.length)} de {tasks.length}
          </span>
        )}
      </div>
      <div className="grid gap-4">
        {currentTasks.map((task) => (
          <div 
            key={task.id} 
            className="bg-white dark:bg-emibytes-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 group hover:border-emibytes-primary/50 transition-all cursor-pointer"
            onClick={() => onTaskClick(task)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <StatusBadge status={task.status} />
                  <span className="text-xs text-gray-400">{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold group-hover:text-emibytes-primary transition-colors flex items-center gap-2">
                  {task.title}
                  <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-emibytes-primary" />
                </h3>
              </div>
              <div className="flex items-center">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  title="Eliminar tarea"
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-1">
              {stripHtml(task.observations)}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium">
                  <User size={12} className="text-emibytes-primary" />
                  <span>{task.responsible}</span>
                </div>
                <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emibytes-primary/10 dark:bg-emibytes-primary/20 rounded-full text-xs font-medium text-emibytes-primary">
                  <FolderOpen size={12} />
                  <span>{task.project}</span>
                </div>
                {task.attachments.length > 0 && (
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <FileIcon size={12} />
                    <span>{task.attachments.length} adjuntos</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Mostrar solo páginas relevantes
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-emibytes-primary text-white'
                        : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return <span key={page} className="w-10 h-10 flex items-center justify-center">...</span>;
              }
              return null;
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const configs = {
    pendiente: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500' },
    en_proceso: { label: 'En Proceso', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-500' },
    completada: { label: 'Completada', color: 'bg-green-100 text-emibytes-primary dark:bg-green-900/30 dark:text-green-500' }
  };
  const config = configs[status];
  return (
    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

export default TaskList;
