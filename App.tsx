
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Plus, LayoutDashboard, ListTodo, Search, Kanban, CalendarDays, LogOut, FolderKanban, Shield, Users, ChevronDown, Settings, Menu, X } from 'lucide-react';
import Swal from 'sweetalert2';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import TaskBoard from './components/TaskBoard';
import Calendar from './components/Calendar';
import TaskForm from './components/TaskForm';
import TaskDetail from './components/TaskDetail';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';
import RoleManagement from './components/RoleManagement';
import UserManagement from './components/UserManagement';
import MenuManagement from './components/MenuManagement';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import ThemeToggle from './components/ThemeToggle';
import { Task, TaskStatus } from './types';
import { taskService } from './services/taskService';
import { authService } from './services/authService';
import { Project } from './services/projectService';

const MainApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = cargando
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectListKey, setProjectListKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  console.log('🚀 MainApp montado - pathname:', location.pathname, 'isAuth:', isAuthenticated);

  // Determinar vista actual desde la ruta
  const view = location.pathname === '/board' ? 'board'
    : location.pathname === '/calendar' ? 'calendar'
      : location.pathname === '/tasks' ? 'tasks'
        : location.pathname === '/projects' ? 'projects'
          : location.pathname === '/roles' ? 'roles'
            : location.pathname === '/users' ? 'users'
              : location.pathname === '/menus' ? 'menus'
              : 'dashboard';

  useEffect(() => {
    // Verificar autenticación cada vez que cambia la ubicación
    const authenticated = authService.isAuthenticated();
    console.log('🔍 MainApp - Verificando autenticación:', {
      authenticated,
      pathname: location.pathname,
      token: authService.getToken()?.substring(0, 20) + '...',
      user: authService.getCurrentUser()
    });
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
  }, [location.pathname]); // Verificar cada vez que cambia la ruta

  const handleAddTask = useCallback(async (taskData:  {
    title: string;
    responsible: string;
    responsibleId?: number;
    project: string;
    project_id?: string;
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
        // Buscar la tarea actualizada en el array para obtener todos los campos actualizados
        const updatedTask = updatedTasks.find(t => t.id === id);
        if (updatedTask) {
          setSelectedTask(updatedTask);
        }
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

  // Mostrar loading mientras se verifica autenticación
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emibytes-background dark:bg-emibytes-dark-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emibytes-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.project && t.project.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-emibytes-background dark:bg-emibytes-dark-bg transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex w-64 bg-white dark:bg-emibytes-dark-card border-r border-gray-100 dark:border-gray-800 flex-col fixed inset-y-0 z-20 shadow-xl transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 pb-3 flex justify-center items-center min-h-[80px] flex-shrink-0">
          <img
            src="/logo-dark.png"
            alt="emibytes logo"
            className="h-12 w-auto object-contain block hover:scale-105 transition-transform"
            style={{ minWidth: '140px' }}
          />
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto overflow-x-hidden sidebar-nav">
          <NavItem
            active={view === 'dashboard'}
            onClick={() => navigate('/dashboard')}
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
          />
          <NavItem
            active={view === 'board'}
            onClick={() => navigate('/board')}
            icon={<Kanban size={20} />}
            label="Tablero"
          />
          <NavItem
            active={view === 'calendar'}
            onClick={() => navigate('/calendar')}
            icon={<CalendarDays size={20} />}
            label="Calendario"
          />
          <NavItem
            active={view === 'tasks'}
            onClick={() => navigate('/tasks')}
            icon={<ListTodo size={20} />}
            label="Mis Tareas"
          />
          
          {/* Menú desplegable de Herramientas */}
          <div className="space-y-1">
            <button
              onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black transition-all uppercase text-[10px] tracking-[0.15em] ${
                ['projects', 'roles', 'users'].includes(view)
                  ? 'bg-emibytes-primary text-white shadow-xl shadow-emibytes-primary/30'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-emibytes-secondary dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-4">
                <Settings size={20} />
                <span>Herramientas</span>
              </div>
              <ChevronDown
                size={16}
                className={`transform transition-transform duration-200 ${
                  toolsMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {toolsMenuOpen && (
              <div className="ml-4 space-y-1 mt-1">
                <SubNavItem
                  active={view === 'projects'}
                  onClick={() => navigate('/projects')}
                  icon={<FolderKanban size={18} />}
                  label="Proyectos"
                />
                <SubNavItem
                  active={view === 'roles'}
                  onClick={() => navigate('/roles')}
                  icon={<Shield size={18} />}
                  label="Roles"
                />
                <SubNavItem
                  active={view === 'users'}
                  onClick={() => navigate('/users')}
                  icon={<Users size={18} />}
                  label="Usuarios"
                />
                <SubNavItem
                  active={view === 'menus'}
                  onClick={() => navigate('/menus')}
                  icon={<Settings size={18} />}
                  label="Menús"
                />
              </div>
            )}
          </div>
        </nav>

        <div className="p-3 space-y-2 flex-shrink-0 border-t border-gray-100 dark:border-gray-800">
          {/* Info de usuario */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emibytes-primary rounded-full flex items-center justify-center text-white font-black text-xs">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{currentUser?.name || 'Usuario'}</p>
                <p className="text-[9px] text-gray-400 truncate">{currentUser?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-bold text-[10px] uppercase hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <LogOut size={12} />
              Cerrar Sesión
            </button>
          </div>

          <div className="hidden xl:flex bg-emibytes-primary/5 dark:bg-emibytes-primary/10 p-2 rounded-xl border border-emibytes-primary/10 flex-col items-center">
            <img src="/logo.png" className="w-8 h-8 mb-1 opacity-80" alt="emibytes circular" />
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Enterprise Edition</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-4 md:p-10 pb-24 md:pb-10 max-w-full overflow-x-hidden transition-all duration-300 ${
        isSidebarOpen ? 'md:ml-64' : 'md:ml-0'
      }`}>
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 max-w-full">
          <div className="flex items-center gap-5">
            {/* Botón Toggle Sidebar */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex items-center justify-center w-10 h-10 bg-white dark:bg-emibytes-dark-card rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 hover:bg-emibytes-primary/10 dark:hover:bg-emibytes-primary/20 transition-all hover:scale-105 active:scale-95"
              title={isSidebarOpen ? 'Ocultar sidebar' : 'Mostrar sidebar'}
            >
              {isSidebarOpen ? (
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu size={20} className="text-gray-600 dark:text-gray-400" />
              )}
            </button>
            
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
            {view !== 'projects' && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-6 py-3 bg-emibytes-primary text-white rounded-2xl font-black shadow-lg shadow-emibytes-primary/30 hover:scale-[1.03] active:scale-95 transition-all flex items-center space-x-2 uppercase text-xs tracking-widest"
              >
                <Plus size={18} strokeWidth={3} />
                <span className="hidden sm:inline">Nueva Tarea</span>
              </button>
            )}
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-top-4 duration-700 max-w-full overflow-x-hidden">
          {view === 'dashboard' ? (
            <Dashboard
              tasks={filteredTasks}
              allTasksCount={tasks.length}
              onTaskClick={(task) => setSelectedTask(task)}
            />
          ) : view === 'projects' ? (
            <ProjectList
              key={projectListKey}
              onEdit={(project) => {
                setSelectedProject(project);
                setIsProjectFormOpen(true);
              }}
              onAdd={() => {
                setSelectedProject(null);
                setIsProjectFormOpen(true);
              }}
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
          ) : view === 'roles' ? (
            <RoleManagement />
          ) : view === 'users' ? (
            <UserManagement />
          ) : view === 'menus' ? (
            <MenuManagement />
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-24 flex items-center justify-center pointer-events-none z-[80]">
        <div className="bg-white/95 dark:bg-emibytes-dark-card/95 backdrop-blur-xl px-6 py-4 rounded-full border border-gray-100 dark:border-gray-800 shadow-2xl flex items-center space-x-6 pointer-events-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className={`transition-all active:scale-90 ${view === 'dashboard' ? 'text-emibytes-primary' : 'text-gray-400'}`}
          >
            <LayoutDashboard size={24} />
          </button>

          <button
            onClick={() => navigate('/projects')}
            className={`transition-all active:scale-90 ${view === 'projects' ? 'text-emibytes-primary' : 'text-gray-400'}`}
          >
            <FolderKanban size={24} />
          </button>

          <button
            onClick={() => navigate('/board')}
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
            onClick={() => navigate('/calendar')}
            className={`transition-all active:scale-90 ${view === 'calendar' ? 'text-emibytes-primary' : 'text-gray-400'}`}
          >
            <CalendarDays size={24} />
          </button>

          <button
            onClick={() => navigate('/tasks')}
            className={`transition-all active:scale-90 ${view === 'tasks' ? 'text-emibytes-primary' : 'text-gray-400'}`}
          >
            <ListTodo size={24} />
          </button>
        </div>
      </div>

      {isFormOpen && (
        <TaskForm onClose={() => setIsFormOpen(false)} onSubmit={handleAddTask} />
      )}

      {isProjectFormOpen && (
        <ProjectForm
          project={selectedProject || undefined}
          onClose={() => {
            setIsProjectFormOpen(false);
            setSelectedProject(null);
          }}
          onSuccess={() => {
            // Forzar recarga de ProjectList
            setProjectListKey(prev => prev + 1);
          }}
        />
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

const SubNavItem = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all text-[10px] tracking-[0.1em] uppercase ${
      active
        ? 'bg-emibytes-primary/10 text-emibytes-primary dark:bg-emibytes-primary/20'
        : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-gray-600 dark:hover:text-gray-300'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Componente separado para la página de Login
const LoginPage: React.FC = () => {
  const isAuth = authService.isAuthenticated();
  console.log('👤 LoginPage - isAuthenticated:', isAuth);

  const handleLoginSuccess = () => {
    console.log('✅ Login exitoso, redirigiendo...');
    // Usar replace para evitar que quede en el historial
    window.location.replace('/dashboard');
  };

  if (isAuth) {
    console.log('🔄 Usuario autenticado, navegando a dashboard...');
    return <Navigate to="/dashboard" replace />;
  }

  return <Login onLoginSuccess={handleLoginSuccess} />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<MainApp />} />
        <Route path="/dashboard" element={<MainApp />} />
        <Route path="/projects" element={<MainApp />} />
        <Route path="/board" element={<MainApp />} />
        <Route path="/calendar" element={<MainApp />} />
        <Route path="/tasks" element={<MainApp />} />
        <Route path="/roles" element={<MainApp />} />
        <Route path="/users" element={<MainApp />} />
        <Route path="/menus" element={<MainApp />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
