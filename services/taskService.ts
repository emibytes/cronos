import { Task, TaskStatus } from "../types";
import {
  apiService,
  isLocalMode,
  isProductionMode,
  getApiConfig,
} from "./apiService";

// CLAVES ESTABLES - NO CAMBIAR PARA PRESERVAR DATOS
const STORAGE_KEY = "emibytes_task_storage_v1";
const RESP_STORAGE_KEY = "emibytes_responsible_storage_v1";
const PROJECT_STORAGE_KEY = "emibytes_project_storage_v1";

const DEFAULT_RESPONSIBLES = ["Eminson Mendoza", "Jessica Ahumada Rios"];
const DEFAULT_PROJECTS = ["General", "Desarrollo", "Marketing"];

// Interfaz de tarea según la API de Laravel
interface ApiTask {
  id: string;
  title: string;
  responsible: string;
  project: string;
  observations: string;
  status: "pendiente" | "en_proceso" | "completada";
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
}

// Interfaz de respuesta paginada de tareas (nueva estructura ApiResponse)
interface TasksResponse {
  tasks: ApiTask[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

// Interfaz de respuesta de una sola tarea
interface SingleTaskResponse {
  task: ApiTask;
}

// Helper para parsear fechas del backend sin problemas de zona horaria
const parseBackendDate = (
  dateString: string | null | undefined
): number | undefined => {
  if (!dateString) return undefined;

  // Si es solo fecha (YYYY-MM-DD), parsearlo como fecha local
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day).getTime();
  }

  // Si tiene hora, parsearlo normalmente
  return new Date(dateString).getTime();
};

// Convertir de API a modelo local
const apiTaskToTask = (apiTask: any): Task => ({
  id: apiTask.id,
  title: apiTask.title,
  responsible: apiTask.responsible,
  responsibleId: apiTask.responsibleId || apiTask.responsible_id,
  responsibleUser: apiTask.responsibleUser,
  project: apiTask.project,
  observations: apiTask.observations,
  status: apiTask.status,
  createdAt: apiTask.createdAt || parseBackendDate(apiTask.created_at),
  startDate: apiTask.startDate || parseBackendDate(apiTask.start_date),
  endDate: apiTask.endDate || parseBackendDate(apiTask.end_date),
  attachments: apiTask.attachments || [],
});

// Convertir de modelo local a API
const taskToApiTask = (task: Partial<Task>): any => {
  const apiTask: any = {};

  if (task.title) apiTask.title = task.title;
  if (task.responsibleId !== undefined)
    apiTask.responsible_id = task.responsibleId;
  
  // Aceptar tanto projectId (camelCase) como project_id (snake_case)
  const projectIdValue = (task as any).projectId ?? (task as any).project_id;
  if (projectIdValue !== undefined) apiTask.project_id = projectIdValue;
  
  if (task.observations !== undefined) apiTask.observations = task.observations;
  if (task.status) apiTask.status = task.status;
  
  // Convertir timestamp a YYYY-MM-DD sin problemas de zona horaria
  if (task.startDate) {
    const d = new Date(task.startDate);
    apiTask.start_date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  if (task.endDate) {
    const d = new Date(task.endDate);
    apiTask.end_date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  return apiTask;
};

const generateId = () => {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    window.crypto.randomUUID
  ) {
    return window.crypto.randomUUID();
  }
  return (
    "task-" +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36)
  );
};

// ============= MODO LOCAL (localStorage) =============
const localService = {
  getTasks: (): Task[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];

      const migrated = parsed.map((task) => ({
        ...task,
        project: task.project || "General",
      }));

      if (migrated.some((t, i) => !parsed[i].project)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      }

      return migrated;
    } catch (error) {
      console.error("Error al cargar tareas de localStorage:", error);
      return [];
    }
  },

  saveTasks: (tasks: Task[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Error al guardar tareas:", error);
    }
  },

  addTask: (taskData: Omit<Task, "id" | "createdAt" | "status">): Task => {
    const currentTasks = localService.getTasks();
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: Date.now(),
      status: "pendiente",
    };
    const updatedTasks = [newTask, ...currentTasks];
    localService.saveTasks(updatedTasks);
    return newTask;
  },

  updateTask: (taskId: string, updates: Partial<Task>): Task[] => {
    const currentTasks = localService.getTasks();
    const updated = currentTasks.map((t) =>
      t.id === taskId ? { ...t, ...updates } : t
    );
    localService.saveTasks(updated);
    return updated;
  },

  deleteTask: (taskId: string): Task[] => {
    const currentTasks = localService.getTasks();
    const filtered = currentTasks.filter(
      (t) => String(t.id) !== String(taskId)
    );
    localService.saveTasks(filtered);
    return filtered;
  },
};

