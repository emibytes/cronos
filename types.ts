
export type TaskStatus = 'pendiente' | 'en_proceso' | 'completada';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data?: string; // Base64 representation for persistence
}

export interface Task {
  id: string;
  title: string;
  responsible: string;
  project: string;
  observations: string;
  status: TaskStatus;
  createdAt: number;
  attachments: Attachment[];
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}
