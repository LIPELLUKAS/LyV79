import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { ConfigProvider } from '../../contexts/ConfigContext';
import RitualPlansList from '../rituals/RitualPlansList';
import RitualPlanDetail from '../rituals/RitualPlanDetail';
import RitualPlanForm from '../rituals/RitualPlanForm';
import RitualRoles from '../rituals/RitualRoles';
import RitualWorks from '../rituals/RitualWorks';
import RitualMinutes from '../rituals/RitualMinutes';

// Mock de los servicios API
jest.mock('../../services/api', () => ({
  ritualsService: {
    getAllRitualPlans: jest.fn().mockResolvedValue({
      data: {
        results: [
          {
            id: 1,
            title: 'Tenida Regular de Primer Grado',
            date: '2025-05-15T19:00:00Z',
            status: 'scheduled',
            ritual_type: 'regular',
            degree: 1,
            location: 'Templo Principal',
            created_by: 'John Doe',
            created_at: '2025-04-01T10:00:00Z'
          },
          {
            id: 2,
            title: 'Iniciación de Candidato',
            date: '2025-05-20T18:30:00Z',
            status: 'scheduled',
            ritual_type: 'initiation',
            degree: 1,
            location: 'Templo Principal',
            created_by: 'John Doe',
            created_at: '2025-04-02T11:30:00Z'
          }
        ],
        count: 2
      }
    }),
    getRitualPlan: jest.fn().mockResolvedValue({
      data: {
        id: 1,
        title: 'Tenida Regular de Primer Grado',
        date: '2025-05-15T19:00:00Z',
        status: 'scheduled',
        ritual_type: 'regular',
        degree: 1,
        location: 'Templo Principal',
        description: 'Tenida regular para tratar asuntos de la logia',
        created_by: 'John Doe',
        created_by_id: 1,
        created_at: '2025-04-01T10:00:00Z',
        updated_at: '2025-04-01T10:00:00Z',
        approved_by: null,
        approved_at: null,
        completed_at: null,
        cancelled_at: null,
        cancellation_reason: null
      }
    }),
    getRitualRoles: jest.fn().mockResolvedValue({
      data: [
        {
          id: 1,
          plan_id: 1,
          role_name: 'Venerable Maestro',
          assigned_to_id: 1,
          assigned_to_name: 'John Doe',
          is_confirmed: true,
          created_at: '2025-04-01T10:05:00Z'
        },
        {
          id: 2,
          plan_id: 1,
          role_name: 'Primer Vigilante',
          assigned_to_id: 2,
          assigned_to_name: 'Jane Smith',
          is_confirmed: true,
          created_at: '2025-04-01T10:05:00Z'
        }
      ]
    }),
    getRitualWorks: jest.fn().mockResolvedValue({
      data: [
        {
          id: 1,
          plan_id: 1,
          title: 'Lectura de planchas',
          description: 'Lectura de planchas de los hermanos',
          assigned_to_id: 3,
          assigned_to_name: 'Robert Johnson',
          status: 'pending',
          created_at: '2025-04-01T10:10:00Z'
        }
      ]
    }),
    createRitualPlan: jest.fn().mockResolvedValue({
      data: {
        id: 3,
        title: 'Nueva Tenida',
        date: '2025-06-01T19:00:00Z',
        status: 'scheduled',
        ritual_type: 'regular',
        degree: 1,
        location: 'Templo Principal'
      }
    }),
    updateRitualPlan: jest.fn().mockResolvedValue({
      data: {
        id: 1,
        title: 'Tenida Regular Actualizada',
        date: '2025-05-16T19:00:00Z',
        status: 'scheduled',
        ritual_type: 'regular',
        degree: 1,
        location: 'Templo Principal'
      }
    }),
    addRitualRole: jest.fn().mockResolvedValue({
      data: {
        id: 3,
        plan_id: 1,
        role_name: 'Segundo Vigilante',
        assigned_to_id: 4,
        assigned_to_name: 'Michael Brown',
        is_confirmed: false,
        created_at: '2025-04-26T12:00:00Z'
      }
    }),
    addRitualWork: jest.fn().mockResolvedValue({
      data: {
        id: 2,
        plan_id: 1,
        title: 'Presentación sobre simbolismo',
        description: 'Presentación sobre simbolismo masónico',
        assigned_to_id: 5,
        assigned_to_name: 'William Davis',
        status: 'pending',
        created_at: '2025-04-26T12:05:00Z'
      }
    })
  }
}));

