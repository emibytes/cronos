import React, { useState } from 'react';
import RoleList from './RoleList';
import RoleForm from './RoleForm';
import RoleViewModal from './RoleViewModal';
import { Role, roleService } from '../services/roleService';
import Swal from 'sweetalert2';

const RoleManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [viewRole, setViewRole] = useState<Role | null>(null);
  const [listKey, setListKey] = useState(0);
  const [isLoadingRole, setIsLoadingRole] = useState(false);

  const handleAdd = () => {
    setSelectedRole(null);
    setShowForm(true);
  };

  const handleEdit = async (role: Role) => {
    setIsLoadingRole(true);
    try {
      // Cargar el rol completo con sus permisos
      const fullRole = await roleService.getRole(role.id);
      setSelectedRole(fullRole);
      setShowForm(true);
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo cargar el rol',
        confirmButtonColor: '#138b52',
      });
    } finally {
      setIsLoadingRole(false);
    }
  };

  const handleView = async (role: Role) => {
    try {
      const fullRole = await roleService.getRole(role.id);
      setViewRole(fullRole);
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la información del rol',
        confirmButtonColor: '#138b52',
      });
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedRole(null);
  };

  const handleSuccess = () => {
    // Forzar recarga de la lista incrementando la key
    setListKey(prev => prev + 1);
  };

  return (
    <>
      <RoleList key={listKey} onAdd={handleAdd} onEdit={handleEdit} onView={handleView} />
      {showForm && (
        <RoleForm
          role={selectedRole}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
      {viewRole && (
        <RoleViewModal
          role={viewRole}
          onClose={() => setViewRole(null)}
        />
      )}
      {isLoadingRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emibytes-primary border-t-transparent"></div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold">Cargando rol...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default RoleManagement;
