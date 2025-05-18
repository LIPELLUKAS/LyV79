import React, { useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Contexto de autenticación simplificado
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const login = (credentials) => {
    // En una implementación real, aquí iría la validación contra el backend
    console.log('Login con credenciales:', credentials);
    setIsAuthenticated(true);
    setCurrentUser({
      name: credentials.username,
      role: 'Administrador',
      degree: 3
    });
    return true;
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto de autenticación
function useAuth() {
  return useContext(AuthContext);
}

// Componente para proteger rutas
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Componente de login
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login({ username, password });
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-yellow-400 text-3xl font-bold">LV</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sistema de Gestión Masónica
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Luz y Verdad #79
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Nombre de usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Iniciar Sesión
            </button>
          </div>
          
          <div className="text-sm text-center">
            <p className="text-gray-500">
              Para fines de demostración, puede usar cualquier credencial
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente de barra lateral
function Sidebar() {
  const { currentUser } = useAuth();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Miembros', href: '/members', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Tesorería', href: '/treasury', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Biblioteca', href: '/library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-blue-800">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-blue-900">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold">
                LV
              </div>
              <span className="ml-2 text-white text-lg font-semibold">Luz y Verdad #79</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:bg-blue-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <svg
                    className="text-gray-400 group-hover:text-gray-300 mr-3 h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-blue-900 p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-white">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{currentUser?.name || 'Usuario'}</p>
                <p className="text-xs font-medium text-gray-300">{currentUser?.role || 'Rol no definido'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de encabezado
function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-blue-800">
              Dashboard
            </h1>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <div className="relative">
                  <div className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        {currentUser?.name?.charAt(0) || 'U'}
                      </div>
                      <span className="ml-2 text-gray-700">{currentUser?.name || 'Usuario'}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="ml-4 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Componente de diseño del dashboard
function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Componente de página de dashboard
function DashboardPage() {
  return (
    <div>
      <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Bienvenido al Sistema de Gestión Masónica</h2>
        <p className="text-gray-600 text-center max-w-md">
          Este es un panel de control simplificado. En una implementación completa, 
          aquí se mostrarían estadísticas, notificaciones y accesos rápidos a las 
          diferentes secciones del sistema.
        </p>
      </div>
    </div>
  );
}

// Componente de página de miembros
function MembersPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gestión de Miembros</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <p className="text-gray-600">
          Aquí se mostraría la lista de miembros y opciones para gestionar sus datos.
        </p>
      </div>
    </div>
  );
}

// Componente de página de tesorería
function TreasuryPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gestión de Tesorería</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <p className="text-gray-600">
          Aquí se mostrarían los registros financieros, pagos y opciones de gestión económica.
        </p>
      </div>
    </div>
  );
}

// Componente de página de biblioteca
function LibraryPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Biblioteca Digital</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <p className="text-gray-600">
          Aquí se mostrarían los documentos disponibles en la biblioteca digital.
        </p>
      </div>
    </div>
  );
}

// Componente principal de la aplicación
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/members" element={
          <ProtectedRoute>
            <DashboardLayout>
              <MembersPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/treasury" element={
          <ProtectedRoute>
            <DashboardLayout>
              <TreasuryPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/library" element={
          <ProtectedRoute>
            <DashboardLayout>
              <LibraryPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
