import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.svg';
import heroImage from '../../assets/hero-image.svg';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Hero Section */}
      <div className="home-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="home-hero-content">
              <h1 className="home-hero-title">
                <span className="block">Luz y Verdad</span>
                <span className="block">Sistema de Gestão</span>
              </h1>
              <p className="home-hero-subtitle">
                Plataforma completa para gerenciamento de membros, tesouraria e comunicações da Loja Maçônica Luz y Verdad.
              </p>
              <div className="home-hero-buttons">
                {isAuthenticated ? (
                  <Button 
                    to="/dashboard" 
                    variant="primary" 
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Acessar Dashboard
                  </Button>
                ) : (
                  <Button 
                    to="/login" 
                    variant="primary" 
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Acessar o Sistema
                  </Button>
                )}
                <Button 
                  to="/" 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Saiba Mais
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                className="home-hero-image"
                src={heroImage}
                alt="Dashboard do sistema"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="home-features">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="home-features-header">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Funcionalidades</h2>
            <h3 className="home-features-title">
              Tudo o que você precisa em um só lugar
            </h3>
            <p className="home-features-subtitle">
              Gerencie todos os aspectos da sua loja com facilidade e segurança.
            </p>
          </div>

          <div className="home-features-grid">
            <div className="home-feature-card" onClick={() => isAuthenticated && navigate('/secretaria')}>
              <div className="home-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h4 className="home-feature-title">Secretaria</h4>
              <p className="home-feature-description">
                Gerencie o cadastro de membros, registre presenças e organize documentos importantes.
              </p>
            </div>

            <div className="home-feature-card" onClick={() => isAuthenticated && navigate('/tesouraria')}>
              <div className="home-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="home-feature-title">Tesouraria</h4>
              <p className="home-feature-description">
                Controle financeiro completo, com registro de pagamentos, despesas e geração de relatórios.
              </p>
            </div>

            <div className="home-feature-card" onClick={() => isAuthenticated && navigate('/comunicacoes')}>
              <div className="home-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h4 className="home-feature-title">Comunicações</h4>
              <p className="home-feature-description">
                Envie mensagens, notificações e mantenha todos os membros informados sobre eventos e atividades.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="home-footer-content">
            <div className="home-footer-logo">
              <img src={logo} alt="Luz y Verdad" />
              <p className="home-footer-copyright">© {new Date().getFullYear()} Luz y Verdad. Todos os direitos reservados.</p>
            </div>
            <div className="home-footer-links">
              <a href="#" className="home-footer-link">
                <span className="sr-only">Política de Privacidade</span>
                Privacidade
              </a>
              <a href="#" className="home-footer-link">
                <span className="sr-only">Termos de Uso</span>
                Termos
              </a>
              <a href="#" className="home-footer-link">
                <span className="sr-only">Contato</span>
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
