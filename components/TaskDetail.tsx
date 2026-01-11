
import React, { useState, useEffect, useRef } from 'react';
// Added ClipboardList to imports
import { X, User, Calendar, Save, Trash2, CheckCircle2, ClipboardList, FolderOpen, ChevronDown } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Task, TaskStatus } from '../types';
import { StatusBadge } from './TaskList';
import { taskService } from '../services/taskService';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
};

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose, onUpdate, onDelete }) => {

  const [tempObservations, setTempObservations] = useState(task.observations);
  const [tempStatus, setTempStatus] = useState<TaskStatus>(task.status);
  const [isEditing, setIsEditing] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Estados para edición inline de propiedades
  const [tempProject, setTempProject] = useState(task.project);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempResponsible, setTempResponsible] = useState(task.responsible);
  const [tempEndDate, setTempEndDate] = useState(task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '');
  const [tempStartDate, setTempStartDate] = useState(task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '');

  // Estados para autocomplete
  const [showResponsibleDropdown, setShowResponsibleDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [allResponsibles, setAllResponsibles] = useState<string[]>([]);
  const [allProjects, setAllProjects] = useState<string[]>([]);

  const responsibleRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);

  // Cargar responsables y proyectos existentes
  useEffect(() => {
    setAllResponsibles(taskService.getResponsibles());
    setAllProjects(taskService.getProjects());
  }, []);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (responsibleRef.current && !responsibleRef.current.contains(event.target as Node)) {
        setShowResponsibleDropdown(false);
      }
      if (projectRef.current && !projectRef.current.contains(event.target as Node)) {
        setShowProjectDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar opciones basado en el input
  const filteredResponsibles = tempResponsible.trim() === '' 
    ? allResponsibles 
    : allResponsibles.filter(r => r.toLowerCase().includes(tempResponsible.toLowerCase()));

  const filteredProjects = tempProject.trim() === '' 
    ? allProjects 
    : allProjects.filter(p => p.toLowerCase().includes(tempProject.toLowerCase()));

  const handleSaveProperty = (field: string) => {
    const updates: Partial<Task> = {};

    switch (field) {
      case 'responsible':
        if (tempResponsible !== task.responsible) {
          updates.responsible = tempResponsible;
          taskService.addResponsible(tempResponsible); // Guardar en lista
        }
        break;
      case 'project':
        if (tempProject !== task.project) {
          updates.project = tempProject;
          taskService.addProject(tempProject); // Guardar en lista
        }
        break;
      case 'startDate':
        const newStartDate = tempStartDate ? new Date(tempStartDate).getTime() : undefined;
        if (newStartDate !== task.startDate) {
          updates.startDate = newStartDate;
        }
        break;
      case 'endDate':
        const newEndDate = tempEndDate ? new Date(tempEndDate).getTime() : undefined;
        if (newEndDate !== task.endDate) {
          updates.endDate = newEndDate;
        }
        break;
    }

    if (Object.keys(updates).length > 0) {
      onUpdate(task.id, updates);
    }
    setEditingField(null);
  };

  const handleCancelEdit = (field: string) => {
    // Restaurar valores originales
    switch (field) {
      case 'responsible':
        setTempResponsible(task.responsible);
        break;
      case 'project':
        setTempProject(task.project);
        break;
      case 'startDate':
        setTempStartDate(task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '');
        break;
      case 'endDate':
        setTempEndDate(task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '');
        break;
    }
    setEditingField(null);
  };

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
                  {/* Responsable - Editable */}
                  <div
                    ref={editingField === 'responsible' ? responsibleRef : null}
                    className="group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 p-2 rounded-xl transition-colors relative"
                    onClick={() => {
                      if (editingField !== 'responsible') {
                        setEditingField('responsible');
                        setTempResponsible(''); // Limpiar para mostrar todas las opciones
                        setShowResponsibleDropdown(true);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-emibytes-primary rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
                        <User size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Responsable</p>
                        {editingField === 'responsible' ? (
                          <div className="relative">
                            <input
                              type="text"
                              value={tempResponsible}
                              onChange={(e) => {
                                setTempResponsible(e.target.value);
                                setShowResponsibleDropdown(true);
                              }}
                              onFocus={() => setShowResponsibleDropdown(true)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveProperty('responsible');
                                  setShowResponsibleDropdown(false);
                                }
                                if (e.key === 'Escape') {
                                  handleCancelEdit('responsible');
                                  setShowResponsibleDropdown(false);
                                }
                              }}
                              autoFocus
                              placeholder={task.responsible}
                              className="w-full px-2 py-1 text-sm font-bold bg-white dark:bg-emibytes-dark-card border-2 border-emibytes-primary rounded-lg outline-none"
                            />
                            {showResponsibleDropdown && filteredResponsibles.length > 0 && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-emibytes-dark-card border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
                                {filteredResponsibles.map((resp, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setTempResponsible(resp);
                                      setShowResponsibleDropdown(false);
                                      handleSaveProperty('responsible');
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-emibytes-primary hover:text-white transition-colors text-sm font-medium"
                                  >
                                    {resp}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm font-bold group-hover:text-emibytes-primary transition-colors">{task.responsible}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Proyecto - Editable */}
                  <div
                    ref={editingField === 'project' ? projectRef : null}
                    className="group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 p-2 rounded-xl transition-colors relative"
                    onClick={() => {
                      if (editingField !== 'project') {
                        setEditingField('project');
                        setTempProject(''); // Limpiar para mostrar todas las opciones
                        setShowProjectDropdown(true);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
                        <FolderOpen size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Proyecto</p>
                        {editingField === 'project' ? (
                          <div className="relative">
                            <input
                              type="text"
                              value={tempProject}
                              onChange={(e) => {
                                setTempProject(e.target.value);
                                setShowProjectDropdown(true);
                              }}
                              onFocus={() => setShowProjectDropdown(true)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveProperty('project');
                                  setShowProjectDropdown(false);
                                }
                                if (e.key === 'Escape') {
                                  handleCancelEdit('project');
                                  setShowProjectDropdown(false);
                                }
                              }}
                              autoFocus
                              placeholder={task.project}
                              className="w-full px-2 py-1 text-sm font-bold bg-white dark:bg-emibytes-dark-card border-2 border-emibytes-primary rounded-lg outline-none"
                            />
                            {showProjectDropdown && filteredProjects.length > 0 && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-emibytes-dark-card border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
                                {filteredProjects.map((proj, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setTempProject(proj);
                                      setShowProjectDropdown(false);
                                      handleSaveProperty('project');
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-emibytes-primary hover:text-white transition-colors text-sm font-medium"
                                  >
                                    {proj}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm font-bold group-hover:text-emibytes-primary transition-colors">{task.project}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Creación - No editable */}
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-500 shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-black uppercase">Creación</p>
                      <p className="text-sm font-bold">{new Date(task.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Fecha Inicio - Editable */}
                  <div
                    className="group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 p-2 rounded-xl transition-colors"
                    onClick={() => editingField !== 'startDate' && setEditingField('startDate')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-green-200 dark:bg-green-700 rounded-xl flex items-center justify-center text-green-700 dark:text-green-300 shadow-md shrink-0">
                        <Calendar size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Inicio</p>
                        {editingField === 'startDate' ? (
                          <input
                            type="date"
                            value={tempStartDate}
                            onChange={(e) => setTempStartDate(e.target.value)}
                            onBlur={() => handleSaveProperty('startDate')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveProperty('startDate');
                              if (e.key === 'Escape') handleCancelEdit('startDate');
                            }}
                            autoFocus
                            className="w-full px-2 py-1 text-sm font-bold bg-white dark:bg-emibytes-dark-card border-2 border-emibytes-primary rounded-lg outline-none"
                          />
                        ) : (
                          <p className="text-sm font-bold group-hover:text-emibytes-primary transition-colors">
                            {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Sin fecha'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fecha Fin - Editable */}
                  <div
                    className="group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 p-2 rounded-xl transition-colors"
                    onClick={() => editingField !== 'endDate' && setEditingField('endDate')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-red-200 dark:bg-red-700 rounded-xl flex items-center justify-center text-red-700 dark:text-red-300 shadow-md shrink-0">
                        <Calendar size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Fin</p>
                        {editingField === 'endDate' ? (
                          <input
                            type="date"
                            value={tempEndDate}
                            onChange={(e) => setTempEndDate(e.target.value)}
                            onBlur={() => handleSaveProperty('endDate')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveProperty('endDate');
                              if (e.key === 'Escape') handleCancelEdit('endDate');
                            }}
                            autoFocus
                            min={tempStartDate}
                            className="w-full px-2 py-1 text-sm font-bold bg-white dark:bg-emibytes-dark-card border-2 border-emibytes-primary rounded-lg outline-none"
                          />
                        ) : (
                          <p className="text-sm font-bold group-hover:text-emibytes-primary transition-colors">
                            {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'Sin fecha'}
                          </p>
                        )}
                      </div>
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
              {/* Responsable - Editable */}
              <div
                ref={editingField === 'responsible' ? responsibleRef : null}
                className="group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 p-2 rounded-xl transition-colors relative"
                onClick={() => {
                  if (editingField !== 'responsible') {
                    setEditingField('responsible');
                    setTempResponsible(''); // Limpiar para mostrar todas las opciones
                    setShowResponsibleDropdown(true);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-emibytes-primary rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
                    <User size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Responsable</p>
                    {editingField === 'responsible' ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={tempResponsible}
                          onChange={(e) => {
                            setTempResponsible(e.target.value);
                            setShowResponsibleDropdown(true);
                          }}
                          onFocus={() => setShowResponsibleDropdown(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveProperty('responsible');
                              setShowResponsibleDropdown(false);
                            }
                            if (e.key === 'Escape') {
                              handleCancelEdit('responsible');
                              setShowResponsibleDropdown(false);
                            }
                          }}
                          autoFocus
                          placeholder={task.responsible}
                          className="w-full px-2 py-1 text-sm font-bold bg-white dark:bg-emibytes-dark-card border-2 border-emibytes-primary rounded-lg outline-none"
                        />
                        {showResponsibleDropdown && filteredResponsibles.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-emibytes-dark-card border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
                            {filteredResponsibles.map((resp, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setTempResponsible(resp);
                                  setShowResponsibleDropdown(false);
                                  handleSaveProperty('responsible');
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-emibytes-primary hover:text-white transition-colors text-sm font-medium"
                              >
                                {resp}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm font-bold group-hover:text-emibytes-primary transition-colors">{task.responsible}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Proyecto - Editable */}
              <div
                ref={editingField === 'project' ? projectRef : null}
                className="group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 p-2 rounded-xl transition-colors relative"
                onClick={() => {
                  if (editingField !== 'project') {
                    setEditingField('project');
                    setTempProject(''); // Limpiar para mostrar todas las opciones
                    setShowProjectDropdown(true);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
                    <FolderOpen size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Proyecto</p>
                    {editingField === 'project' ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={tempProject}
                          onChange={(e) => {
                            setTempProject(e.target.value);
                            setShowProjectDropdown(true);
                          }}
                          onFocus={() => setShowProjectDropdown(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveProperty('project');
                              setShowProjectDropdown(false);
                            }
                            if (e.key === 'Escape') {
                              handleCancelEdit('project');
                              setShowProjectDropdown(false);
                            }
                          }}
                          autoFocus
                          placeholder={task.project}
                          className="w-full px-2 py-1 text-sm font-bold bg-white dark:bg-emibytes-dark-card border-2 border-emibytes-primary rounded-lg outline-none"
                        />
                        {showProjectDropdown && filteredProjects.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-emibytes-dark-card border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
                            {filteredProjects.map((proj, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setTempProject(proj);
                                  setShowProjectDropdown(false);
                                  handleSaveProperty('project');
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-emibytes-primary hover:text-white transition-colors text-sm font-medium"
                              >
                                {proj}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm font-bold group-hover:text-emibytes-primary transition-colors">{task.project}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Creación - No editable */}
              <div className="flex items-center gap-3 p-2">
                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-500 shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-black uppercase">Creación</p>
                  <p className="text-sm font-bold">{new Date(task.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Fecha Inicio - Editable */}
              <div
                className="group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 p-2 rounded-xl transition-colors"
                onClick={() => editingField !== 'startDate' && setEditingField('startDate')}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-green-200 dark:bg-green-700 rounded-xl flex items-center justify-center text-green-700 dark:text-green-300 shadow-md shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Inicio</p>
                    {editingField === 'startDate' ? (
                      <input
                        type="date"
                        value={tempStartDate}
                        onChange={(e) => setTempStartDate(e.target.value)}
                        onBlur={() => handleSaveProperty('startDate')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveProperty('startDate');
                          if (e.key === 'Escape') handleCancelEdit('startDate');
                        }}
                        autoFocus
                        className="w-full px-2 py-1 text-sm font-bold bg-white dark:bg-emibytes-dark-card border-2 border-emibytes-primary rounded-lg outline-none"
                      />
                    ) : (
                      <p className="text-sm font-bold group-hover:text-emibytes-primary transition-colors">
                        {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Sin fecha'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Fecha Fin - Editable */}
              <div
                className="group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 p-2 rounded-xl transition-colors"
                onClick={() => editingField !== 'endDate' && setEditingField('endDate')}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-red-200 dark:bg-red-700 rounded-xl flex items-center justify-center text-red-700 dark:text-red-300 shadow-md shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Fin</p>
                    {editingField === 'endDate' ? (
                      <input
                        type="date"
                        value={tempEndDate}
                        onChange={(e) => setTempEndDate(e.target.value)}
                        onBlur={() => handleSaveProperty('endDate')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveProperty('endDate');
                          if (e.key === 'Escape') handleCancelEdit('endDate');
                        }}
                        autoFocus
                        min={tempStartDate}
                        className="w-full px-2 py-1 text-sm font-bold bg-white dark:bg-emibytes-dark-card border-2 border-emibytes-primary rounded-lg outline-none"
                      />
                    ) : (
                      <p className="text-sm font-bold group-hover:text-emibytes-primary transition-colors">
                        {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'Sin fecha'}
                      </p>
                    )}
                  </div>
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
