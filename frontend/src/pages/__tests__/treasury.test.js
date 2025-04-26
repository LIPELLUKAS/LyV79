import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import TreasuryDashboard from '../treasury/TreasuryDashboard';
import PaymentsList from '../treasury/PaymentsList';
import PaymentForm from '../treasury/PaymentForm';
import InvoicesList from '../treasury/InvoicesList';
import InvoiceDetail from '../treasury/InvoiceDetail';
import FinancialReports from '../treasury/FinancialReports';
import { treasuryService } from '../../services/api';

// Mock del servicio de API
jest.mock('../../services/api', () => ({
  treasuryService: {
    getFinancialSummary: jest.fn(),
    getAllPayments: jest.fn(),
    getAllTransactions: jest.fn(),
    getMonthlyReport: jest.fn(),
    getAnnualSummary: jest.fn(),
    getMembersList: jest.fn(),
    getFeeTypes: jest.fn(),
    createPayment: jest.fn(),
    updatePayment: jest.fn(),
    getPayment: jest.fn(),
    updatePaymentStatus: jest.fn(),
    getAllInvoices: jest.fn(),
    getInvoice: jest.fn(),
    updateInvoiceStatus: jest.fn(),
    sendInvoiceByEmail: jest.fn(),
    getFinancialReport: jest.fn(),
    exportFinancialReport: jest.fn()
  }
}));

// Mock del hook de autenticación
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    currentUser: {
      id: 1,
      username: 'tesorero',
      degree: 3,
      office: 'Tesorero'
    }
  })),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: '1' })
}));

