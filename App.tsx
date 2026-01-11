
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Plus, LayoutDashboard, ListTodo, Search, Kanban, CalendarDays, LogOut } from 'lucide-react';
import Swal from 'sweetalert2';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import TaskBoard from './components/TaskBoard';
import Calendar from './components/Calendar';
import TaskForm from './components/TaskForm';
import TaskDetail from './components/TaskDetail';
import Login from './components/Login';
import ThemeToggle from './components/ThemeToggle';
import { Task, TaskStatus } from './types';
import { taskService } from './services/taskService';
import { authService } from './services/authService';

const MainApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Determinar vista actual desde la ruta
  const view = location.pathname === '/tablero' ? 'board'
    : location.pathname === '/calendario' ? 'calendar'
      : location.pathname === '/tareas' ? 'tasks'
        : 'dashboard';

  useEffect(() => {
    // Verificar autenticación
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      const user = authService.getCurrentUser();
      setCurrentUser(user);

      // Cargar tareas (soporta async y sync)
      const loadTasks = async () => {
        const loadedTasks = await Promise.resolve(taskService.getTasks());
        setTasks(loadedTasks);
      };
      loadTasks();
    }

    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const handleAddTask = useCallback(async (taskData: {
    title: string;
    responsible: string;
    project: string;
    observations: string;
    attachments: any[];
    startDate?: number;
    endDate?: number
  }) => {
    try {
      await Promise.resolve(taskService.addTask(taskData));
      const updatedTasks = await Promise.resolve(taskService.getTasks());
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error al crear tarea:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo crear la tarea',
        icon: 'error',
        confirmButtonColor: '#138b52',
      });
    }
  }, []);

  const handleUpdateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTasks = await Promise.resolve(taskService.updateTask(id, updates));
      setTasks(updatedTasks);
      if (selectedTask && selectedTask.id === id) {
        setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
      }

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Tarea actualizada',
        showConfirmButton: false,
        timer: 2000,
        background: isDark ? '#2d2d2d' : '#ffffff',
        color: isDark ? '#ffffff' : '#333333',
      });
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar la tarea',
        icon: 'error',
        confirmButtonColor: '#138b52',
      });
    }
  }, [selectedTask, isDark]);

  const handleDeleteTask = useCallback(async (id: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#138b52',
      cancelButtonColor: '#333333',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: isDark ? '#2d2d2d' : '#ffffff',
      color: isDark ? '#ffffff' : '#333333',
      iconColor: '#138b52'
    });

    if (result.isConfirmed) {
      try {
        const updatedTasks = await Promise.resolve(taskService.deleteTask(id));
        setTasks(updatedTasks);
        if (selectedTask?.id === id) setSelectedTask(null);

        Swal.fire({
          title: '¡Eliminado!',
          icon: 'success',
          confirmButtonColor: '#138b52',
          background: isDark ? '#2d2d2d' : '#ffffff',
          color: isDark ? '#ffffff' : '#333333',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la tarea',
          icon: 'error',
          confirmButtonColor: '#138b52',
        });
      }
    }
  }, [selectedTask, isDark]);

  const handleLoginSuccess = async () => {
    setIsAuthenticated(true);
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    const loadedTasks = await Promise.resolve(taskService.getTasks());
    setTasks(loadedTasks);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Se cerrará tu sesión actual',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#138b52',
      cancelButtonColor: '#333333',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      background: isDark ? '#2d2d2d' : '#ffffff',
      color: isDark ? '#ffffff' : '#333333',
    });

    if (result.isConfirmed) {
      await authService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setTasks([]);
      setSelectedTask(null);
      setIsFormOpen(false);
    }
  };

  // Si no está autenticado, mostrar Login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.project && t.project.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-emibytes-background dark:bg-emibytes-dark-bg transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-emibytes-dark-card border-r border-gray-100 dark:border-gray-800 flex-col fixed inset-y-0 z-20 shadow-xl">
        <div className="p-8 pb-6 flex justify-center items-center min-h-[120px]">
          <img
            src="/logo-dark.png"
            alt="emibytes logo"
            className="h-16 w-auto object-contain block hover:scale-105 transition-transform"
            style={{ minWidth: '160px' }}
          />
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          <NavItem
            active={view === 'dashboard'}
            onClick={() => navigate('/dashboard')}
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
          />
          <NavItem
            active={view === 'board'}
            onClick={() => navigate('/tablero')}
            icon={<Kanban size={20} />}
            label="Tablero"
          />
          <NavItem
            active={view === 'calendar'}
            onClick={() => navigate('/calendario')}
            icon={<CalendarDays size={20} />}
            label="Calendario"
          />
          <NavItem
            active={view === 'tasks'}
            onClick={() => navigate('/tareas')}
            icon={<ListTodo size={20} />}
            label="Mis Tareas"
          />
        </nav>

        <div className="p-6 mt-auto space-y-4">
          {/* Info de usuario */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emibytes-primary rounded-full flex items-center justify-center text-white font-black text-sm">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{currentUser?.name || 'Usuario'}</p>
                <p className="text-[10px] text-gray-400 truncate">{currentUser?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold text-xs uppercase hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <LogOut size={14} />
              Cerrar Sesión
            </button>
          </div>

          <div className="bg-emibytes-primary/5 dark:bg-emibytes-primary/10 p-4 rounded-2xl border border-emibytes-primary/10 flex flex-col items-center">
            <img src="/logo.png" className="w-10 h-10 mb-2 opacity-80" alt="emibytes circular" />
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Enterprise Edition</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-10 pb-24 lg:pb-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="bg-white dark:bg-emibytes-dark-card p-2 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 hover:rotate-3 transition-all duration-500">
              <img
                src="/logo.png"
                alt="emibytes logo mark"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-black text-emibytes-secondary dark:text-white tracking-tight">Cronos</h1>
              <p className="text-gray-500 font-medium text-sm">El arte de dominar el tiempo</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-emibytes-dark-card rounded-2xl border-none focus:ring-2 focus:ring-emibytes-primary transition-all shadow-md outline-none font-medium"
              />
            </div>
            <ThemeToggle />
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-3 bg-emibytes-primary text-white rounded-2xl font-black shadow-lg shadow-emibytes-primary/30 hover:scale-[1.03] active:scale-95 transition-all flex items-center space-x-2 uppercase text-xs tracking-widest"
            >
              <Plus size={18} strokeWidth={3} />
              <span className="hidden sm:inline">Nueva Tarea</span>
            </button>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          {view === 'dashboard' ? (
            <Dashboard
              tasks={filteredTasks}
              allTasksCount={tasks.length}
              onTaskClick={(task) => setSelectedTask(task)}
            />
          ) : view === 'board' ? (
            <TaskBoard
              tasks={filteredTasks}
              onTaskClick={(task) => setSelectedTask(task)}
              onUpdateTaskStatus={(taskId, newStatus) => {
                handleUpdateTask(taskId, { status: newStatus });
              }}
            />
          ) : view === 'calendar' ? (
            <Calendar
              tasks={filteredTasks}
              onTaskClick={(task) => setSelectedTask(task)}
            />
          ) : (
            <TaskList
              tasks={filteredTasks}
              onDelete={handleDeleteTask}
              onTaskClick={(task) => setSelectedTask(task)}
            />
          )}
        </div>
      </main>

      {/* Navegación Móvil */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-24 flex items-center justify-center pointer-events-none z-[80]">
        <div className="bg-white/95 dark:bg-emibytes-dark-card/95 backdrop-blur-xl px-6 py-4 rounded-full border border-gray-100 dark:border-gray-800 shadow-2xl flex items-center space-x-6 pointer-events-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className={`transition-all active:scale-90 ${view === 'dashboard' ? 'text-emibytes-primary' : 'text-gray-400'}`}
          >
            <LayoutDashboard size={24} />
          </button>

          <button
            onClick={() => navigate('/tablero')}
            className={`transition-all active:scale-90 ${view === 'board' ? 'text-emibytes-primary' : 'text-gray-400'}`}
          >
            <Kanban size={24} />
          </button>

          <button
            onClick={() => setIsFormOpen(true)}
            className="w-16 h-16 bg-white dark:bg-white rounded-full shadow-2xl flex items-center justify-center border-[4px] border-emibytes-primary active:scale-90 transition-all z-[90] -mt-10"
          >
            {!logoError ? (
              <img
                src="logo.png"
                className="w-10 h-10 object-contain"
                alt="Add"
                onError={() => setLogoError(true)}
              />
            ) : (
              <Plus size={32} className="text-emibytes-primary" strokeWidth={3} />
            )}
          </button>

          <button
            onClick={() => navigate('/calendario')}
            className={`transition-all active:scale-90 ${view === 'calendar' ? 'text-emibytes-primary' : 'text-gray-400'}`}
          >
            <CalendarDays size={24} />
          </button>

          <button
            onClick={() => navigate('/tareas')}
            className={`transition-all active:scale-90 ${view === 'tasks' ? 'text-emibytes-primary' : 'text-gray-400'}`}
          >
            <ListTodo size={24} />
          </button>
        </div>
      </div>

      {isFormOpen && (
        <TaskForm onClose={() => setIsFormOpen(false)} onSubmit={handleAddTask} />
      )}

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-black transition-all uppercase text-[10px] tracking-[0.15em] ${active
      ? 'bg-emibytes-primary text-white shadow-xl shadow-emibytes-primary/30 scale-[1.02]'
      : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-emibytes-secondary dark:hover:text-white'
      }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<MainApp />} />
        <Route path="/tablero" element={<MainApp />} />
        <Route path="/calendario" element={<MainApp />} />
        <Route path="/tareas" element={<MainApp />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
