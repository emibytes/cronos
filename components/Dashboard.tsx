
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Task } from '../types';
import { CheckCircle, Clock, ListTodo, Search, ArrowRight, FolderOpen, Sparkles } from 'lucide-react';
import { StatusBadge } from './TaskList';
import { dashboardService } from '../services/dashboardService';

interface DashboardProps {
  tasks: Task[];
  allTasksCount: number;
  onTaskClick: (task: Task) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, allTasksCount, onTaskClick }) => {
  const [dailyQuote, setDailyQuote] = useState<string>('');
  const [loadingQuote, setLoadingQuote] = useState(true);

  // Cargar frase motivacional al montar el componente
  useEffect(() => {
    const loadDailyQuote = async () => {
      try {
        setLoadingQuote(true);
        const quote = await dashboardService.getDailyQuote();
        setDailyQuote(quote);
      } catch (error) {
        console.error('Error al cargar frase del día:', error);
      } finally {
        setLoadingQuote(false);
      }
    };

    loadDailyQuote();
  }, []);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pendiente').length,
    inProgress: tasks.filter(t => t.status === 'en_proceso').length,
    completed: tasks.filter(t => t.status === 'completada').length,
  };

  const pieData = [
    { name: 'Pendientes', value: stats.pending, color: '#f59e0b' },
    { name: 'En Proceso', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Completadas', value: stats.completed, color: '#138b52' },
  ].filter(d => d.value > 0);

  const responsibleCounts = tasks.reduce((acc: Record<string, number>, task) => {
    acc[task.responsible] = (acc[task.responsible] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(responsibleCounts).map(([name, count]) => ({
    name,
    Tareas: count as number
  })).sort((a, b) => b.Tareas - a.Tareas).slice(0, 5);

  const isFiltered = tasks.length !== allTasksCount;

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 max-w-full overflow-x-hidden">
      {/* Frase Motivacional del Día */}
      {!loadingQuote && dailyQuote && (
        <div className="bg-gradient-to-br from-emibytes-primary to-green-600 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={24} className="animate-pulse" />
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider">Frase del Día</h3>
            </div>
            <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed italic">
              "{dailyQuote}"
            </p>
          </div>
        </div>
      )}

      {/* Header Info */}
      {isFiltered && (
        <div className="bg-emibytes-primary/10 border border-emibytes-primary/20 p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex items-center justify-between shadow-sm max-w-full">
          <div className="flex items-center gap-3 sm:gap-4 text-emibytes-primary min-w-0">
            <Search size={20} className="shrink-0" />
            <span className="font-bold text-sm sm:text-base truncate">Resultados filtrados: {tasks.length} de {allTasksCount} tareas encontradas.</span>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total" value={stats.total} icon={<ListTodo size={24} />} color="bg-gray-100 dark:bg-gray-800" />
        <StatCard title="Pendientes" value={stats.pending} icon={<Clock size={24} />} color="bg-amber-100 dark:bg-amber-900/20 text-amber-600" />
        <StatCard title="En Proceso" value={stats.inProgress} icon={<Clock size={24} />} color="bg-blue-100 dark:bg-blue-900/20 text-blue-600" />
        <StatCard title="Completadas" value={stats.completed} icon={<CheckCircle size={24} />} color="bg-green-100 dark:bg-green-900/20 text-emibytes-primary" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full">
        <div className="bg-white dark:bg-emibytes-dark-card p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[32px] shadow-lg border border-gray-100 dark:border-gray-800 max-w-full overflow-hidden">
          <h3 className="text-lg sm:text-xl font-black mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3">
            <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-emibytes-primary rounded-full"></div>
            <span className="truncate">Estado de Operaciones</span>
          </h3>
          <div className="h-64 sm:h-72 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                <Search size={48} className="opacity-10" />
                <p className="font-bold">Sin datos para visualizar</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-emibytes-dark-card p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[32px] shadow-lg border border-gray-100 dark:border-gray-800 max-w-full overflow-hidden">
          <h3 className="text-lg sm:text-xl font-black mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3">
             <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-blue-500 rounded-full"></div>
             <span className="truncate">Productividad por Equipo</span>
          </h3>
          <div className="h-64 sm:h-72 w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 5, top: 5, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#888888" 
                    fontSize={10} 
                    fontWeight="bold"
                    tickLine={false} 
                    axisLine={false}
                    width={70}
                  />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="Tareas" fill="#138b52" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                <Search size={48} className="opacity-10" />
                <p className="font-bold">No se encontraron responsables</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explorer */}
      <div className="bg-white dark:bg-emibytes-dark-card rounded-2xl sm:rounded-[32px] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden max-w-full">
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5 min-w-0">
          <h3 className="text-lg sm:text-xl font-black truncate">Explorador de Flujo</h3>
          <span className="text-[10px] sm:text-xs font-black bg-emibytes-primary/10 text-emibytes-primary px-2 sm:px-4 py-1 sm:py-1.5 rounded-full uppercase tracking-wide sm:tracking-widest shrink-0">{tasks.length} Entradas</span>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {tasks.slice(0, 6).map((task) => (
            <div 
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="p-4 sm:p-6 hover:bg-emibytes-primary/[0.02] dark:hover:bg-emibytes-primary/10 transition-all cursor-pointer flex items-center justify-between group min-w-0"
            >
              <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1 overflow-hidden">
                <div className={`w-2 sm:w-3 h-10 sm:h-12 rounded-full shrink-0 ${
                  task.status === 'completada' ? 'bg-emibytes-primary shadow-lg shadow-emibytes-primary/20' : 
                  task.status === 'en_proceso' ? 'bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-amber-500 shadow-lg shadow-amber-500/20'
                }`}></div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h4 className="font-black text-base sm:text-lg truncate group-hover:text-emibytes-primary transition-colors tracking-tight">{task.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 overflow-hidden">
                    <StatusBadge status={task.status} />
                    {task.responsible && (
                      <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider truncate max-w-[120px]">@{task.responsible}</span>
                    )}
                    {task.project && (
                      <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 bg-emibytes-primary/10 text-emibytes-primary rounded-full max-w-[120px] overflow-hidden">
                        <FolderOpen size={10} className="shrink-0" />
                        <span className="truncate">{task.project}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <ArrowRight size={20} className="text-gray-200 group-hover:text-emibytes-primary group-hover:translate-x-2 transition-all shrink-0 hidden sm:block ml-2" />
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="p-20 text-center text-gray-400 flex flex-col items-center">
              <Search size={64} className="mb-4 opacity-10" />
              <p className="font-bold text-lg">No hay coincidencias en este workspace</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
  <div className="relative bg-white dark:bg-emibytes-dark-card p-4 sm:p-6 rounded-2xl sm:rounded-[32px] shadow-lg border border-gray-100 dark:border-gray-800 flex items-center space-x-3 sm:space-x-5 hover:shadow-2xl transition-all group max-w-full overflow-hidden">
    {/* Watermark Logo */}
    <img src="/logo-96x96.png" className="absolute -right-4 w-24 h-24 opacity-[0.03] group-hover:scale-125 transition-transform pointer-events-none" alt="" />
    
    <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${color} flex items-center justify-center shadow-inner shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0 flex-1 overflow-hidden">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 truncate">{title}</p>
      <p className="text-2xl sm:text-3xl font-black tracking-tighter">{value}</p>
    </div>
  </div>
);

export default Dashboard;
