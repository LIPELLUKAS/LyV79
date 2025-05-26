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
import './DashboardPage.css';

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
    <div className="dashboard-container">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        
        {/* Saudação */}
        <div className="dashboard-welcome">
          <div className="dashboard-welcome-content">
            <h2 className="dashboard-welcome-title">
              Bem-vindo, {currentUser?.name || 'Usuário'}!
            </h2>
            <p className="dashboard-welcome-text">
              Aqui está um resumo das atividades e informações importantes do sistema.
            </p>
          </div>
        </div>
        
        {/* Estatísticas */}
        <div className="dashboard-stats">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              to={stat.link}
              className="dashboard-stat-card"
            >
              <div className={`dashboard-stat-icon ${stat.color}`}>
                <stat.icon aria-hidden="true" />
              </div>
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-label">{stat.name}</div>
                <div className="dashboard-stat-value">{stat.value}</div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Gráficos e Atividades Recentes */}
        <div className="dashboard-grid">
          {/* Gráfico */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">Resumo Financeiro</h3>
            </div>
            <div className="dashboard-chart">
              <p>Gráfico de resumo financeiro será exibido aqui</p>
            </div>
          </div>
          
          {/* Atividades Recentes */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">Atividades Recentes</h3>
            </div>
            <div className="dashboard-activity-list">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="dashboard-activity-item">
                  <div className="dashboard-activity-icon">
                    {activity.type === 'member' && <UserGroupIcon />}
                    {activity.type === 'payment' && <CurrencyDollarIcon />}
                    {activity.type === 'attendance' && <ClockIcon />}
                    {activity.type === 'document' && <ChartBarIcon />}
                  </div>
                  <div className="dashboard-activity-content">
                    <p className="dashboard-activity-title">
                      {activity.action}
                    </p>
                    <p className="dashboard-activity-subtitle">
                      {activity.name}
                    </p>
                  </div>
                  <div className="dashboard-activity-time">
                    {activity.date}
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/dashboard"
              className="dashboard-view-all"
            >
              Ver todas as atividades
            </Link>
          </div>
        </div>
        
        {/* Acesso Rápido */}
        <div className="dashboard-quick-access">
          <h3 className="dashboard-quick-access-title">Acesso Rápido</h3>
          <div className="dashboard-quick-access-grid">
            <Link
              to="/secretaria/membros/novo"
              className="dashboard-quick-access-item"
            >
              <div className="dashboard-quick-access-icon">
                <UserGroupIcon />
              </div>
              <div className="dashboard-quick-access-label">Novo Membro</div>
            </Link>
            
            <Link
              to="/tesouraria/pagamentos/novo"
              className="dashboard-quick-access-item"
            >
              <div className="dashboard-quick-access-icon">
                <CurrencyDollarIcon />
              </div>
              <div className="dashboard-quick-access-label">Registrar Pagamento</div>
            </Link>
            
            <Link
              to="/secretaria/presenca"
              className="dashboard-quick-access-item"
            >
              <div className="dashboard-quick-access-icon">
                <ClockIcon />
              </div>
              <div className="dashboard-quick-access-label">Registrar Presença</div>
            </Link>
            
            <Link
              to="/relatorios"
              className="dashboard-quick-access-item"
            >
              <div className="dashboard-quick-access-icon">
                <ChartBarIcon />
              </div>
              <div className="dashboard-quick-access-label">Gerar Relatórios</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
