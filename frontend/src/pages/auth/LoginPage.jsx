import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import logo from '../../assets/logo.svg';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });
  
  const { login, isAuthenticated, initialLoadComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (initialLoadComplete && isAuthenticated) {
      const redirectUrl = sessionStorage.getItem('redirectUrl') || '/dashboard';
      sessionStorage.removeItem('redirectUrl');
      navigate(redirectUrl);
    }
  }, [isAuthenticated, initialLoadComplete, navigate]);

  // Armazenar URL atual para redirecionamento posterior
  useEffect(() => {
    const from = location.state?.from?.pathname;
    if (from) {
      sessionStorage.setItem('redirectUrl', from);
    }
  }, [location]);

  const validateForm = () => {
    const newErrors = {
      username: '',
      password: ''
    };
    
    if (!username) {
      newErrors.username = 'Nome de usuário é obrigatório';
    } else if (username.length < 3) {
      newErrors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Armazenar preferência de "lembrar-me"
    localStorage.setItem('remember_preference', rememberMe);
    
    const result = await login(username, password, rememberMe);
    
    if (result.requires_2fa) {
      navigate('/verify-2fa');
    } else if (result.success) {
      const redirectUrl = sessionStorage.getItem('redirectUrl') || '/dashboard';
      sessionStorage.removeItem('redirectUrl');
      navigate(redirectUrl);
    } else if (result.error) {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <img
          className="login-logo"
          src={logo}
          alt="Luz y Verdad"
        />
        <h2 className="login-title">
          Acesso ao Sistema
        </h2>
        <p className="login-subtitle">
          Entre com suas credenciais para acessar o sistema
        </p>
      </div>

      <div className="login-card">
        <div className="login-card-header"></div>
        <div className="login-card-body">
          {error && (
            <div className="mb-4">
              <Alert 
                type="error" 
                message={error} 
                onClose={() => setError('')}
              />
            </div>
          )}
          
          <form className="login-form" onSubmit={handleSubmit}>
            <Input
              label="Nome de usuário"
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              aria-required="true"
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? "username-error" : undefined}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu nome de usuário"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              }
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <div id="username-error" className="text-red-600 text-sm mt-1">
                {errors.username}
              </div>
            )}

            <Input
              label="Senha"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              }
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <div id="password-error" className="text-red-600 text-sm mt-1">
                {errors.password}
              </div>
            )}

            <div className="login-form-footer">
              <div className="remember-me">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Lembrar-me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="forgot-password">
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>

            <div className="login-button">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                variant="primary"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </>
                ) : 'Entrar'}
              </Button>
            </div>
          </form>

          <div className="login-divider">
            <span className="login-divider-text">Ou continue com</span>
          </div>

          <div className="social-buttons">
            <button className="social-button" disabled title="Em desenvolvimento">
              <svg className="h-5 w-5 mr-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
              <span>Twitter (em breve)</span>
            </button>

            <button className="social-button" disabled title="Em desenvolvimento">
              <svg className="h-5 w-5 mr-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"></path>
              </svg>
              <span>GitHub (em breve)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
