import React, { useState, useEffect } from 'react';
import { secretariaService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

const AttendanceRegister = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      // Em um ambiente real, esses dados viriam da API
      // const response = await secretariaService.getMembers({ status: 'Ativo' });
      // setMembers(response.data.results);
      
      // Dados simulados para demonstração
      setTimeout(() => {
        const mockMembers = [
          { id: 1, name: 'João Silva', status: 'Ativo' },
          { id: 2, name: 'Maria Oliveira', status: 'Ativo' },
          { id: 3, name: 'Carlos Santos', status: 'Ativo' },
          { id: 4, name: 'Ana Pereira', status: 'Ativo' },
          { id: 5, name: 'Roberto Almeida', status: 'Ativo' },
          { id: 6, name: 'Fernanda Lima', status: 'Ativo' },
          { id: 7, name: 'Ricardo Souza', status: 'Ativo' },
          { id: 8, name: 'Juliana Costa', status: 'Ativo' },
          { id: 9, name: 'Pedro Martins', status: 'Ativo' },
          { id: 10, name: 'Camila Ferreira', status: 'Ativo' },
        ];
        setMembers(mockMembers);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      showError('Não foi possível carregar a lista de membros.');
      setLoading(false);
    }
  };

  const handleCheckboxChange = (memberId) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map(member => member.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedMembers.length === 0) {
      showError('Por favor, selecione pelo menos um membro.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Em um ambiente real, esses dados seriam enviados para a API
      // const response = await secretariaService.registerAttendance({
      //   date,
      //   members: selectedMembers
      // });
      
      // Simulação de sucesso
      setTimeout(() => {
        showSuccess(`Presença registrada com sucesso para ${selectedMembers.length} membros.`);
        setSelectedMembers([]);
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao registrar presença:', error);
      showError('Não foi possível registrar a presença. Por favor, tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Registro de Presença</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Selecione os membros presentes na data especificada.</p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Data *
            </label>
            <div className="mt-1">
              <input
                type="date"
                name="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <h4 className="text-md font-medium text-gray-700">Lista de Membros</h4>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-900"
                >
                  {selectedMembers.length === members.length ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Presente
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            id={`member-${member.id}`}
                            checked={selectedMembers.includes(member.id)}
                            onChange={() => handleCheckboxChange(member.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <label htmlFor={`member-${member.id}`} className="cursor-pointer">
                            {member.name}
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </>
              ) : 'Registrar Presença'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceRegister;
