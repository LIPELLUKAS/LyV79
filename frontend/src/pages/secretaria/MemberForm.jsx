import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { secretariaService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const MemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    address: '',
    document: '',
    status: 'Ativo'
  });

  // Carregar dados do membro se estiver editando
  React.useEffect(() => {
    if (id) {
      fetchMemberData();
    }
  }, [id]);

  const fetchMemberData = async () => {
    try {
      setIsLoading(true);
      // Em um ambiente real, esses dados viriam da API
      // const response = await secretariaService.getMember(id);
      // setFormData(response.data);
      
      // Dados simulados para demonstração
      setTimeout(() => {
        setFormData({
          name: 'João Silva',
          email: 'joao.silva@example.com',
          phone: '(11) 98765-4321',
          birthdate: '1985-05-15',
          address: 'Rua das Flores, 123 - São Paulo, SP',
          document: '123.456.789-00',
          status: 'Ativo'
        });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao carregar dados do membro:', error);
      showNotification('Não foi possível carregar os dados do membro.', 'error');
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.email) {
      setError('Nome e email são campos obrigatórios.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      if (id) {
        // Em um ambiente real, esses dados seriam enviados para a API
        // await secretariaService.updateMember(id, formData);
        console.log('Atualizando membro:', formData);
        
        // Simulação de sucesso
        setTimeout(() => {
          showNotification('Membro atualizado com sucesso!', 'success');
          navigate('/secretaria/membros');
        }, 500);
      } else {
        // Em um ambiente real, esses dados seriam enviados para a API
        // await secretariaService.createMember(formData);
        console.log('Criando novo membro:', formData);
        
        // Simulação de sucesso
        setTimeout(() => {
          showNotification('Membro cadastrado com sucesso!', 'success');
          navigate('/secretaria/membros');
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao salvar membro:', error);
      setError('Ocorreu um erro ao salvar os dados. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <Card 
      title={id ? 'Editar Membro' : 'Novo Membro'}
      subtitle={id ? 'Atualize os dados do membro' : 'Preencha os dados para cadastrar um novo membro'}
      icon={<UserIcon className="h-6 w-6 text-primary-600" />}
      className="max-w-3xl mx-auto"
    >
      {error && (
        <div className="mb-6">
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')}
          />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Input
            label="Nome completo"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            icon={<UserIcon className="h-5 w-5 text-gray-400" />}
            disabled={isLoading}
          />
          
          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
            disabled={isLoading}
          />
          
          <Input
            label="Telefone"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            icon={<PhoneIcon className="h-5 w-5 text-gray-400" />}
            disabled={isLoading}
          />
          
          <Input
            label="Data de nascimento"
            id="birthdate"
            name="birthdate"
            type="date"
            value={formData.birthdate}
            onChange={handleChange}
            icon={<CalendarIcon className="h-5 w-5 text-gray-400" />}
            disabled={isLoading}
          />
          
          <Input
            label="Documento (CPF)"
            id="document"
            name="document"
            value={formData.document}
            onChange={handleChange}
            icon={<IdentificationIcon className="h-5 w-5 text-gray-400" />}
            disabled={isLoading}
          />
          
          <div className="sm:col-span-2">
            <Input
              label="Endereço"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              icon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              disabled={isLoading}
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Licenciado">Licenciado</option>
              <option value="Suspenso">Suspenso</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/secretaria/membros')}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : id ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default MemberForm;
