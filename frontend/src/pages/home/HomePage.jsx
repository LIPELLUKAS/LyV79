import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.svg';
import heroImage from '../../assets/hero-image.svg';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Luz y Verdad</span>{' '}
                  <span className="block text-primary-600 xl:inline">Sistema de Gestão</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Plataforma completa para gerenciamento de membros, tesouraria e comunicações da Loja Maçônica Luz y Verdad.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
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
                    className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto"
                  >
                    Saiba Mais
                  </Button>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src={heroImage}
            alt="Dashboard do sistema"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Funcionalidades</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Tudo o que você precisa em um só lugar
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Gerencie todos os aspectos da sua loja com facilidade e segurança.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card 
                title="Secretaria" 
                icon={
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                }
                hover
                onClick={() => isAuthenticated && navigate('/secretaria')}
              >
                <p className="text-gray-500">
                  Gerencie o cadastro de membros, registre presenças e organize documentos importantes.
                </p>
              </Card>

              <Card 
                title="Tesouraria" 
                icon={
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                }
                hover
                onClick={() => isAuthenticated && navigate('/tesouraria')}
              >
                <p className="text-gray-500">
                  Controle financeiro completo, com registro de pagamentos, despesas e geração de relatórios.
                </p>
              </Card>

              <Card 
                title="Comunicações" 
                icon={
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                }
                hover
                onClick={() => isAuthenticated && navigate('/comunicacoes')}
              >
                <p className="text-gray-500">
                  Envie mensagens, notificações e mantenha todos os membros informados sobre eventos e atividades.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img className="h-10 w-auto" src={logo} alt="Luz y Verdad" />
              <p className="ml-3 text-white text-sm">© {new Date().getFullYear()} Luz y Verdad. Todos os direitos reservados.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Política de Privacidade</span>
                Privacidade
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Termos de Uso</span>
                Termos
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
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
