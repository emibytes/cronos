
import React, { useState } from 'react';
// Added ClipboardList to imports
import { X, User, Calendar, Save, Trash2, CheckCircle2, ClipboardList, FolderOpen } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Task, TaskStatus } from '../types';
import { StatusBadge } from './TaskList';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
};

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempObservations, setTempObservations] = useState(task.observations);
  const [tempStatus, setTempStatus] = useState<TaskStatus>(task.status);
  const [logoError, setLogoError] = useState(false);

  const handleSave = () => {
    onUpdate(task.id, { 
      observations: tempObservations,
      status: tempStatus
    });
    setIsEditing(false);
  };

  const isChanged = tempObservations !== task.observations || tempStatus !== task.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-emibytes-dark-card w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 h-[90vh] md:h-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 md:border-r border-gray-100 dark:border-gray-800">
          {/* Header */}
          <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-start bg-gray-50/50 dark:bg-white/5 shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-gray-400 font-bold mb-2">
                {!logoError ? (
                  <img 
                    src="/logo.png" 
                    alt="emibytes" 
                    onError={() => setLogoError(true)}
                    className="w-5 h-5 object-contain opacity-60" 
                  />
                ) : (
                  <CheckCircle2 size={16} className="text-emibytes-primary opacity-60" />
                )}
                <span>TASK-{task.id.slice(-4).toUpperCase()}</span>
              </div>
              <h2 className="text-2xl font-black text-emibytes-secondary dark:text-white leading-tight">
                {task.title}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Observaciones */}
            <section className="space-y-3">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Observaciones de Trabajo</h3>
              <div className="rich-text-container">
                <ReactQuill 
                  theme="snow"
                  value={tempObservations}
                  onChange={(val) => {
                    setTempObservations(val);
                    setIsEditing(true);
                  }}
                  modules={modules}
                  placeholder="Añade detalles sobre el progreso..."
                />
              </div>
            </section>

            {/* Estado y Propiedades - solo visible en mobile */}
            <div className="md:hidden space-y-6">
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Estado Actual</h3>
                <div className="space-y-2">
                  <select
                    value={tempStatus}
                    onChange={(e) => {
                      setTempStatus(e.target.value as TaskStatus);
                      setIsEditing(true);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-emibytes-dark-card border border-gray-200 dark:border-gray-700 font-black text-xs shadow-sm focus:ring-2 focus:ring-emibytes-primary outline-none appearance-none cursor-pointer uppercase"
                  >
                    <option value="pendiente">⏳ Pendiente</option>
                    <option value="en_proceso">🚀 En Proceso</option>
                    <option value="completada">✅ Completada</option>
                  </select>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Propiedades</h3>
                
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emibytes-primary rounded-xl flex items-center justify-center text-white shadow-md">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-black uppercase">Responsable</p>
                      <p className="text-sm font-bold">{task.responsible}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-md">
                      <FolderOpen size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-black uppercase">Proyecto</p>
                      <p className="text-sm font-bold">{task.project}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-500">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-black uppercase">Fecha</p>
                      <p className="text-sm font-bold">{new Date(task.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-black/10 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
             <button 
              onClick={() => onDelete(task.id)}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-bold px-4 py-2 rounded-xl transition-colors w-full sm:w-auto justify-center"
            >
              <Trash2 size={16} />
              ELIMINAR TAREA
            </button>
            <div className="flex gap-3 w-full sm:w-auto">
              {(isEditing || isChanged) && (
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emibytes-primary text-white rounded-xl font-black shadow-lg shadow-emibytes-primary/20 hover:scale-[1.02] transition-all uppercase text-sm w-full sm:w-auto justify-center"
                >
                  <Save size={18} />
                  Guardar Cambios
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - solo visible en desktop */}
        <div className="hidden md:flex md:w-72 bg-gray-50 dark:bg-black/20 p-6 space-y-8 overflow-y-auto flex-col">
          <section className="space-y-4 text-center pb-4">
             {!logoError ? (
               <img src="/logo.png" alt="Brand" className="w-16 h-16 mx-auto opacity-50 grayscale hover:grayscale-0 transition-all cursor-help" title="emibytes Task Engine" />
             ) : (
               <div className="w-16 h-16 mx-auto bg-emibytes-primary/10 rounded-full flex items-center justify-center text-emibytes-primary">
                 <ClipboardList size={32} />
               </div>
             )}
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Estado Actual</h3>
            <div className="space-y-2">
              <select
                value={tempStatus}
                onChange={(e) => {
                  setTempStatus(e.target.value as TaskStatus);
                  setIsEditing(true);
                }}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-emibytes-dark-card border border-gray-200 dark:border-gray-700 font-black text-xs shadow-sm focus:ring-2 focus:ring-emibytes-primary outline-none appearance-none cursor-pointer uppercase"
              >
                <option value="pendiente">⏳ Pendiente</option>
                <option value="en_proceso">🚀 En Proceso</option>
                <option value="completada">✅ Completada</option>
              </select>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Propiedades</h3>
            
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emibytes-primary rounded-xl flex items-center justify-center text-white shadow-md">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-black uppercase">Responsable</p>
                  <p className="text-sm font-bold">{task.responsible}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-md">
                  <FolderOpen size={18} />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-black uppercase">Proyecto</p>
                  <p className="text-sm font-bold">{task.project}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-500">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-black uppercase">Fecha</p>
                  <p className="text-sm font-bold">{new Date(task.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
