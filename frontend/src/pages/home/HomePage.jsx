import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header/Navbar */}
      <header className="bg-white shadow-sm">
        <div className="container-custom py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/src/assets/logo.svg" 
              alt="Luz y Verdad 79" 
              className="h-10 w-auto mr-3"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/40x40?text=LyV';
              }}
            />
            <h1 className="text-xl font-bold text-primary-800">Luz y Verdad 79</h1>
          </div>
          <Link 
            to="/login" 
            className="btn btn-primary flex items-center"
          >
            Entrar
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section animate-fade-in">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in">
              <h2 className="text-4xl md:text-5xl font-bold text-primary-900 mb-6">
                Sistema de Gestão Integrado
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                Bem-vindo ao sistema de gestão Luz y Verdad 79. Uma plataforma completa para gerenciamento 
                de secretaria, tesouraria e muito mais.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login" className="btn btn-primary text-center">
                  Acessar Sistema
                </Link>
                <a href="#recursos" className="btn btn-outline text-center">
                  Conhecer Recursos
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="/src/assets/hero-image.svg" 
                alt="Sistema de Gestão" 
                className="w-full h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/600x400?text=Sistema+de+Gestão';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">Recursos do Sistema</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma oferece ferramentas completas para gestão eficiente e organizada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="bg-primary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestão de Secretaria</h3>
              <p className="text-gray-600">
                Controle completo de membros, documentos, comunicações e registros de presença.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="bg-primary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestão de Tesouraria</h3>
              <p className="text-gray-600">
                Controle financeiro, pagamentos, recebimentos e relatórios detalhados.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="bg-primary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Intuitivo</h3>
              <p className="text-gray-600">
                Visualização rápida de informações importantes e indicadores de desempenho.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-primary-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Acesse agora mesmo o sistema e aproveite todos os recursos disponíveis para uma gestão eficiente.
          </p>
          <Link to="/login" className="btn bg-white text-primary-900 hover:bg-gray-100 px-8 py-3 text-lg font-medium">
            Acessar Sistema
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Luz y Verdad 79</h3>
              <p className="text-gray-300">
                Sistema de gestão integrado para administração eficiente.
              </p>
            </div>
            <div className="md:text-right">
              <h3 className="text-xl font-bold mb-4">Contato</h3>
              <p className="text-gray-300">
                Email: contato@luzyverda79.org<br />
                Telefone: (00) 1234-5678
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Luz y Verdad 79. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
