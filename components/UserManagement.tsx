import React, { useState } from 'react';
import UserList from './UserList';
import UserForm from './UserForm';
import UserViewModal from './UserViewModal';
import { User, userService } from '../services/userService';
import { roleService } from '../services/roleService';
import Swal from 'sweetalert2';

const UserManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [listKey, setListKey] = useState(0);

  const handleAdd = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleEdit = async (user: User) => {
    try {
      // Cargar datos completos del usuario incluyendo permisos
      const fullUser = await userService.getUser(user.id);
      console.log('Usuario completo cargado para editar:', fullUser);
      setSelectedUser(fullUser);
      setShowForm(true);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el usuario para editar',
        confirmButtonColor: '#138b52',
      });
    }
  };

  const handleView = async (user: User) => {
    try {
      const fullUser = await userService.getUser(user.id);
      setViewUser(fullUser);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la información del usuario',
        confirmButtonColor: '#138b52',
      });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await userService.deleteUser(id);
        Swal.fire({
          icon: 'success',
          title: 'Usuario eliminado',
          text: 'El usuario ha sido eliminado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
        setListKey((prev) => prev + 1);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error instanceof Error ? error.message : 'No se pudo eliminar el usuario',
          confirmButtonColor: '#138b52',
        });
      }
    }
  };

  const handleSubmit = async (userData: {
    name: string;
    username: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    role_id?: string | null;
    status: 'active' | 'inactive';
    menus: any[];
    avatar?: File | null;
  }) => {
    try {
      if (selectedUser) {
        // Actualizar usuario existente
        await userService.updateUser(selectedUser.id, userData);
        Swal.fire({
          icon: 'success',
          title: 'Usuario actualizado',
          text: 'El usuario ha sido actualizado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Crear nuevo usuario
        await userService.createUser({
          ...userData,
          password: userData.password!,
          password_confirmation: userData.password_confirmation!,
        });
        Swal.fire({
          icon: 'success',
          title: 'Usuario creado',
          text: 'El usuario ha sido creado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      }
      
      setShowForm(false);
      setSelectedUser(null);
      setListKey((prev) => prev + 1);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudo guardar el usuario',
        confirmButtonColor: '#138b52',
      });
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  return (
    <>
      <UserList
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onAdd={handleAdd}
        refreshKey={listKey}
      />

      {showForm && (
        <UserForm
          user={selectedUser}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      )}

      {viewUser && (
        <UserViewModal
          user={viewUser}
          onClose={() => setViewUser(null)}
        />
      )}
    </>
  );
};

export default UserManagement;
