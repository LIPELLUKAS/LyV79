import React from 'react';

const CommunicationsPage = () => {
  // Datos simulados para la página de comunicaciones
  const announcements = [
    { id: 1, title: 'Tenida Solemne', content: 'Se convoca a todos los hermanos a la Tenida Solemne del próximo viernes.', date: '10/05/2025', author: 'Venerable Maestro' },
    { id: 2, title: 'Actualización de datos', content: 'Se solicita a todos los miembros actualizar sus datos de contacto.', date: '05/05/2025', author: 'Secretario' },
    { id: 3, title: 'Pago de cuotas', content: 'Recordatorio de pago de cuotas del segundo trimestre.', date: '01/05/2025', author: 'Tesorero' },
  ];

  const messages = [
    { id: 1, subject: 'Trabajo de aprendiz', sender: 'Carlos Rodríguez', date: '12/05/2025', read: false },
    { id: 2, subject: 'Consulta sobre ritual', sender: 'Miguel González', date: '10/05/2025', read: true },
    { id: 3, subject: 'Confirmación de asistencia', sender: 'Roberto Sánchez', date: '08/05/2025', read: true },
  ];

  const events = [
    { id: 1, title: 'Tenida Regular', date: '20/05/2025', time: '19:00', location: 'Templo Principal' },
    { id: 2, title: 'Comité de Beneficencia', date: '15/05/2025', time: '18:00', location: 'Sala de Comités' },
    { id: 3, title: 'Cena de Hermandad', date: '25/05/2025', time: '21:00', location: 'Restaurante El Compás' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Comunicaciones</h1>
        <div className="flex space-x-2">
          <button className="btn btn-primary">
            Nuevo Anuncio
          </button>
          <button className="btn btn-secondary">
            Nuevo Mensaje
          </button>
        </div>
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button className="border-masonic-blue text-masonic-blue whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Anuncios
          </button>
          <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Mensajes
          </button>
          <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Eventos
          </button>
        </nav>
      </div>

      {/* Anuncios */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{announcement.title}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Publicado el {announcement.date} por {announcement.author}
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <p className="text-gray-700">{announcement.content}</p>
            </div>
            <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-end">
              <button className="text-masonic-blue hover:text-blue-900 text-sm font-medium">
                Leer más
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mensajes (ocultos por defecto) */}
      <div className="hidden space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`bg-white shadow rounded-lg overflow-hidden ${!message.read ? 'border-l-4 border-masonic-gold' : ''}`}>
            <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-900">{message.subject}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  De: {message.sender} • {message.date}
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="text-masonic-blue hover:text-blue-900 text-sm font-medium">
                  Leer
                </button>
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Eventos (ocultos por defecto) */}
      <div className="hidden space-y-4">
        {events.map((event) => (
          <div key={event.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-4 sm:px-6 flex items-center">
              <div className="flex-shrink-0 bg-masonic-blue rounded-md p-3 text-white text-center">
                <div className="text-xl font-bold">{event.date.split('/')[0]}</div>
                <div className="text-sm">{['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][parseInt(event.date.split('/')[1]) - 1]}</div>
              </div>
              <div className="ml-4">
                <h3 className="text-base font-medium text-gray-900">{event.title}</h3>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <span>{event.time} • {event.location}</span>
                </div>
              </div>
              <div className="ml-auto">
                <button className="btn btn-secondary text-sm">
                  Confirmar Asistencia
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunicationsPage;
