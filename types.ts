
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
  responsible: string; // Nombre del responsable (para mostrar)
  responsibleId?: number; // ID del responsable (para enviar al backend)
  responsibleUser?: {
    id: number;
    name: string;
    email: string;
    username: string;
    avatar?: string;
  };
  project: string; // Nombre del proyecto (para mostrar)
  project_id?: string; // ID del proyecto (para enviar al backend)
  observations: string;
  status: TaskStatus;
  createdAt: number;
  startDate?: number;
  endDate?: number;
  attachments: Attachment[];
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}
