import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Category {
  id: number;
  nombre: string;
  orden: number;
  activa: boolean;
}

interface Product {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  categoria_id: number;
  orden: number;
  disponible: boolean;
  imagen_url?: string;
}

interface GroupedProducts {
  [key: number]: Product[];
}

const MenuManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<GroupedProducts>({});
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ nombre: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadMenuData();
  }, []);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, productsRes] = await Promise.all([
        fetch('http://localhost:3000/api/admin/categories', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:3000/api/admin/products', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const categoriesData = await categoriesRes.json();
      const productsData = await productsRes.json();

      setCategories(categoriesData.sort((a: Category, b: Category) => a.orden - b.orden));
      
      // Group products by category
      const grouped = productsData.reduce((acc: GroupedProducts, product: Product) => {
        if (!acc[product.categoria_id]) {
          acc[product.categoria_id] = [];
        }
        acc[product.categoria_id].push(product);
        acc[product.categoria_id].sort((a, b) => a.orden - b.orden);
        return acc;
      }, {});
      
      setProducts(grouped);
    } catch (error) {
      console.error('Error loading menu data:', error);
      showMessage('error', 'Error al cargar los datos del menú');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'category') {
      const newCategories = Array.from(categories);
      const [removed] = newCategories.splice(source.index, 1);
      newCategories.splice(destination.index, 0, removed);

      // Update order numbers
      const updatedCategories = newCategories.map((cat, index) => ({
        ...cat,
        orden: index + 1
      }));

      setCategories(updatedCategories);

      try {
        await fetch('http://localhost:3000/api/admin/categories/reorder', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ categories: updatedCategories })
        });
      } catch (error) {
        console.error('Error reordering categories:', error);
        showMessage('error', 'Error al reordenar categorías');
      }
    } else if (type === 'product') {
      const categoryId = parseInt(source.droppableId);
      const newProductOrder = Array.from(products[categoryId]);
      const [removed] = newProductOrder.splice(source.index, 1);
      newProductOrder.splice(destination.index, 0, removed);

      // Update products state
      setProducts({
        ...products,
        [categoryId]: newProductOrder.map((product, index) => ({
          ...product,
          orden: index + 1
        }))
      });

      try {
        await fetch(`http://localhost:3000/api/admin/categories/${categoryId}/products/reorder`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ products: newProductOrder })
        });
      } catch (error) {
        console.error('Error reordering products:', error);
        showMessage('error', 'Error al reordenar productos');
      }
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.nombre.trim()) return;

    try {
      const response = await fetch('http://localhost:3000/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          nombre: newCategory.nombre,
          orden: categories.length + 1
        })
      });

      if (response.ok) {
        setNewCategory({ nombre: '' });
        showMessage('success', 'Categoría creada exitosamente');
        loadMenuData();
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showMessage('error', 'Error al crear la categoría');
    }
  };

  const handleUpdateCategory = async (category: Category) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(category)
      });

      if (response.ok) {
        setEditingCategory(null);
        showMessage('success', 'Categoría actualizada exitosamente');
        loadMenuData();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      showMessage('error', 'Error al actualizar la categoría');
    }
  };

  const handleToggleCategoryStatus = async (category: Category) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/categories/${category.id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        showMessage('success', `Categoría ${category.activa ? 'desactivada' : 'activada'} exitosamente`);
        loadMenuData();
      }
    } catch (error) {
      console.error('Error toggling category:', error);
      showMessage('error', 'Error al cambiar el estado de la categoría');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión del Menú</h2>
        <form onSubmit={handleCreateCategory} className="flex gap-2">
          <input
            type="text"
            value={newCategory.nombre}
            onChange={(e) => setNewCategory({ nombre: e.target.value })}
            placeholder="Nueva categoría"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Agregar
          </button>
        </form>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories" type="category">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {categories.map((category, index) => (
                <Draggable
                  key={category.id}
                  draggableId={`category-${category.id}`}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-white rounded-lg shadow"
                    >
                      <div
                        {...provided.dragHandleProps}
                        className={`p-4 border-b ${
                          category.activa ? '' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          {editingCategory?.id === category.id ? (
                            <input
                              type="text"
                              value={editingCategory.nombre}
                              onChange={(e) => setEditingCategory({
                                ...editingCategory,
                                nombre: e.target.value
                              })}
                              className="px-2 py-1 border border-gray-300 rounded"
                              autoFocus
                              onBlur={() => handleUpdateCategory(editingCategory)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateCategory(editingCategory);
                                }
                              }}
                            />
                          ) : (
                            <h3 className="text-lg font-medium text-gray-900">
                              {category.nombre}
                            </h3>
                          )}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleToggleCategoryStatus(category)}
                              className={`${
                                category.activa
                                  ? 'text-red-600 hover:text-red-900'
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {category.activa ? 'Desactivar' : 'Activar'}
                            </button>
                          </div>
                        </div>
                      </div>

                      <Droppable
                        droppableId={String(category.id)}
                        type="product"
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="p-4"
                          >
                            {products[category.id]?.map((product, index) => (
                              <Draggable
                                key={product.id}
                                draggableId={`product-${product.id}`}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`p-3 mb-2 rounded border ${
                                      product.disponible
                                        ? 'bg-white'
                                        : 'bg-gray-50'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h4 className="font-medium">
                                          {product.nombre}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                          ${product.precio.toFixed(2)}
                                        </p>
                                      </div>
                                      <span
                                        className={`px-2 py-1 text-xs rounded-full ${
                                          product.disponible
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                      >
                                        {product.disponible
                                          ? 'Disponible'
                                          : 'No disponible'}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default MenuManagement;