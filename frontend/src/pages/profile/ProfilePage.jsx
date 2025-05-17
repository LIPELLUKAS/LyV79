import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  
  // Datos simulados para la página de perfil
  const profileData = {
    name: user?.name || 'Usuario',
    role: user?.role || 'Miembro',
    lodge: user?.lodge || 'Luz y Verdad #79',
    grade: 'Maestro Masón',
    initiation: '15/03/2015',
    email: 'usuario@ejemplo.com',
    phone: '+1 234 567 8900',
    address: 'Calle Principal 123, Ciudad',
    lastAttendance: '05/05/2025',
    duesStatus: 'Al día',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Mi Perfil</h1>
        <button className="btn btn-primary">
          Editar Perfil
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          <div className="h-20 w-20 rounded-full bg-masonic-blue flex items-center justify-center text-white text-2xl font-bold">
            {profileData.name.charAt(0)}
          </div>
          <div className="ml-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {profileData.name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {profileData.role} • {profileData.lodge}
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Grado Masónico</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profileData.grade}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Fecha de Iniciación</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profileData.initiation}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Correo Electrónico</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profileData.email}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profileData.phone}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Dirección</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profileData.address}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Última Asistencia</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profileData.lastAttendance}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Estado de Cuotas</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {profileData.duesStatus}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Actividad Reciente */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Actividad Reciente</h3>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-4 py-4 sm:px-6">
              <p className="text-sm text-gray-700">Asistió a <span className="font-medium">Tenida Regular</span></p>
              <p className="text-xs text-gray-500 mt-1">05/05/2025</p>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <p className="text-sm text-gray-700">Realizó pago de <span className="font-medium">Cuota Mensual</span></p>
              <p className="text-xs text-gray-500 mt-1">01/05/2025</p>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <p className="text-sm text-gray-700">Subió documento <span className="font-medium">Trabajo sobre Simbolismo</span></p>
              <p className="text-xs text-gray-500 mt-1">28/04/2025</p>
            </div>
          </div>
        </div>

        {/* Próximos Eventos */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Próximos Eventos</h3>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-4 py-4 sm:px-6">
              <p className="text-sm font-medium text-gray-900">Tenida Regular</p>
              <p className="text-xs text-gray-500 mt-1">20/05/2025 • 19:00 • Templo Principal</p>
              <div className="mt-2">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Confirmado
                </span>
              </div>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <p className="text-sm font-medium text-gray-900">Cena de Hermandad</p>
              <p className="text-xs text-gray-500 mt-1">25/05/2025 • 21:00 • Restaurante El Compás</p>
              <div className="mt-2">
                <button className="text-xs text-masonic-blue font-medium">
                  Confirmar Asistencia
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cambio de Contraseña */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Seguridad</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base leading-6 font-medium text-gray-900">Cambiar Contraseña</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Actualice su contraseña periódicamente para mantener la seguridad de su cuenta.</p>
          </div>
          <div className="mt-5">
            <button className="btn btn-secondary">
              Cambiar Contraseña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
