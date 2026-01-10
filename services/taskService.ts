
import { Task, TaskStatus } from '../types';

// CLAVES ESTABLES - NO CAMBIAR PARA PRESERVAR DATOS
const STORAGE_KEY = 'emibytes_task_storage_v1';
const RESP_STORAGE_KEY = 'emibytes_responsible_storage_v1';

const DEFAULT_RESPONSIBLES = ["Eminson Mendoza", "Jessica Ahumada Rios"];

const generateId = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'task-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

export const taskService = {
  // --- Tareas ---
  getTasks: (): Task[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error al cargar tareas de localStorage:', error);
      return [];
    }
  },

  saveTasks: (tasks: Task[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error al guardar tareas:', error);
    }
  },

  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>): Task => {
    const currentTasks = taskService.getTasks();
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: Date.now(),
      status: 'pendiente',
    };
    const updatedTasks = [newTask, ...currentTasks];
    taskService.saveTasks(updatedTasks);
    taskService.addResponsible(taskData.responsible);
    return newTask;
  },

  updateTask: (taskId: string, updates: Partial<Task>): Task[] => {
    const currentTasks = taskService.getTasks();
    const updated = currentTasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    taskService.saveTasks(updated);
    return updated;
  },

  updateTaskStatus: (taskId: string, status: TaskStatus): Task[] => {
    return taskService.updateTask(taskId, { status });
  },

  deleteTask: (taskId: string): Task[] => {
    const currentTasks = taskService.getTasks();
    const filtered = currentTasks.filter(t => String(t.id) !== String(taskId));
    taskService.saveTasks(filtered);
    return filtered;
  },

  // --- Responsables ---
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
    if (!current.some(r => r.toLowerCase() === trimmedName.toLowerCase())) {
      const updated = [...current, trimmedName].sort();
      localStorage.setItem(RESP_STORAGE_KEY, JSON.stringify(updated));
    }
  }
};