describe('Módulo de Tesorería - Componentes Frontend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TreasuryDashboard', () => {
    beforeEach(() => {
      treasuryService.getFinancialSummary.mockResolvedValue({
        data: { total_balance: 5000 }
      });
      treasuryService.getAllPayments.mockResolvedValue({
        data: { count: 10 }
      });
      treasuryService.getAllTransactions.mockResolvedValue({
        data: { results: [] }
      });
      treasuryService.getMonthlyReport.mockResolvedValue({
        data: { income: 2000, expenses: 1000 }
      });
      treasuryService.getAnnualSummary.mockResolvedValue({
        data: { months: [] }
      });
    });

    test('renderiza correctamente el dashboard de tesorería', async () => {
      render(<TreasuryDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Tesorería')).toBeInTheDocument();
        expect(treasuryService.getFinancialSummary).toHaveBeenCalled();
        expect(treasuryService.getAllPayments).toHaveBeenCalled();
      });
    });

    test('muestra el balance total correctamente', async () => {
      render(<TreasuryDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Balance Total')).toBeInTheDocument();
        expect(screen.getByText('$5,000')).toBeInTheDocument();
      });
    });
  });

  describe('PaymentsList', () => {
    beforeEach(() => {
      treasuryService.getAllPayments.mockResolvedValue({
        data: {
          results: [
            {
              id: 1,
              member: {
                id: 1,
                symbolic_name: 'Hermano Ejemplo',
                email: 'ejemplo@logia.org'
              },
              concept: 'Cuota mensual',
              amount: 100,
              due_date: '2025-05-01',
              status: 'pending'
            }
          ],
          count: 1
        }
      });
    });

    test('renderiza correctamente la lista de pagos', async () => {
      render(<PaymentsList />);
      
      await waitFor(() => {
        expect(screen.getByText('Gestión de Pagos')).toBeInTheDocument();
        expect(treasuryService.getAllPayments).toHaveBeenCalled();
      });
    });

    test('muestra los pagos en la tabla', async () => {
      render(<PaymentsList />);
      
      await waitFor(() => {
        expect(screen.getByText('Hermano Ejemplo')).toBeInTheDocument();
        expect(screen.getByText('Cuota mensual')).toBeInTheDocument();
        expect(screen.getByText('$100')).toBeInTheDocument();
      });
    });

    test('permite filtrar pagos', async () => {
      render(<PaymentsList />);
      
      await waitFor(() => {
        const statusSelect = screen.getByLabelText('Estado');
        fireEvent.change(statusSelect, { target: { value: 'completed' } });
        expect(treasuryService.getAllPayments).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('PaymentForm', () => {
    beforeEach(() => {
      treasuryService.getMembersList.mockResolvedValue({
        data: [
          { id: 1, symbolic_name: 'Hermano Ejemplo', first_name: 'Juan', last_name: 'Pérez' }
        ]
      });
      treasuryService.getFeeTypes.mockResolvedValue({
        data: [
          { id: 1, name: 'Cuota Mensual', amount: 100 }
        ]
      });
      treasuryService.getPayment.mockResolvedValue({
        data: {
          id: 1,
          member: 1,
          amount: 100,
          concept: 'Cuota mensual',
          due_date: '2025-05-01',
          status: 'pending'
        }
      });
    });

    test('renderiza correctamente el formulario de pago', async () => {
      render(<PaymentForm />);
      
      await waitFor(() => {
        expect(screen.getByText('Editar Pago')).toBeInTheDocument();
        expect(treasuryService.getMembersList).toHaveBeenCalled();
        expect(treasuryService.getFeeTypes).toHaveBeenCalled();
      });
    });

    test('carga los datos del pago existente', async () => {
      render(<PaymentForm />);
      
      await waitFor(() => {
        expect(treasuryService.getPayment).toHaveBeenCalled();
        expect(screen.getByDisplayValue('100')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Cuota mensual')).toBeInTheDocument();
      });
    });
  });

  describe('InvoicesList', () => {
    beforeEach(() => {
      treasuryService.getAllInvoices.mockResolvedValue({
        data: {
          results: [
            {
              id: 1,
              invoice_number: '2025-001',
              recipient_type: 'member',
              recipient: {
                id: 1,
                symbolic_name: 'Hermano Ejemplo',
                email: 'ejemplo@logia.org'
              },
              issue_date: '2025-04-01',
              due_date: '2025-05-01',
              total_amount: 100,
              status: 'issued'
            }
          ],
          count: 1
        }
      });
    });

    test('renderiza correctamente la lista de facturas', async () => {
      render(<InvoicesList />);
      
      await waitFor(() => {
        expect(screen.getByText('Facturas')).toBeInTheDocument();
        expect(treasuryService.getAllInvoices).toHaveBeenCalled();
      });
    });

    test('muestra las facturas en la tabla', async () => {
      render(<InvoicesList />);
      
      await waitFor(() => {
        expect(screen.getByText('#2025-001')).toBeInTheDocument();
        expect(screen.getByText('Hermano Ejemplo')).toBeInTheDocument();
        expect(screen.getByText('$100')).toBeInTheDocument();
      });
    });
  });

  describe('InvoiceDetail', () => {
    beforeEach(() => {
      treasuryService.getInvoice.mockResolvedValue({
        data: {
          id: 1,
          invoice_number: '2025-001',
          reference: 'REF-001',
          recipient_type: 'member',
          recipient: {
            id: 1,
            symbolic_name: 'Hermano Ejemplo',
            email: 'ejemplo@logia.org'
          },
          issuer: {
            lodge_name: 'Logia Luz y Verdad',
            address: 'Calle Principal 123',
            city: 'Ciudad Ejemplo',
            state: 'Estado',
            postal_code: '12345',
            country: 'País',
            tax_id: 'TAX-12345'
          },
          issue_date: '2025-04-01',
          due_date: '2025-05-01',
          items: [
            {
              description: 'Cuota mensual Mayo',
              quantity: 1,
              unit_price: 100
            }
          ],
          subtotal: 100,
          tax_amount: 0,
          discount_amount: 0,
          total_amount: 100,
          status: 'issued',
          notes: 'Notas de ejemplo',
          terms: 'Términos y condiciones',
          payment_info: 'Información de pago'
        }
      });
    });

    test('renderiza correctamente el detalle de factura', async () => {
      render(<InvoiceDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Factura #2025-001')).toBeInTheDocument();
        expect(treasuryService.getInvoice).toHaveBeenCalled();
      });
    });

    test('muestra los detalles de la factura', async () => {
      render(<InvoiceDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Emisor')).toBeInTheDocument();
        expect(screen.getByText('Logia Luz y Verdad')).toBeInTheDocument();
        expect(screen.getByText('Destinatario')).toBeInTheDocument();
        expect(screen.getByText('Hermano Ejemplo')).toBeInTheDocument();
        expect(screen.getByText('Cuota mensual Mayo')).toBeInTheDocument();
        expect(screen.getByText('$100')).toBeInTheDocument();
      });
    });

    test('permite marcar la factura como pagada', async () => {
      treasuryService.updateInvoiceStatus.mockResolvedValue({
        data: { status: 'paid' }
      });
      
      render(<InvoiceDetail />);
      
      await waitFor(() => {
        const markAsPaidButton = screen.getByText('Marcar como pagada');
        fireEvent.click(markAsPaidButton);
        expect(treasuryService.updateInvoiceStatus).toHaveBeenCalledWith('1', { status: 'paid' });
      });
    });
  });

  describe('FinancialReports', () => {
    beforeEach(() => {
      treasuryService.getFinancialReport.mockResolvedValue({
        data: {
          income: {
            total: 2000,
            categories: [
              { name: 'Cuotas', amount: 1500 },
              { name: 'Donaciones', amount: 500 }
            ]
          },
          expenses: {
            total: 1000,
            categories: [
              { name: 'Alquiler', amount: 600 },
              { name: 'Suministros', amount: 400 }
            ]
          },
          balance: 1000,
          initial_balance: 4000,
          final_balance: 5000,
          monthly_data: [
            { label: 'Ene', income: 500, expenses: 300 },
            { label: 'Feb', income: 600, expenses: 400 },
            { label: 'Mar', income: 900, expenses: 300 }
          ],
          transactions: [
            {
              id: 1,
              date: '2025-04-01',
              description: 'Cuota mensual',
              category: 'Cuotas',
              type: 'income',
              amount: 100
            }
          ]
        }
      });
    });

    test('renderiza correctamente la página de informes', async () => {
      render(<FinancialReports />);
      
      await waitFor(() => {
        expect(screen.getByText('Informes Financieros')).toBeInTheDocument();
        expect(treasuryService.getFinancialReport).toHaveBeenCalled();
      });
    });

    test('muestra el resumen financiero', async () => {
      render(<FinancialReports />);
      
      await waitFor(() => {
        expect(screen.getByText('Ingresos')).toBeInTheDocument();
        expect(screen.getByText('$2,000')).toBeInTheDocument();
        expect(screen.getByText('Gastos')).toBeInTheDocument();
        expect(screen.getByText('$1,000')).toBeInTheDocument();
        expect(screen.getByText('Balance')).toBeInTheDocument();
        expect(screen.getByText('$1,000')).toBeInTheDocument();
      });
    });

    test('permite generar un nuevo informe', async () => {
      render(<FinancialReports />);
      
      await waitFor(() => {
        const reportTypeSelect = screen.getByLabelText('Tipo de informe');
        fireEvent.change(reportTypeSelect, { target: { value: 'annual' } });
        
        const generateButton = screen.getByText('Generar Informe');
        fireEvent.click(generateButton);
        
        expect(treasuryService.getFinancialReport).toHaveBeenCalledTimes(2);
      });
    });
  });
});
