import React, { useState, useEffect } from 'react';
import { X, Upload, Folder } from 'lucide-react';
import { projectService, Project } from '../services/projectService';
import Swal from 'sweetalert2';

interface ProjectFormProps {
  project?: Project;
  onClose: () => void;
  onSuccess: () => void;
}

const COLORS = [
  '#138b52', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', 
  '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f97316'
];

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#138b52',
    status: 'active' as 'active' | 'inactive',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        color: project.color,
        status: project.status,
      });
      if (project.logo) {
        setLogoPreview(project.logo);
      }
    }
  }, [project]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors({ ...errors, logo: 'El logo no debe superar 2MB' });
      return;
    }

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, logo: 'El logo debe ser una imagen (JPEG, PNG, GIF, SVG, WebP)' });
      return;
    }

    setLogoFile(file);
    setErrors({ ...errors, logo: '' });

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('color', formData.color);
      submitData.append('status', formData.status);
      
      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      if (project) {
        await projectService.updateProject(project.id, submitData);
        Swal.fire({
          icon: 'success',
          title: 'Proyecto actualizado',
          text: 'El proyecto se actualizó correctamente',
          confirmButtonColor: '#138b52',
          timer: 2000,
        });
      } else {
        await projectService.createProject(submitData);
        Swal.fire({
          icon: 'success',
          title: 'Proyecto creado',
          text: 'El proyecto se creó correctamente',
          confirmButtonColor: '#138b52',
          timer: 2000,
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al guardar proyecto:', error);
      
      if (error.errors) {
        setErrors(error.errors);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo guardar el proyecto',
          confirmButtonColor: '#138b52',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white dark:bg-emibytes-dark-card rounded-2xl shadow-2xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Proyecto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-emibytes-primary'
                } bg-white dark:bg-gray-800 focus:ring-2 focus:border-transparent outline-none transition-all`}
                placeholder="Ej: Desarrollo Web 2024"
                required
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all resize-none"
                rows={3}
                placeholder="Describe el proyecto..."
              />
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Logo del Proyecto
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Folder size={32} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <Upload size={18} />
                    Subir Logo
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    JPEG, PNG, GIF, SVG, WebP • Máx. 2MB
                  </p>
                  {errors.logo && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.logo}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Color del Proyecto
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      formData.color === color
                        ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-emibytes-dark-card ring-gray-900 dark:ring-white scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono"
                  placeholder="#138b52"
                />
              </div>
              {errors.color && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.color}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'active' })}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    formData.status === 'active'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Activo
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'inactive' })}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    formData.status === 'inactive'
                      ? 'bg-gray-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Inactivo
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-emibytes-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : project ? 'Actualizar' : 'Crear Proyecto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;
