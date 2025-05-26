import React, { useState, useEffect } from 'react';
import { tesourariaService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const { showError } = useNotification();

  useEffect(() => {
    fetchPayments();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Em um ambiente real, esses dados viriam da API
      // const response = await tesourariaService.getPayments({ 
      //   page: currentPage, 
      //   search: searchTerm,
      //   status: filterStatus
      // });
      // setPayments(response.data.results);
      // setTotalPages(Math.ceil(response.data.count / 10));
      
      // Dados simulados para demonstração
      const mockPayments = [
        { id: 1, member_name: 'João Silva', description: 'Mensalidade Maio/2025', amount: 150.00, date: '2025-05-15', status: 'Pago' },
        { id: 2, member_name: 'Maria Oliveira', description: 'Mensalidade Maio/2025', amount: 150.00, date: '2025-05-10', status: 'Pago' },
        { id: 3, member_name: 'Carlos Santos', description: 'Mensalidade Maio/2025', amount: 150.00, date: '2025-06-01', status: 'Pendente' },
        { id: 4, member_name: 'Ana Pereira', description: 'Mensalidade Maio/2025', amount: 150.00, date: '2025-05-20', status: 'Pago' },
        { id: 5, member_name: 'Roberto Almeida', description: 'Mensalidade Maio/2025', amount: 150.00, date: '2025-06-05', status: 'Pendente' },
        { id: 6, member_name: 'Fernanda Lima', description: 'Mensalidade Maio/2025', amount: 150.00, date: '2025-05-18', status: 'Pago' },
        { id: 7, member_name: 'Ricardo Souza', description: 'Mensalidade Maio/2025', amount: 150.00, date: '2025-05-22', status: 'Pago' },
        { id: 8, member_name: 'Juliana Costa', description: 'Mensalidade Maio/2025', amount: 150.00, date: '2025-06-10', status: 'Pendente' },
        { id: 9, member_name: 'Pedro Martins', description: 'Mensalidade Maio/2025', amount: 150.00, date: '2025-05-25', status: 'Pago' },
        { id: 10, member_name: 'Camila Ferreira', description: 'Mensalidade Maio/2025', amount: 150.00, date: '2025-05-30', status: 'Pago' },
      ];
      
      // Filtrar por termo de busca se existir
      let filteredPayments = searchTerm 
        ? mockPayments.filter(payment => 
            payment.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : mockPayments;
      
      // Filtrar por status se selecionado
      if (filterStatus) {
        filteredPayments = filteredPayments.filter(payment => payment.status === filterStatus);
      }
      
      setPayments(filteredPayments);
      setTotalPages(Math.ceil(filteredPayments.length / 10));
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      showError('Não foi possível carregar a lista de pagamentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Resetar para primeira página ao buscar
    // A busca é feita pelo useEffect quando searchTerm muda
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Formatar valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Lista de Pagamentos</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Gerenciamento de pagamentos do sistema.</p>
        </div>
        <div>
          <a
            href="/tesouraria/pagamentos/novo"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Novo Pagamento
          </a>
        </div>
      </div>
      
      {/* Barra de busca e filtros */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <form onSubmit={handleSearch} className="flex w-full md:max-w-md mb-4 md:mb-0">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por membro ou descrição..."
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
            <button
              type="submit"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Buscar
            </button>
          </form>
          
          <div className="flex items-center">
            <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mr-2">
              Status:
            </label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block sm:text-sm border-gray-300 rounded-md"
            >
              <option value="">Todos</option>
              <option value="Pago">Pago</option>
              <option value="Pendente">Pendente</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Tabela de pagamentos */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Membro
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  Nenhum pagamento encontrado.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.member_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(payment.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      payment.status === 'Pago' ? 'bg-green-100 text-green-800' : 
                      payment.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a href={`/tesouraria/pagamentos/${payment.id}`} className="text-primary-600 hover:text-primary-900 mr-3">
                      Ver
                    </a>
                    <a href={`/tesouraria/pagamentos/${payment.id}/editar`} className="text-primary-600 hover:text-primary-900 mr-3">
                      Editar
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginação */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{payments.length > 0 ? (currentPage - 1) * 10 + 1 : 0}</span> a <span className="font-medium">{Math.min(currentPage * 10, payments.length)}</span> de <span className="font-medium">{payments.length}</span> resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Anterior</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              {[...Array(totalPages).keys()].map((page) => (
                <button
                  key={page + 1}
                  onClick={() => handlePageChange(page + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === page + 1
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Próximo</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsList;
