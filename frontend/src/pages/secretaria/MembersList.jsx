import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { secretariaService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import Card from '../../components/ui/Card';
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchMembers();
  }, [currentPage, searchTerm]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      // Em um ambiente real, esses dados viriam da API
      // const response = await secretariaService.getMembers({ 
      //   page: currentPage, 
      //   search: searchTerm 
      // });
      // setMembers(response.data.results);
      // setTotalPages(Math.ceil(response.data.count / 10));
      
      // Dados simulados para demonstração
      const mockMembers = [
        { id: 1, name: 'João Silva', email: 'joao.silva@example.com', phone: '(11) 98765-4321', status: 'Ativo' },
        { id: 2, name: 'Maria Oliveira', email: 'maria.oliveira@example.com', phone: '(11) 91234-5678', status: 'Ativo' },
        { id: 3, name: 'Carlos Santos', email: 'carlos.santos@example.com', phone: '(11) 99876-5432', status: 'Ativo' },
        { id: 4, name: 'Ana Pereira', email: 'ana.pereira@example.com', phone: '(11) 95678-1234', status: 'Inativo' },
        { id: 5, name: 'Roberto Almeida', email: 'roberto.almeida@example.com', phone: '(11) 92345-6789', status: 'Ativo' },
        { id: 6, name: 'Fernanda Lima', email: 'fernanda.lima@example.com', phone: '(11) 93456-7890', status: 'Ativo' },
        { id: 7, name: 'Ricardo Souza', email: 'ricardo.souza@example.com', phone: '(11) 94567-8901', status: 'Ativo' },
        { id: 8, name: 'Juliana Costa', email: 'juliana.costa@example.com', phone: '(11) 95678-9012', status: 'Inativo' },
        { id: 9, name: 'Pedro Martins', email: 'pedro.martins@example.com', phone: '(11) 96789-0123', status: 'Ativo' },
        { id: 10, name: 'Camila Ferreira', email: 'camila.ferreira@example.com', phone: '(11) 97890-1234', status: 'Ativo' },
      ];
      
      // Filtrar por termo de busca se existir
      const filteredMembers = searchTerm 
        ? mockMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : mockMembers;
      
      setMembers(filteredMembers);
      setTotalPages(Math.ceil(filteredMembers.length / 10));
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      showNotification('Não foi possível carregar a lista de membros.', 'error');
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

  // Definição das colunas da tabela
  const columns = [
    {
      title: 'Nome',
      field: 'name',
      render: (row) => (
        <div className="font-medium text-gray-900">{row.name}</div>
      )
    },
    {
      title: 'Email',
      field: 'email'
    },
    {
      title: 'Telefone',
      field: 'phone'
    },
    {
      title: 'Status',
      field: 'status',
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      title: 'Ações',
      render: (row) => (
        <div className="flex space-x-2">
          <Button
            to={`/secretaria/membros/${row.id}`}
            variant="outline"
            size="sm"
          >
            Ver
          </Button>
          <Button
            to={`/secretaria/membros/${row.id}/editar`}
            variant="outline"
            size="sm"
          >
            Editar
          </Button>
        </div>
      )
    }
  ];

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <UserGroupIcon className="h-6 w-6 mr-2 text-primary-500" />
            Lista de Membros
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Gerenciamento de membros do sistema.
          </p>
        </div>
        <div>
          <Button
            to="/secretaria/membros/novo"
            variant="primary"
            icon={<PlusIcon className="h-5 w-5" />}
          >
            Novo Membro
          </Button>
        </div>
      </div>
      
      {/* Barra de busca */}
      <div className="px-4 py-3 border-t border-gray-200">
        <form onSubmit={handleSearch} className="flex w-full md:max-w-md">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou email..."
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            className="flex-grow"
          />
          <Button
            type="submit"
            variant="primary"
            className="ml-3"
          >
            Buscar
          </Button>
        </form>
      </div>
      
      {/* Tabela de membros */}
      <div className="border-t border-gray-200">
        <Table
          columns={columns}
          data={members}
          isLoading={loading}
          emptyMessage="Nenhum membro encontrado."
          onRowClick={(row) => window.location.href = `/secretaria/membros/${row.id}`}
          hoverable
          striped
        />
      </div>
      
      {/* Paginação */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{members.length > 0 ? (currentPage - 1) * 10 + 1 : 0}</span> a <span className="font-medium">{Math.min(currentPage * 10, members.length)}</span> de <span className="font-medium">{members.length}</span> resultados
            </p>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
        
        {/* Versão mobile da paginação */}
        <div className="flex-1 flex justify-between sm:hidden">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            Anterior
          </Button>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Próximo
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MembersList;
