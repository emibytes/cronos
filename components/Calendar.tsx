
import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

// Función para generar color consistente por proyecto
const getProjectColor = (project: string): string => {
  const colors = [
    { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-500', text: 'text-blue-700 dark:text-blue-400' },
    { bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-500', text: 'text-purple-700 dark:text-purple-400' },
    { bg: 'bg-pink-100 dark:bg-pink-900/30', border: 'border-pink-500', text: 'text-pink-700 dark:text-pink-400' },
    { bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-500', text: 'text-orange-700 dark:text-orange-400' },
    { bg: 'bg-teal-100 dark:bg-teal-900/30', border: 'border-teal-500', text: 'text-teal-700 dark:text-teal-400' },
    { bg: 'bg-indigo-100 dark:bg-indigo-900/30', border: 'border-indigo-500', text: 'text-indigo-700 dark:text-indigo-400' },
    { bg: 'bg-rose-100 dark:bg-rose-900/30', border: 'border-rose-500', text: 'text-rose-700 dark:text-rose-400' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900/30', border: 'border-cyan-500', text: 'text-cyan-700 dark:text-cyan-400' },
  ];
  
  // Hash simple del nombre del proyecto para obtener color consistente
  let hash = 0;
  for (let i = 0; i < project.length; i++) {
    hash = project.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return `${colors[index].bg} ${colors[index].border} ${colors[index].text}`;
};

const Calendar: React.FC<CalendarProps> = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getTasksForDay = (day: number): Task[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dayStart = new Date(year, month, day, 0, 0, 0).getTime();
    const dayEnd = new Date(year, month, day, 23, 59, 59).getTime();

    return tasks.filter(task => {
      if (!task.startDate && !task.endDate) return false;
      
      const taskStart = task.startDate || task.createdAt;
      const taskEnd = task.endDate || taskStart;

      // Tarea que comienza o termina en este día, o que abarca este día
      return (taskStart <= dayEnd && taskEnd >= dayStart);
    });
  };

  const calendarDays = useMemo(() => {
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
  }, [firstDayOfMonth, daysInMonth]);

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
      color: getProjectColor(project)
    }));
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black capitalize">{monthName}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visualiza las tareas programadas por proyecto
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-emibytes-primary text-white rounded-xl font-bold text-xs uppercase hover:opacity-90 transition-opacity"
          >
            Hoy
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Leyenda de Proyectos */}
      {projectColors.length > 0 && (
        <div className="bg-white dark:bg-emibytes-dark-card rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Proyectos</h3>
          <div className="flex flex-wrap gap-2">
            {projectColors.map(({ name, color }) => (
              <div key={name} className={`px-3 py-1.5 rounded-full text-xs font-bold border-l-4 ${color}`}>
                {name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendario */}
      <div className="bg-white dark:bg-emibytes-dark-card rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Encabezados de días */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="p-3 text-center">
              <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Grid de días */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayTasks = day ? getTasksForDay(day) : [];
            const isTodayDay = isToday(day);

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-gray-100 dark:border-gray-800 ${
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
