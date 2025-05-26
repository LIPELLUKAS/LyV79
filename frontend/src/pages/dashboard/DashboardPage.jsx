import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { currentUser } = useAuth();

  // Dados de exemplo para o dashboard
  const stats = [
    { name: 'Total de Membros', value: '42', icon: UserGroupIcon, color: 'bg-blue-500', link: '/secretaria' },
    { name: 'Pagamentos Pendentes', value: '8', icon: CurrencyDollarIcon, color: 'bg-yellow-500', link: '/tesouraria' },
    { name: 'Eventos do Mês', value: '3', icon: CalendarIcon, color: 'bg-green-500', link: '/secretaria/eventos' },
    { name: 'Presença Média', value: '85%', icon: ClockIcon, color: 'bg-purple-500', link: '/secretaria/presenca' },
  ];

  // Atividades recentes (exemplo)
  const recentActivities = [
    { id: 1, type: 'member', action: 'Novo membro cadastrado', name: 'João Silva', date: '2 horas atrás' },
    { id: 2, type: 'payment', action: 'Pagamento registrado', name: 'Carlos Oliveira', date: '5 horas atrás' },
    { id: 3, type: 'attendance', action: 'Presença registrada', name: 'Reunião Mensal', date: 'Ontem' },
    { id: 4, type: 'document', action: 'Documento adicionado', name: 'Ata de Reunião', date: '2 dias atrás' },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        
        {/* Saudação */}
        <div className="mt-4 bg-white shadow rounded-lg p-6 animate-fade-in">
          <h2 className="text-xl font-medium text-gray-900">
            Bem-vindo, {currentUser?.name || 'Usuário'}!
          </h2>
          <p className="mt-1 text-gray-500">
            Aqui está um resumo das atividades e informações importantes do sistema.
          </p>
        </div>
        
        {/* Estatísticas */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              to={stat.link}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Gráficos e Atividades Recentes */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Gráfico */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Resumo Financeiro</h3>
            <div className="mt-4 h-64 flex items-center justify-center border border-gray-200 rounded-md">
              <p className="text-gray-500">Gráfico de resumo financeiro será exibido aqui</p>
            </div>
          </div>
          
          {/* Atividades Recentes */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Atividades Recentes</h3>
            <div className="flow-root mt-4">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-600">
                          {activity.type === 'member' && <UserGroupIcon className="h-5 w-5" />}
                          {activity.type === 'payment' && <CurrencyDollarIcon className="h-5 w-5" />}
                          {activity.type === 'attendance' && <ClockIcon className="h-5 w-5" />}
                          {activity.type === 'document' && <ChartBarIcon className="h-5 w-5" />}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {activity.name}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-sm text-gray-400">
                        {activity.date}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <Link
                to="/atividades"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Ver todas as atividades
              </Link>
            </div>
          </div>
        </div>
        
        {/* Acesso Rápido */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Acesso Rápido</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Link
              to="/secretaria/membros/novo"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-primary-500 hover:ring-1 hover:ring-primary-500 focus:outline-none"
            >
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Novo Membro</p>
              </div>
            </Link>
            
            <Link
              to="/tesouraria/pagamentos/novo"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-primary-500 hover:ring-1 hover:ring-primary-500 focus:outline-none"
            >
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Registrar Pagamento</p>
              </div>
            </Link>
            
            <Link
              to="/secretaria/presenca"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-primary-500 hover:ring-1 hover:ring-primary-500 focus:outline-none"
            >
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Registrar Presença</p>
              </div>
            </Link>
            
            <Link
              to="/relatorios"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-primary-500 hover:ring-1 hover:ring-primary-500 focus:outline-none"
            >
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Gerar Relatórios</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
