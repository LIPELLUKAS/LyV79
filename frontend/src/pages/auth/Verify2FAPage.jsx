# Página de Verificação 2FA

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import logo from '../../assets/logo.svg';
import './Verify2FAPage.css';

const Verify2FAPage = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  
  const { verify2FA, tempUserId, requires2FA } = useAuth();
  const navigate = useNavigate();
  
  // Redirecionar se não houver necessidade de 2FA
  useEffect(() => {
    if (!requires2FA) {
      navigate('/login');
    }
  }, [requires2FA, navigate]);
  
  // Contador regressivo para expiração do código
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code) {
      setError('Por favor, digite o código de verificação.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    const result = await verify2FA(code);
    
    if (result.success) {
      navigate('/dashboard');
    } else if (result.error) {
      setError(result.error);
    }
    
    setIsLoading(false);
  };
  
  return (
    <div className="verify-2fa-container">
      <div className="verify-2fa-header">
        <img
          className="verify-2fa-logo"
          src={logo}
          alt="Luz y Verdad"
        />
        <h2 className="verify-2fa-title">
          Verificação em Duas Etapas
        </h2>
        <p className="verify-2fa-subtitle">
          Digite o código de verificação enviado para seu dispositivo
        </p>
      </div>

      <div className="verify-2fa-card">
        <div className="verify-2fa-card-body">
          {error && (
            <div className="mb-4">
              <Alert 
                type="error" 
                message={error} 
                onClose={() => setError('')}
              />
            </div>
          )}
          
          <form className="verify-2fa-form" onSubmit={handleSubmit}>
            <div className="verify-2fa-code-input">
              <Input
                label="Código de Verificação"
                id="code"
                name="code"
                type="text"
                autoComplete="one-time-code"
                required
                aria-required="true"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Digite o código de 6 dígitos"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
              
              <div className="verify-2fa-timer">
                <p>O código expira em: <span className={timeLeft < 10 ? "text-red-600" : ""}>{timeLeft} segundos</span></p>
              </div>
            </div>

            <div className="verify-2fa-button">
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
                    Verificando...
                  </>
                ) : 'Verificar'}
              </Button>
            </div>
            
            <div className="verify-2fa-help">
              <p>Não recebeu o código? <button type="button" className="text-primary-600 hover:text-primary-800">Reenviar código</button></p>
              <p>Problemas com a verificação? <button type="button" className="text-primary-600 hover:text-primary-800" onClick={() => navigate('/login')}>Voltar para o login</button></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Verify2FAPage;
