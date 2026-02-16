
import React, { useState, useMemo, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search, ChevronDown, X } from 'lucide-react';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import { projectService } from '../services/projectService';

interface CalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

// Función para generar color consistente por proyecto (estilo JIRA)
const getProjectColor = (project: string): string => {
  const colors = [
    'border-l-blue-500',
    'border-l-purple-500',
    'border-l-pink-500',
    'border-l-orange-500',
    'border-l-teal-500',
    'border-l-indigo-500',
    'border-l-rose-500',
    'border-l-cyan-500',
  ];
  
  // Hash simple del nombre del proyecto para obtener color consistente
  let hash = 0;
  for (let i = 0; i < project.length; i++) {
    hash = project.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return `bg-emibytes-dark-hover hover:bg-emibytes-dark-pressed ${colors[index]} border-l-[3px] text-gray-100`;
};

// Función para obtener solo el color del borde para la leyenda
const getProjectBorderColor = (project: string): string => {
  const colors = [
    'border-l-blue-500',
    'border-l-purple-500',
    'border-l-pink-500',
    'border-l-orange-500',
    'border-l-teal-500',
    'border-l-indigo-500',
    'border-l-rose-500',
    'border-l-cyan-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < project.length; i++) {
    hash = project.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const Calendar: React.FC<CalendarProps> = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponsibles, setSelectedResponsibles] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);
  
  // Dropdowns
  const [showResponsibleDropdown, setShowResponsibleDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  // Obtener listas únicas (API cuando sea posible; fallback a localStorage)
  const [allResponsibles, setAllResponsibles] = useState<string[]>(() => taskService.getResponsibles());
  const [allProjects, setAllProjects] = useState<string[]>(() => taskService.getProjects());

  const allStatuses: { value: TaskStatus; label: string }[] = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'completada', label: 'Completada' },
  ];

  useEffect(() => {
    let mounted = true;

    (async () => {
      // Cargar usuarios desde API; si falla, mantener responsables locales
      try {
        const users = await userService.getAllUsers();
        if (!mounted) return;
        const names = users.map(u => u.name).filter(Boolean).sort((a,b) => a.localeCompare(b));
        setAllResponsibles(names);
      } catch (error) {
        // fallback: taskService.getResponsibles() ya inicializó la lista
      }

      // Cargar proyectos desde API; si falla, mantener proyectos locales
      try {
        const projects = await projectService.getActiveProjects();
        if (!mounted) return;
        const names = projects.map(p => p.name).filter(Boolean).sort((a,b) => a.localeCompare(b));
        setAllProjects(names);
      } catch (error) {
        // fallback: taskService.getProjects() ya inicializó la lista
      }
    })();

    return () => { mounted = false; };
  }, []);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [currentDate]);

  const firstDayOfMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month, 1).getDay();
  }, [currentDate]);

  const monthName = useMemo(() => {
    return currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  const previousMonth = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const nextMonth = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setViewMode('day');
  };

  // Filtrar tareas
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Filtro de búsqueda
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(search);
        const matchObservations = task.observations.toLowerCase().includes(search);
        if (!matchTitle && !matchObservations) return false;
      }
      
      // Filtro de responsables
      if (selectedResponsibles.length > 0 && !selectedResponsibles.includes(task.responsible)) {
        return false;
      }
      
      // Filtro de proyectos
      if (selectedProjects.length > 0 && !selectedProjects.includes(task.project)) {
        return false;
      }
      
      // Filtro de estados
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(task.status)) {
        return false;
      }
      
      return true;
    });
  }, [tasks, searchTerm, selectedResponsibles, selectedProjects, selectedStatuses]);

  const getTasksForDay = (dayInfo: number | { date: number; month: number; year: number }): Task[] => {
    let year: number, month: number, day: number;
    
    if (typeof dayInfo === 'number') {
      year = currentDate.getFullYear();
      month = currentDate.getMonth();
      day = dayInfo;
    } else {
      year = dayInfo.year;
      month = dayInfo.month;
      day = dayInfo.date;
    }
    
    const dayStart = new Date(year, month, day, 0, 0, 0).getTime();
    const dayEnd = new Date(year, month, day, 23, 59, 59).getTime();

    return filteredTasks.filter(task => {
      if (!task.startDate && !task.endDate) return false;
      
      const taskStart = task.startDate || task.createdAt;
      const taskEnd = task.endDate || taskStart;

      // Tarea que comienza o termina en este día, o que abarca este día
      return (taskStart <= dayEnd && taskEnd >= dayStart);
    });
  };

  const calendarDays = useMemo(() => {
    if (viewMode === 'day') {
      // Solo el día actual
      return [currentDate.getDate()];
    } else if (viewMode === 'week') {
      // Calcular semana (domingo a sábado)
      const curr = new Date(currentDate);
      const firstDay = curr.getDate() - curr.getDay(); // Domingo
      const weekDays = [];
      
      for (let i = 0; i < 7; i++) {
        const day = new Date(curr.getFullYear(), curr.getMonth(), firstDay + i);
        weekDays.push({
          date: day.getDate(),
          month: day.getMonth(),
          year: day.getFullYear(),
        });
      }
      return weekDays;
    } else {
      // Vista de mes
      const days = [];
      
      // Días vacíos al inicio
      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
      }
      
      // Días del mes
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
      }
      
      return days;
    }
  }, [firstDayOfMonth, daysInMonth, currentDate, viewMode]);

  const today = new Date();
  const isToday = (day: number | null) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Obtener proyectos únicos con sus colores
  const projectColors = useMemo(() => {
    const projects = [...new Set(tasks.map(t => t.project))];
    return projects.map((project: string) => ({
      name: project,
      borderColor: getProjectBorderColor(project)
    }));
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-emibytes-dark-card rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="space-y-3">
          {/* Búsqueda - Siempre full width */}
          <div className="w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en el calendario..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none text-sm"
            />
          </div>

          {/* Filtros en grid responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Filtro Responsable */}
            <div className="relative">
              <button
                onClick={() => setShowResponsibleDropdown(!showResponsibleDropdown)}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium justify-between"
              >
                <span className="truncate">
                  {selectedResponsibles.length === 0 
                    ? 'Persona asignada' 
                    : `${selectedResponsibles.length} seleccionado(s)`}
                </span>
                <ChevronDown size={16} className="shrink-0" />
              </button>
              {showResponsibleDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-emibytes-dark-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto z-50">
                  <div className="p-2">
                    {allResponsibles.map((resp) => (
                      <label key={resp} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedResponsibles.includes(resp)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedResponsibles([...selectedResponsibles, resp]);
                            } else {
                              setSelectedResponsibles(selectedResponsibles.filter(r => r !== resp));
                            }
                          }}
                          className="w-4 h-4 text-emibytes-primary rounded focus:ring-emibytes-primary"
                        />
                        <span className="text-sm font-medium">{resp}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro Proyecto */}
            <div className="relative">
              <button
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium justify-between"
              >
                <span className="truncate">
                  {selectedProjects.length === 0 
                    ? 'Proyecto' 
                    : `${selectedProjects.length} proyecto(s)`}
                </span>
                <ChevronDown size={16} className="shrink-0" />
              </button>
              {showProjectDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-emibytes-dark-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto z-50">
                  <div className="p-2">
                    {allProjects.map((proj) => (
                      <label key={proj} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(proj)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProjects([...selectedProjects, proj]);
                            } else {
                              setSelectedProjects(selectedProjects.filter(p => p !== proj));
                            }
                          }}
                          className="w-4 h-4 text-emibytes-primary rounded focus:ring-emibytes-primary"
                        />
                        <span className="text-sm font-medium">{proj}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro Estado */}
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium justify-between"
              >
                <span className="truncate">
                  {selectedStatuses.length === 0 
                    ? 'Estado' 
                    : `${selectedStatuses.length} estado(s)`}
                </span>
                <ChevronDown size={16} className="shrink-0" />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-emibytes-dark-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50">
                  <div className="p-2">
                    {allStatuses.map((status) => (
                      <label key={status.value} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStatuses([...selectedStatuses, status.value]);
                            } else {
                              setSelectedStatuses(selectedStatuses.filter(s => s !== status.value));
                            }
                          }}
                          className="w-4 h-4 text-emibytes-primary rounded focus:ring-emibytes-primary"
                        />
                        <span className="text-sm font-medium">{status.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botón limpiar filtros */}
            {(searchTerm || selectedResponsibles.length > 0 || selectedProjects.length > 0 || selectedStatuses.length > 0) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedResponsibles([]);
                  setSelectedProjects([]);
                  setSelectedStatuses([]);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium text-red-600 dark:text-red-400"
                title="Limpiar filtros"
              >
                <X size={16} />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navegación y Vista */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-black capitalize min-w-[200px] text-center">
            {viewMode === 'day' 
              ? currentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
              : monthName}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-emibytes-primary text-white rounded-xl font-bold text-xs uppercase hover:opacity-90 transition-opacity"
          >
            Hoy
          </button>
          
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition-all ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-emibytes-dark-card shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition-all ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-emibytes-dark-card shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition-all ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-emibytes-dark-card shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Mes
            </button>
          </div>
        </div>
      </div>

      {/* Leyenda de Proyectos */}
      {projectColors.length > 0 && (
        <div className="bg-white dark:bg-emibytes-dark-card rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Proyectos</h3>
          <div className="flex flex-wrap gap-2">
            {projectColors.map(({ name, borderColor }) => (
              <div key={name} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-l-4 bg-gray-50 dark:bg-emibytes-dark-sunken ${borderColor}`}>
                {name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendario */}
      <div className="bg-white dark:bg-emibytes-dark-card rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Encabezados de días */}
        {viewMode !== 'day' && (
          <div className={`grid ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'} bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200/30 dark:border-gray-700/20`}>
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="p-3 text-center">
                <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase">
                  {day}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Vista DÍA */}
        {viewMode === 'day' && (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-black text-gray-700 dark:text-gray-300">
                {currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
            </div>
            <div className="space-y-3">
              {getTasksForDay(currentDate.getDate()).map(task => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className={`w-full text-left p-4 rounded-xl border-l-4 hover:shadow-lg transition-all ${getProjectColor(task.project)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm mb-1">{task.title}</h4>
                      <p className="text-xs opacity-75">{task.project}</p>
                    </div>
                    <div className="text-xs font-bold px-2 py-1 rounded bg-white dark:bg-gray-900/50">
                      {task.responsible}
                    </div>
                  </div>
                </button>
              ))}
              {getTasksForDay(currentDate.getDate()).length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <CalendarIcon size={48} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No hay tareas programadas para hoy</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vista SEMANA */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-7">
            {calendarDays.map((dayInfo: any, index) => {
              const dayTasks = getTasksForDay(dayInfo);
              const dayDate = new Date(dayInfo.year, dayInfo.month, dayInfo.date);
              const isTodayDay = dayDate.toDateString() === today.toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-[200px] p-3 border-r border-b border-gray-200/30 dark:border-gray-700/20 ${
                    dayInfo.month !== currentDate.getMonth() 
                      ? 'bg-gray-50/50 dark:bg-gray-900/20' 
                      : 'bg-white dark:bg-emibytes-dark-card'
                  } ${index % 7 === 6 ? 'border-r-0' : ''}`}
                >
                  <div className={`text-sm font-bold mb-3 ${
                    isTodayDay 
                      ? 'w-8 h-8 bg-emibytes-primary text-white rounded-full flex items-center justify-center text-xs'
                      : dayInfo.month !== currentDate.getMonth()
                      ? 'text-gray-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {dayInfo.date}
                  </div>
                  <div className="space-y-1.5">
                    {dayTasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-bold border-l-2 truncate hover:shadow-md transition-all ${getProjectColor(task.project)}`}
                      >
                        {task.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Vista MES */}
        {viewMode === 'month' && (
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayTasks = day ? getTasksForDay(day as number) : [];
              const isTodayDay = isToday(day as number | null);

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-r border-b border-gray-200/30 dark:border-gray-700/20 ${
                    !day ? 'bg-gray-50/50 dark:bg-gray-900/20' : 'bg-white dark:bg-emibytes-dark-card'
                  } ${index % 7 === 6 ? 'border-r-0' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-bold mb-2 ${
                        isTodayDay 
                          ? 'w-7 h-7 bg-emibytes-primary text-white rounded-full flex items-center justify-center text-xs'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map(task => (
                          <button
                            key={task.id}
                            onClick={() => onTaskClick(task)}
                            className={`w-full text-left px-2 py-1 rounded text-[10px] font-bold border-l-2 truncate hover:shadow-md transition-all ${getProjectColor(task.project)}`}
                          >
                            {task.title}
                          </button>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="text-[9px] text-gray-400 font-bold px-2">
                            +{dayTasks.length - 3} más
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tareas sin fechas */}
      {tasks.filter(t => !t.startDate && !t.endDate).length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon size={16} className="text-amber-600" />
            <h3 className="text-xs font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest">
              Tareas sin programar ({tasks.filter(t => !t.startDate && !t.endDate).length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {tasks.filter(t => !t.startDate && !t.endDate).slice(0, 6).map(task => (
              <button
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="text-left px-3 py-2 bg-white dark:bg-emibytes-dark-card rounded-xl border border-amber-200 dark:border-amber-800 hover:shadow-md transition-all"
              >
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                  {task.title}
                </div>
                <div className={`text-[10px] font-bold mt-1 inline-block px-2 py-0.5 rounded ${getProjectColor(task.project)}`}>
                  {task.project}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
