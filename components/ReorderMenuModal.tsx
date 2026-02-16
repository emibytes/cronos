import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Menu, menuService } from '../services/menuService';
import { ArrowUp, ArrowDown, X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSaved?: () => void;
}

const ReorderMenuModal: React.FC<Props> = ({ onClose, onSaved }) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const fetchHierarchy = async () => {
    setLoading(true);
    try {
      const data = await menuService.getMenus({ with_hierarchy: true, limit: 100 });
      setMenus(data.menus || []);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err instanceof Error ? err.message : 'No se pudieron cargar los menús' });
    } finally {
      setLoading(false);
    }
  };

  const moveUp = (array: Menu[], index: number) => {
    if (index <= 0) return array;
    const newArr = [...array];
    [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
    return newArr;
  };

  const moveDown = (array: Menu[], index: number) => {
    if (index >= array.length - 1) return array;
    const newArr = [...array];
    [newArr[index + 1], newArr[index]] = [newArr[index], newArr[index + 1]];
    return newArr;
  };

  const handleMoveUp = (siblings: Menu[], parentId: string | null, idx: number) => {
    const updated = moveUp(siblings, idx);
    applySiblingChanges(parentId, updated);
  };

  const handleMoveDown = (siblings: Menu[], parentId: string | null, idx: number) => {
    const updated = moveDown(siblings, idx);
    applySiblingChanges(parentId, updated);
  };

  const applySiblingChanges = (parentId: string | null, updatedSiblings: Menu[]) => {
    const applyRec = (list: Menu[]): Menu[] => {
      return list.map((item) => {
        if ((item.parent_id || null) === parentId && updatedSiblings.find((s) => s.id === item.id)) {
          return updatedSiblings.find((s) => s.id === item.id) as Menu;
        }

        if (item.children && item.children.length) {
          return { ...item, children: applyRec(item.children) };
        }

        return item;
      });
    };

    setMenus((prev) => applyRec(prev));
  };

  const renderList = (items: Menu[], parentId: string | null = null, level = 0) => {
    return (
      <div className={`space-y-2 pl-${level * 4}`}>
        {items
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((item, idx, arr) => (
            <div key={item.id} className="flex items-center justify-between gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div>
                  <div className="font-bold text-sm text-gray-900 dark:text-white">{item.name}</div>
                  <div className="text-xs text-gray-400">Orden: {item.order}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMoveUp(arr, parentId, idx)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  title="Subir"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => handleMoveDown(arr, parentId, idx)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  title="Bajar"
                >
                  <ArrowDown size={16} />
                </button>
              </div>

              {item.children && item.children.length > 0 && (
                <div className="w-full mt-2">
                  {renderList(item.children, item.id, level + 1)}
                </div>
              )}
            </div>
          ))}
      </div>
    );
  };

  const flattenWithOrders = (list: Menu[], parentId: string | null = null) => {
    let result: Array<{ id: string; parent_id: string | null; order: number }> = [];

    const sorted = list.slice().sort((a, b) => a.order - b.order);

    sorted.forEach((item, index) => {
      result.push({ id: item.id, parent_id: parentId, order: index + 1 });
      if (item.children && item.children.length > 0) {
        // ensure children's order are recalculated according to current array
        const childrenWithOrder = item.children
          .slice()
          .map((c, idx) => ({ ...c, order: idx + 1 }));
        result = result.concat(flattenWithOrders(childrenWithOrder, item.id));
      }
    });

    return result;
  };

  const handleSave = async () => {
    const payload = flattenWithOrders(menus);

    try {
      await menuService.reorderMenus(payload);
      Swal.fire({ icon: 'success', title: 'Guardado', text: 'El orden de los menús se actualizó correctamente', timer: 1800, showConfirmButton: false });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err instanceof Error ? err.message : 'No se pudieron guardar los cambios' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ordenar Menús</h3>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-4 max-h-96 overflow-auto">
          {loading && <div className="text-sm text-gray-500">Cargando menús...</div>}
          {!loading && menus.length === 0 && <div className="text-sm text-gray-500">No hay menús para ordenar</div>}
          {!loading && menus.length > 0 && renderList(menus)}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-emibytes-primary text-white font-bold">Guardar Orden</button>
        </div>
      </div>
    </div>
  );
};

export default ReorderMenuModal;
