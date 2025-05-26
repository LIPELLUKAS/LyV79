import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determinar si un enlace está activo
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para escritorio */}
      <aside className="hidden md:flex flex-col w-64 bg-primary text-white">
        <div className="p-4 border-b border-primary-light">
          <h1 className="text-xl font-semibold">Luz y Verdad</h1>
          <p className="text-sm opacity-75">Sistema de Gestión Masónica</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <li>
              <Link 
                to="/" 
                className={`flex items-center px-4 py-3 ${isActive('/') && location.pathname === '/' ? 'bg-primary-dark' : 'hover:bg-primary-light'}`}
              >
                <span className="material-icons mr-3">dashboard</span>
                <span>Dashboard</span>
              </Link>
            </li>
            
            <li>
              <Link 
                to="/members" 
                className={`flex items-center px-4 py-3 ${isActive('/members') ? 'bg-primary-dark' : 'hover:bg-primary-light'}`}
              >
                <span className="material-icons mr-3">people</span>
                <span>Hermanos</span>
              </Link>
            </li>
            
            <li>
              <Link 
                to="/treasury" 
                className={`flex items-center px-4 py-3 ${isActive('/treasury') ? 'bg-primary-dark' : 'hover:bg-primary-light'}`}
              >
                <span className="material-icons mr-3">account_balance</span>
                <span>Tesorería</span>
              </Link>
            </li>
            
            <li>
              <Link 
                to="/communications/messages" 
                className={`flex items-center px-4 py-3 ${isActive('/communications') ? 'bg-primary-dark' : 'hover:bg-primary-light'}`}
              >
                <span className="material-icons mr-3">notifications</span>
                <span>Comunicaciones</span>
              </Link>
            </li>
            
            <li>
              <Link 
                to="/rituals" 
                className={`flex items-center px-4 py-3 ${isActive('/rituals') ? 'bg-primary-dark' : 'hover:bg-primary-light'}`}
              >
                <span className="material-icons mr-3">book</span>
                <span>Planificación Ritual</span>
              </Link>
            </li>
            
            <li>
              <Link 
                to="/library" 
                className={`flex items-center px-4 py-3 ${isActive('/library') ? 'bg-primary-dark' : 'hover:bg-primary-light'}`}
              >
                <span className="material-icons mr-3">library_books</span>
                <span>Biblioteca</span>
              </Link>
            </li>
            
            {currentUser?.degree >= 3 && (
              <li>
                <Link 
                  to="/admin" 
                  className={`flex items-center px-4 py-3 ${isActive('/admin') ? 'bg-primary-dark' : 'hover:bg-primary-light'}`}
                >
                  <span className="material-icons mr-3">admin_panel_settings</span>
                  <span>Administración</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-primary-light">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm rounded hover:bg-primary-light"
          >
            <span className="material-icons mr-3">logout</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            {/* Botón de menú móvil */}
            <button 
              className="md:hidden text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="material-icons">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
            
            {/* Título de la página */}
            <h1 className="text-xl font-semibold text-gray-800">
              {location.pathname === '/' ? 'Dashboard' : 
               location.pathname.startsWith('/members') ? 'Gestión de Hermanos' :
               location.pathname.startsWith('/treasury') ? 'Tesorería' :
               location.pathname.startsWith('/communications') ? 'Comunicaciones' :
               location.pathname.startsWith('/rituals') ? 'Planificación Ritual' :
               location.pathname.startsWith('/library') ? 'Biblioteca Digital' :
               location.pathname.startsWith('/admin') ? 'Administración' : ''}
            </h1>
            
            {/* Perfil de usuario */}
            <div className="flex items-center">
              <span className="mr-2 text-sm hidden sm:block">
                {currentUser?.symbolic_name || currentUser?.username}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                {currentUser?.symbolic_name?.[0] || currentUser?.username?.[0] || 'U'}
              </div>
            </div>
          </div>
        </header>
        
        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50">
            <div className="w-64 h-full bg-primary text-white">
              <div className="p-4 border-b border-primary-light">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-semibold">Luz y Verdad</h1>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <span className="material-icons">close</span>
                  </button>
                </div>
                <p className="text-sm opacity-75">Sistema de Gestión Masónica</p>
              </div>
              
              <nav className="py-4">
                <ul className="space-y-1">
                  <li>
                    <Link 
                      to="/" 
                      className={`flex items-center px-4 py-3 ${isActive('/') && location.pathname === '/' ? 'bg-primary-dark' : 'hover:bg-primary-light'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="material-icons mr-3">dashboard</span>
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  
                  <li>
                    <Link 
                      to="/members" 
                      className={`flex items-center px-4 py-3 ${isActive('/members') ? 'bg-primary-dark' : 'hover:bg-primary-light'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="material-icons mr-3">people</span>
                      <span>Hermanos</span>
                    </Link>
                  </li>
                  
                  <li>
                    <Link 
                      to="/treasury" 
                      className={`flex items-center px-4 py-3 ${isActive('/treasury') ? 'bg-primary-dark' : 'hover:bg-primary-light'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="material-icons mr-3">account_balance</span>
                      <span>Tesorería</span>
                    </Link>
                  </li>
                  
                  <li>
                    <Link 
                      to="/communications/messages" 
                      className={`flex items-center px-4 py-3 ${isActive('/communications') ? 'bg-primary-dark' : 'hover:bg-primary-light'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="material-icons mr-3">notifications</span>
                      <span>Comunicaciones</span>
                    </Link>
                  </li>
                  
                  <li>
                    <Link 
                      to="/rituals" 
                      className={`flex items-center px-4 py-3 ${isActive('/rituals') ? 'bg-primary-dark' : 'hover:bg-primary-light'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="material-icons mr-3">book</span>
                      <span>Planificación Ritual</span>
                    </Link>
                  </li>
                  
                  <li>
                    <Link 
                      to="/library" 
                      className={`flex items-center px-4 py-3 ${isActive('/library') ? 'bg-primary-dark' : 'hover:bg-primary-light'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="material-icons mr-3">library_books</span>
                      <span>Biblioteca</span>
                    </Link>
                  </li>
                  
                  {currentUser?.degree >= 3 && (
                    <li>
                      <Link 
                        to="/admin" 
                        className={`flex items-center px-4 py-3 ${isActive('/admin') ? 'bg-primary-dark' : 'hover:bg-primary-light'}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="material-icons mr-3">admin_panel_settings</span>
                        <span>Administración</span>
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
              
              <div className="p-4 border-t border-primary-light">
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm rounded hover:bg-primary-light"
                >
                  <span className="material-icons mr-3">logout</span>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Contenido de la página */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
