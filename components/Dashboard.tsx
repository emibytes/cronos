
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Task } from '../types';
import { CheckCircle, Clock, ListTodo, Search, ArrowRight } from 'lucide-react';
import { StatusBadge } from './TaskList';

interface DashboardProps {
  tasks: Task[];
  allTasksCount: number;
  onTaskClick: (task: Task) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, allTasksCount, onTaskClick }) => {
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
    <div className="space-y-10">
      {/* Header Info */}
      {isFiltered && (
        <div className="bg-emibytes-primary/10 border border-emibytes-primary/20 p-5 rounded-3xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4 text-emibytes-primary">
            <Search size={24} />
            <span className="font-bold">Resultados filtrados: {tasks.length} de {allTasksCount} tareas encontradas.</span>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total" value={stats.total} icon={<ListTodo size={24} />} color="bg-gray-100 dark:bg-gray-800" />
        <StatCard title="Pendientes" value={stats.pending} icon={<Clock size={24} />} color="bg-amber-100 dark:bg-amber-900/20 text-amber-600" />
        <StatCard title="En Proceso" value={stats.inProgress} icon={<Clock size={24} />} color="bg-blue-100 dark:bg-blue-900/20 text-blue-600" />
        <StatCard title="Completadas" value={stats.completed} icon={<CheckCircle size={24} />} color="bg-green-100 dark:bg-green-900/20 text-emibytes-primary" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-emibytes-dark-card p-8 rounded-[32px] shadow-lg border border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3">
            <div className="w-2 h-8 bg-emibytes-primary rounded-full"></div>
            Estado de Operaciones
          </h3>
          <div className="h-72">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
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
                  <Legend verticalAlign="bottom" height={36} iconType="circle"/>
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

        <div className="bg-white dark:bg-emibytes-dark-card p-8 rounded-[32px] shadow-lg border border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3">
             <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
            Productividad por Equipo
          </h3>
          <div className="h-72">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#888888" 
                    fontSize={12} 
                    fontWeight="bold"
                    tickLine={false} 
                    axisLine={false}
                    width={90}
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
      <div className="bg-white dark:bg-emibytes-dark-card rounded-[32px] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
          <h3 className="text-xl font-black">Explorador de Flujo</h3>
          <span className="text-xs font-black bg-emibytes-primary/10 text-emibytes-primary px-4 py-1.5 rounded-full uppercase tracking-widest">{tasks.length} Entradas</span>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {tasks.slice(0, 6).map((task) => (
            <div 
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="p-6 hover:bg-emibytes-primary/[0.02] dark:hover:bg-emibytes-primary/10 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-6 min-w-0">
                <div className={`w-3 h-12 rounded-full ${
                  task.status === 'completada' ? 'bg-emibytes-primary shadow-lg shadow-emibytes-primary/20' : 
                  task.status === 'en_proceso' ? 'bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-amber-500 shadow-lg shadow-amber-500/20'
                }`}></div>
                <div className="min-w-0">
                  <h4 className="font-black text-lg truncate group-hover:text-emibytes-primary transition-colors tracking-tight">{task.title}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <StatusBadge status={task.status} />
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">@{task.responsible}</span>
                  </div>
                </div>
              </div>
              <ArrowRight size={24} className="text-gray-200 group-hover:text-emibytes-primary group-hover:translate-x-2 transition-all" />
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
  <div className="relative bg-white dark:bg-emibytes-dark-card p-6 rounded-[32px] shadow-lg border border-gray-100 dark:border-gray-800 flex items-center space-x-5 hover:shadow-2xl transition-all group overflow-hidden">
    {/* Watermark Logo */}
    <img src="input_file_2.png" className="absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] group-hover:scale-125 transition-transform" alt="" />
    
    <div className={`p-4 rounded-2xl ${color} flex items-center justify-center shadow-inner`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <p className="text-3xl font-black tracking-tighter">{value}</p>
    </div>
  </div>
);

export default Dashboard;
