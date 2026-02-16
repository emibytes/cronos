import React, { useState } from 'react';
import MenuList from './MenuList';
import MenuForm from './MenuForm';
import MenuViewModal from './MenuViewModal';
import ReorderMenuModal from './ReorderMenuModal';
import { Menu, menuService } from '../services/menuService';
import Swal from 'sweetalert2';

const MenuManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [viewMenu, setViewMenu] = useState<Menu | null>(null);
  const [showReorder, setShowReorder] = useState(false);
  const [listKey, setListKey] = useState(0);

  const handleAdd = () => {
    setSelectedMenu(null);
    setShowForm(true);
  };

  const handleEdit = async (menu: Menu) => {
    try {
      // Cargar datos completos del menú incluyendo hijos
      const fullMenu = await menuService.getMenu(menu.id);
      setSelectedMenu(fullMenu);
      setShowForm(true);
    } catch (error) {
      console.error('Error al cargar menú:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el menú para editar',
        confirmButtonColor: '#138b52',
      });
    }
  };

  const handleView = async (menu: Menu) => {
    try {
      const fullMenu = await menuService.getMenu(menu.id);
      setViewMenu(fullMenu);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la información del menú',
        confirmButtonColor: '#138b52',
      });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el menú y todos sus submenús',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await menuService.deleteMenu(id);
        Swal.fire({
          icon: 'success',
          title: 'Menú eliminado',
          text: 'El menú ha sido eliminado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
        setListKey((prev) => prev + 1);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error instanceof Error ? error.message : 'No se pudo eliminar el menú',
          confirmButtonColor: '#138b52',
        });
      }
    }
  };

  const handleSubmit = async (menuData: {
    name: string;
    url?: string | null;
    target?: '_self' | '_blank' | null;
    parent_id?: string | null;
    order?: number | null;
    status: 'active' | 'inactive';
  }) => {
    try {
      if (selectedMenu) {
        // Actualizar menú existente
        await menuService.updateMenu(selectedMenu.id, menuData);
        Swal.fire({
          icon: 'success',
          title: 'Menú actualizado',
          text: 'El menú ha sido actualizado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Crear nuevo menú
        await menuService.createMenu(menuData);
        Swal.fire({
          icon: 'success',
          title: 'Menú creado',
          text: 'El menú ha sido creado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      }
      
      setShowForm(false);
      setSelectedMenu(null);
      setListKey((prev) => prev + 1);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudo guardar el menú',
        confirmButtonColor: '#138b52',
      });
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedMenu(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div />
        <div className="flex gap-2">
          <button
            onClick={() => setShowReorder(true)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50"
          >
            Ordenar Menús
          </button>
        </div>
      </div>

      <MenuList
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onAdd={handleAdd}
        refreshKey={listKey}
      />

      {showForm && (
        <MenuForm
          menu={selectedMenu}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      )}

      {viewMenu && (
        <MenuViewModal
          menu={viewMenu}
          onClose={() => setViewMenu(null)}
        />
      )}

      {showReorder && (
        <ReorderMenuModal
          onClose={() => setShowReorder(false)}
          onSaved={() => setListKey((prev) => prev + 1)}
        />
      )}
    </>
  );
};

export default MenuManagement;
