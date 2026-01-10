
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Send, Search, UserPlus, AlertCircle, ClipboardList } from 'lucide-react';
import ReactQuill from 'react-quill';
import { Attachment } from '../types';
import { taskService } from '../services/taskService';

interface TaskFormProps {
  onClose: () => void;
  onSubmit: (task: { title: string; responsible: string; observations: string; attachments: Attachment[] }) => void;
}

interface FormErrors {
  title?: string;
  responsible?: string;
  observations?: string;
}

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ],
};

const TaskForm: React.FC<TaskFormProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [responsible, setResponsible] = useState('');
  const [observations, setObservations] = useState('');
  const [attachments] = useState<Attachment[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [logoError, setLogoError] = useState(false);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [availableResponsibles, setAvailableResponsibles] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAvailableResponsibles(taskService.getResponsibles());
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredResponsibles = useMemo(() => {
    if (!responsible) return availableResponsibles;
    return availableResponsibles.filter(r => 
      r.toLowerCase().includes(responsible.toLowerCase())
    );
  }, [responsible, availableResponsibles]);

  const exactMatch = useMemo(() => {
    return availableResponsibles.some(r => r.toLowerCase() === responsible.toLowerCase());
  }, [responsible, availableResponsibles]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = 'El título es obligatorio';
    if (!responsible.trim()) newErrors.responsible = 'El responsable es obligatorio';
    if (!observations.trim() || observations === '<p><br></p>') newErrors.observations = 'Las observaciones son obligatorias';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        title,
        responsible,
        observations,
        attachments
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-emibytes-dark-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]">
        {/* Header fijo */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-emibytes-primary shrink-0">
          <div className="flex items-center gap-3 px-2">
            {!logoError ? (
              <img 
                src="input_file_2.png" 
                alt="emibytes" 
                onError={() => setLogoError(true)}
                className="w-8 h-8 object-contain brightness-0 invert" 
              />
            ) : (
              <ClipboardList className="w-7 h-7 text-white" />
            )}
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">Nueva Tarea</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="text-white" size={24} />
          </button>
        </div>

        {/* Cuerpo con Scroll */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors(prev => ({ ...prev, title: undefined }));
                }}
                placeholder="Ej. Diseño de Interfaz"
                className={`w-full px-4 py-3 rounded-xl border ${errors.title ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'} focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all font-semibold`}
              />
              {errors.title && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1 uppercase"><AlertCircle size={12} /> {errors.title}</p>}
            </div>
            
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                Responsable <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  autoComplete="off"
                  type="text"
                  value={responsible}
                  onFocus={() => setIsMenuOpen(true)}
                  onChange={(e) => {
                    setResponsible(e.target.value);
                    setIsMenuOpen(true);
                    if (errors.responsible) setErrors(prev => ({ ...prev, responsible: undefined }));
                  }}
                  placeholder="Asignar a..."
                  className={`w-full px-4 py-3 rounded-xl border ${errors.responsible ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'} focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all font-semibold`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </div>
              </div>
              {errors.responsible && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1 uppercase"><AlertCircle size={12} /> {errors.responsible}</p>}

              {isMenuOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-emibytes-dark-card border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                  {filteredResponsibles.map((r, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setResponsible(r);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm flex items-center space-x-2 transition-colors font-bold"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emibytes-primary"></span>
                      <span>{r}</span>
                    </button>
                  ))}
                  {responsible && !exactMatch && (
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full text-left px-4 py-3 bg-emibytes-primary/5 dark:bg-emibytes-primary/10 hover:bg-emibytes-primary/10 text-emibytes-primary text-xs font-black flex items-center space-x-2 transition-colors border-t border-emibytes-primary/10 uppercase"
                    >
                      <UserPlus size={14} />
                      <span>Nuevo: "{responsible}"</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              Observaciones del Proyecto <span className="text-red-500">*</span>
            </label>
            <div className={`rich-text-wrapper ${errors.observations ? 'border-2 border-red-500 rounded-xl overflow-hidden' : ''}`}>
              <ReactQuill 
                theme="snow"
                value={observations}
                onChange={setObservations}
                modules={modules}
                placeholder="Detalla los requisitos o pasos a seguir..."
              />
            </div>
            {errors.observations && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1 uppercase"><AlertCircle size={12} /> {errors.observations}</p>}
          </div>
        </div>

        {/* Footer fijo */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 flex gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-black text-xs transition-colors uppercase tracking-widest"
          >
            CANCELAR
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 rounded-xl bg-emibytes-primary text-white font-black hover:opacity-90 shadow-lg shadow-emibytes-primary/20 flex items-center justify-center space-x-2 transition-all uppercase text-xs tracking-widest"
          >
            <Send size={16} />
            <span>CREAR TAREA</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