// ============= MODO PRODUCCIÓN (API REST) =============
const apiTaskService = {
  getTasks: async (): Promise<Task[]> => {
    try {
      const config = getApiConfig();
      const response = await apiService.getList<TasksResponse>(
        config.tasksEndpoint
      );

      if (response.success && response.data && response.data.tasks) {
        // response.data.tasks es el array de tareas con la nueva estructura ApiResponse
        const tasksArray = response.data.tasks;
        return tasksArray.map(apiTaskToTask);
      }

      return [];
    } catch (error) {
      console.error("Error al obtener tareas de API:", error);
      return [];
    }
  },

  addTask: async (
    taskData: Omit<Task, "id" | "createdAt" | "status">
  ): Promise<Task> => {
    try {
      const config = getApiConfig();
      const apiData = taskToApiTask({ ...taskData, status: "pendiente" });

      const response = await apiService.create<SingleTaskResponse>(
        config.tasksEndpoint,
        apiData
      );

      if (response.success && response.data && response.data.task) {
        return apiTaskToTask(response.data.task);
      }

      throw new Error("Error al crear tarea");
    } catch (error) {
      console.error("Error al crear tarea en API:", error);
      throw error;
    }
  },

  updateTask: async (
    taskId: string,
    updates: Partial<Task>
  ): Promise<Task[]> => {
    try {
      const config = getApiConfig();
      const apiData = taskToApiTask(updates);

      await apiService.update<SingleTaskResponse>(
        config.tasksEndpoint,
        taskId,
        apiData
      );
      return await apiTaskService.getTasks();
    } catch (error) {
      console.error("Error al actualizar tarea en API:", error);
      throw error;
    }
  },

  deleteTask: async (taskId: string): Promise<Task[]> => {
    try {
      const config = getApiConfig();
      await apiService.delete(config.tasksEndpoint, taskId);
      return await apiTaskService.getTasks();
    } catch (error) {
      console.error("Error al eliminar tarea en API:", error);
      throw error;
    }
  },
};

// ============= SERVICIO UNIFICADO =============
export const taskService = {
  getTasks: (): Task[] | Promise<Task[]> => {
    console.log("📋 getTasks - Modo:", isLocalMode() ? "LOCAL" : "API");
    if (isLocalMode()) {
      return localService.getTasks();
    } else {
      return apiTaskService.getTasks();
    }
  },

  addTask: (
    taskData: Omit<Task, "id" | "createdAt" | "status">
  ): Task | Promise<Task> => {
    taskService.addResponsible(taskData.responsible);
    taskService.addProject(taskData.project);

    if (isLocalMode()) {
      return localService.addTask(taskData);
    } else {
      return apiTaskService.addTask(taskData);
    }
  },

  updateTask: (
    taskId: string,
    updates: Partial<Task>
  ): Task[] | Promise<Task[]> => {
    if (isLocalMode()) {
      return localService.updateTask(taskId, updates);
    } else {
      return apiTaskService.updateTask(taskId, updates);
    }
  },

  updateTaskStatus: (
    taskId: string,
    status: TaskStatus
  ): Task[] | Promise<Task[]> => {
    return taskService.updateTask(taskId, { status });
  },

  deleteTask: (taskId: string): Task[] | Promise<Task[]> => {
    if (isLocalMode()) {
      return localService.deleteTask(taskId);
    } else {
      return apiTaskService.deleteTask(taskId);
    }
  },

  saveTasks: (tasks: Task[]): void => {
    if (isLocalMode()) {
      localService.saveTasks(tasks);
    }
  },

  getResponsibles: (): string[] => {
    try {
      const stored = localStorage.getItem(RESP_STORAGE_KEY);
      if (!stored) return DEFAULT_RESPONSIBLES;
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : DEFAULT_RESPONSIBLES;
    } catch (error) {
      return DEFAULT_RESPONSIBLES;
    }
  },

  addResponsible: (name: string): void => {
    if (!name || !name.trim()) return;
    const trimmedName = name.trim();
    const current = taskService.getResponsibles();
    if (!current.some((r) => r.toLowerCase() === trimmedName.toLowerCase())) {
      const updated = [...current, trimmedName].sort();
      localStorage.setItem(RESP_STORAGE_KEY, JSON.stringify(updated));
    }
  },

  getProjects: (): string[] => {
    try {
      const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
      if (!stored) return DEFAULT_PROJECTS;
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : DEFAULT_PROJECTS;
    } catch (error) {
      return DEFAULT_PROJECTS;
    }
  },

  addProject: (name: string): void => {
    if (!name || !name.trim()) return;
    const trimmedName = name.trim();
    const current = taskService.getProjects();
    if (!current.some((p) => p.toLowerCase() === trimmedName.toLowerCase())) {
      const updated = [...current, trimmedName].sort();
      localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(updated));
    }
  },
};

export { isLocalMode, isProductionMode };