// Mock del contexto de autenticación
jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: () => ({
    currentUser: {
      id: 1,
      username: 'johndoe',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      roles: ['worshipful_master'],
      degree: 3,
      office: 'worshipful_master'
    },
    isAuthenticated: true,
    userRole: 'worshipful_master',
    hasRole: (role) => role === 'worshipful_master',
    hasDegree: (degree) => 3 >= degree
  })
}));

// Componente wrapper para las pruebas
const TestWrapper = ({ children }) => (
  <MemoryRouter>
    <AuthProvider>
      <ConfigProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ConfigProvider>
    </AuthProvider>
  </MemoryRouter>
);

describe('Módulo de Rituales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RitualPlansList', () => {
    test('renderiza la lista de planes rituales', async () => {
      render(
        <TestWrapper>
          <RitualPlansList />
        </TestWrapper>
      );

      // Verificar que se muestra el título de la página
      expect(screen.getByText(/Planes Rituales/i)).toBeInTheDocument();

      // Esperar a que se carguen los datos
      await waitFor(() => {
        expect(screen.getByText('Tenida Regular de Primer Grado')).toBeInTheDocument();
        expect(screen.getByText('Iniciación de Candidato')).toBeInTheDocument();
      });
    });

    test('permite filtrar planes rituales', async () => {
      render(
        <TestWrapper>
          <RitualPlansList />
        </TestWrapper>
      );

      // Esperar a que se carguen los datos
      await waitFor(() => {
        expect(screen.getByText('Tenida Regular de Primer Grado')).toBeInTheDocument();
      });

      // Buscar el campo de búsqueda y escribir en él
      const searchInput = screen.getByPlaceholderText(/Buscar planes/i);
      fireEvent.change(searchInput, { target: { value: 'Iniciación' } });

      // Simular clic en el botón de búsqueda
      const searchButton = screen.getByRole('button', { name: /Buscar/i });
      fireEvent.click(searchButton);

      // Verificar que se llamó a la API con los parámetros correctos
      expect(require('../../services/api').ritualsService.getAllRitualPlans).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Iniciación' })
      );
    });
  });

  describe('RitualPlanDetail', () => {
    test('renderiza los detalles de un plan ritual', async () => {
      // Mock de useParams para simular la navegación a un plan específico
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useParams: () => ({ id: '1' })
      }));

      render(
        <TestWrapper>
          <RitualPlanDetail />
        </TestWrapper>
      );

      // Esperar a que se carguen los datos
      await waitFor(() => {
        expect(screen.getByText('Tenida Regular de Primer Grado')).toBeInTheDocument();
        expect(screen.getByText('Templo Principal')).toBeInTheDocument();
        expect(screen.getByText(/15\/05\/2025/)).toBeInTheDocument();
      });

      // Verificar que se muestran las pestañas
      expect(screen.getByText(/Roles/i)).toBeInTheDocument();
      expect(screen.getByText(/Trabajos/i)).toBeInTheDocument();
      expect(screen.getByText(/Actas/i)).toBeInTheDocument();
    });
  });

  describe('RitualPlanForm', () => {
    test('permite crear un nuevo plan ritual', async () => {
      render(
        <TestWrapper>
          <RitualPlanForm />
        </TestWrapper>
      );

      // Verificar que se muestra el formulario
      expect(screen.getByText(/Crear Nuevo Plan Ritual/i)).toBeInTheDocument();

      // Llenar el formulario
      fireEvent.change(screen.getByLabelText(/Título/i), {
        target: { value: 'Nueva Tenida' }
      });
      fireEvent.change(screen.getByLabelText(/Fecha/i), {
        target: { value: '2025-06-01T19:00' }
      });
      fireEvent.change(screen.getByLabelText(/Ubicación/i), {
        target: { value: 'Templo Principal' }
      });
      
      // Seleccionar tipo de ritual
      const tipoSelect = screen.getByLabelText(/Tipo de Ritual/i);
      fireEvent.change(tipoSelect, { target: { value: 'regular' } });
      
      // Seleccionar grado
      const gradoSelect = screen.getByLabelText(/Grado/i);
      fireEvent.change(gradoSelect, { target: { value: '1' } });

      // Enviar el formulario
      const submitButton = screen.getByRole('button', { name: /Guardar/i });
      fireEvent.click(submitButton);

      // Verificar que se llamó a la API para crear el plan
      await waitFor(() => {
        expect(require('../../services/api').ritualsService.createRitualPlan).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Nueva Tenida',
            date: '2025-06-01T19:00:00Z',
            location: 'Templo Principal',
            ritual_type: 'regular',
            degree: '1'
          })
        );
      });
    });
  });

  describe('RitualRoles', () => {
    test('muestra los roles asignados a un plan ritual', async () => {
      // Mock de useParams para simular la navegación a un plan específico
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useParams: () => ({ planId: '1' })
      }));

      render(
        <TestWrapper>
          <RitualRoles />
        </TestWrapper>
      );

      // Esperar a que se carguen los datos
      await waitFor(() => {
        expect(screen.getByText('Venerable Maestro')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Primer Vigilante')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      // Verificar que se muestra el botón para añadir roles
      expect(screen.getByText(/Añadir Rol/i)).toBeInTheDocument();
    });

    test('permite añadir un nuevo rol', async () => {
      // Mock de useParams para simular la navegación a un plan específico
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useParams: () => ({ planId: '1' })
      }));

      render(
        <TestWrapper>
          <RitualRoles />
        </TestWrapper>
      );

      // Esperar a que se carguen los datos
      await waitFor(() => {
        expect(screen.getByText('Venerable Maestro')).toBeInTheDocument();
      });

      // Abrir el modal para añadir rol
      const addButton = screen.getByText(/Añadir Rol/i);
      fireEvent.click(addButton);

      // Llenar el formulario del modal
      await waitFor(() => {
        const rolInput = screen.getByLabelText(/Nombre del Rol/i);
        fireEvent.change(rolInput, { target: { value: 'Segundo Vigilante' } });
        
        const miembroSelect = screen.getByLabelText(/Asignar a/i);
        fireEvent.change(miembroSelect, { target: { value: '4' } });
        
        // Enviar el formulario
        const submitButton = screen.getByRole('button', { name: /Guardar/i });
        fireEvent.click(submitButton);
      });

      // Verificar que se llamó a la API para añadir el rol
      await waitFor(() => {
        expect(require('../../services/api').ritualsService.addRitualRole).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            role_name: 'Segundo Vigilante',
            assigned_to_id: '4'
          })
        );
      });
    });
  });

  describe('RitualWorks', () => {
    test('muestra los trabajos asignados a un plan ritual', async () => {
      // Mock de useParams para simular la navegación a un plan específico
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useParams: () => ({ planId: '1' })
      }));

      render(
        <TestWrapper>
          <RitualWorks />
        </TestWrapper>
      );

      // Esperar a que se carguen los datos
      await waitFor(() => {
        expect(screen.getByText('Lectura de planchas')).toBeInTheDocument();
        expect(screen.getByText('Robert Johnson')).toBeInTheDocument();
        expect(screen.getByText(/Pendiente/i)).toBeInTheDocument();
      });

      // Verificar que se muestra el botón para añadir trabajos
      expect(screen.getByText(/Añadir Trabajo/i)).toBeInTheDocument();
    });

    test('permite añadir un nuevo trabajo', async () => {
      // Mock de useParams para simular la navegación a un plan específico
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useParams: () => ({ planId: '1' })
      }));

      render(
        <TestWrapper>
          <RitualWorks />
        </TestWrapper>
      );

      // Esperar a que se carguen los datos
      await waitFor(() => {
        expect(screen.getByText('Lectura de planchas')).toBeInTheDocument();
      });

      // Abrir el modal para añadir trabajo
      const addButton = screen.getByText(/Añadir Trabajo/i);
      fireEvent.click(addButton);

      // Llenar el formulario del modal
      await waitFor(() => {
        const tituloInput = screen.getByLabelText(/Título/i);
        fireEvent.change(tituloInput, { target: { value: 'Presentación sobre simbolismo' } });
        
        const descripcionInput = screen.getByLabelText(/Descripción/i);
        fireEvent.change(descripcionInput, { target: { value: 'Presentación sobre simbolismo masónico' } });
        
        const miembroSelect = screen.getByLabelText(/Asignar a/i);
        fireEvent.change(miembroSelect, { target: { value: '5' } });
        
        // Enviar el formulario
        const submitButton = screen.getByRole('button', { name: /Guardar/i });
        fireEvent.click(submitButton);
      });

      // Verificar que se llamó a la API para añadir el trabajo
      await waitFor(() => {
        expect(require('../../services/api').ritualsService.addRitualWork).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            title: 'Presentación sobre simbolismo',
            description: 'Presentación sobre simbolismo masónico',
            assigned_to_id: '5'
          })
        );
      });
    });
  });

  describe('RitualMinutes', () => {
    test('permite crear actas para un plan ritual', async () => {
      // Mock de useParams para simular la navegación a un plan específico
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useParams: () => ({ planId: '1' })
      }));

      render(
        <TestWrapper>
          <RitualMinutes />
        </TestWrapper>
      );

      // Verificar que se muestra el formulario de actas
      expect(screen.getByText(/Acta de la Tenida/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contenido del Acta/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Guardar Acta/i })).toBeInTheDocument();
    });
  });
});
