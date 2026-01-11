
import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { GripVertical, User, FolderOpen, Clock, ExternalLink, Calendar } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskClick, onUpdateTaskStatus }) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const columns: { status: TaskStatus; label: string; color: string; bgColor: string }[] = [
    { 
      status: 'pendiente', 
      label: 'Pendiente', 
      color: 'text-amber-700 dark:text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/10'
    },
    { 
      status: 'en_proceso', 
      label: 'En Proceso', 
      color: 'text-blue-700 dark:text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10'
    },
    { 
      status: 'completada', 
      label: 'Completada', 
      color: 'text-emibytes-primary dark:text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/10'
    },
  ];

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    // Add a subtle opacity to the dragged element
    (e.target as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedTask.status !== status) {
      onUpdateTaskStatus(draggedTask.id, status);
    }
    setDraggedTask(null);
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Tablero de Tareas</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Arrastra y suelta las tareas para cambiar su estado
          </p>
        </div>
        <div className="text-xs font-black bg-emibytes-primary/10 text-emibytes-primary px-4 py-2 rounded-full uppercase tracking-widest">
          {tasks.length} Tareas
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {columns.map(column => {
          const columnTasks = getTasksByStatus(column.status);
          const isOver = dragOverColumn === column.status;

          return (
            <div
              key={column.status}
              className="flex flex-col min-h-[200px] md:min-h-[500px]"
            >
              {/* Column Header */}
              <div className={`${column.bgColor} rounded-t-2xl p-4 border-b-4 ${
                column.status === 'pendiente' ? 'border-amber-500' :
                column.status === 'en_proceso' ? 'border-blue-500' : 'border-emibytes-primary'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-black text-sm uppercase tracking-wider ${column.color}`}>
                    {column.label}
                  </h3>
                  <span 
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${column.bgColor} ${column.color} border ${
                      column.status === 'pendiente' ? 'border-amber-200 dark:border-amber-800' :
                      column.status === 'en_proceso' ? 'border-blue-200 dark:border-blue-800' : 
                      'border-green-200 dark:border-green-800'
                    }`}
                  >
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div
                onDragOver={(e) => handleDragOver(e, column.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.status)}
                className={`flex-1 bg-gray-50 dark:bg-gray-900/20 rounded-b-2xl p-4 space-y-3 transition-all ${
                  isOver ? 'bg-emibytes-primary/5 ring-2 ring-emibytes-primary ring-inset' : ''
                }`}
              >
                {columnTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Clock size={32} className="mb-2 opacity-20" />
                    <p className="text-xs font-bold">No hay tareas</p>
                  </div>
                ) : (
                  columnTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onTaskClick(task)}
                      className="bg-white dark:bg-emibytes-dark-card rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-800 cursor-move hover:shadow-lg hover:border-emibytes-primary/50 transition-all group"
                    >
                      {/* Drag Handle */}
                      <div className="flex items-start gap-2 mb-2">
                        <GripVertical 
                          size={16} 
                          className="text-gray-300 dark:text-gray-700 group-hover:text-emibytes-primary transition-colors mt-1 flex-shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm leading-tight mb-1 group-hover:text-emibytes-primary transition-colors line-clamp-2">
                            {task.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {stripHtml(task.observations)}
                          </p>
                        </div>
                      </div>

                      {/* Task Meta */}
                      <div className="flex flex-wrap gap-2 items-center text-xs">
                        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <User size={10} className="text-emibytes-primary" />
                          <span className="font-medium truncate max-w-[100px]">{task.responsible}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-emibytes-primary/10 dark:bg-emibytes-primary/20 rounded-full text-emibytes-primary">
                          <FolderOpen size={10} />
                          <span className="font-medium truncate max-w-[100px]">{task.project}</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Calendar size={10} />
                          <span>{new Date(task.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <ExternalLink 
                          size={12} 
                          className="text-gray-300 group-hover:text-emibytes-primary transition-colors" 
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskBoard;
