import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  ultimo_acceso?: string;
}

interface UserFormData {
  nombre: string;
  email: string;
  password?: string;
  rol: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    nombre: '',
    email: '',
    password: '',
    rol: 'mesero'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const roles = [
    { id: 'admin', label: 'Administrador' },
    { id: 'mesero', label: 'Mesero' },
    { id: 'cocinero', label: 'Cocinero' },
    { id: 'cajero', label: 'Cajero' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError('Error al cargar usuarios. Por favor intente de nuevo.');
      setError('Error al cargar usuarios. Por favor intente de nuevo.');
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const url = editingUser 
        ? `http://localhost:3000/api/usuarios/${editingUser.id}`
        : 'http://localhost:3000/api/usuarios';
      
      const response = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar usuario');
      }

      await fetchUsers();
      setSuccessMessage(editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al guardar usuario');
      setError(error instanceof Error ? error.message : 'Error al guardar usuario');
      console.error('Error saving user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/${user.id}/toggle-active`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al actualizar estado del usuario');
      if (!response.ok) {
        throw new Error('Error al actualizar estado del usuario');
      }

      await fetchUsers();
      setSuccessMessage(`Usuario ${user.activo ? 'desactivado' : 'activado'} exitosamente`);
    } catch (error) {
      setError('Error al actualizar estado del usuario');
      setError('Error al actualizar estado del usuario');
      console.error('Error toggling user status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'mesero'
    });
    setEditingUser(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          disabled={isLoading}
        >
          {showForm ? (
            <>
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </>
          ) : (
            <>
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Usuario
            </>
          )}
        </button>

        <button
          onClick={fetchUsers}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-lg">
          {successMessage}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isLoading}
                required
              />
            </div>
            {!editingUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={isLoading}
                  required={!editingUser}
                  minLength={6}
                />
              </div>
            )}
            <div>
              <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
                Rol
              </label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isLoading}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      )}

      {isLoading && !showForm ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.nombre}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {roles.find(r => r.id === user.rol)?.label || user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.activo 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.ultimo_acceso 
                        ? format(new Date(user.ultimo_acceso), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
                        : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => startEdit(user)}
                          className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`${
                            user.activo 
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          } disabled:opacity-50`}
                          disabled={isLoading}
                        >
                          {user.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;