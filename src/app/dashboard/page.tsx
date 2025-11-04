'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '../../components/layout/NavBar';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [isLoading, user, router]);

  // Evitar renderizado en servidor que no coincide con el cliente
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user && isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
            <p className="text-gray-600 mb-4">Debes iniciar sesión para acceder al dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard genérico (fallback si el usuario ya está logueado y navega aquí directamente)
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard - Gestión de Equipos
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Universidad de Antioquia - Ingeniería de Software
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {user && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Bienvenido, {user.name}
              </h2>
              <p className="text-gray-600 mb-6">
                Usa la barra de navegación para ir a tu sección.
              </p>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Rol: {user.role === 'admin' ? 'Administrador' : user.role === 'professor' ? 'Profesor' : 'Estudiante'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}