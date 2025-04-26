import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Login from '../auth/Login';
import ForgotPassword from '../auth/ForgotPassword';
import ResetPassword from '../auth/ResetPassword';
import { authService } from '../../services/api';

// Mock del servicio de API
jest.mock('../../services/api', () => ({
  authService: {
    login: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
    verifyTwoFactor: jest.fn()
  }
}));

// Mock del hook de autenticación
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    login: jest.fn(),
    logout: jest.fn(),
    currentUser: null,
    loading: false
  })),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ token: 'test-token' })
}));

describe('Módulo de Autenticación - Componentes Frontend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login', () => {
    test('renderiza correctamente el formulario de login', () => {
      render(<Login />);
      
      expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
      expect(screen.getByLabelText('Usuario')).toBeInTheDocument();
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument();
    });

    test('muestra error cuando los campos están vacíos', async () => {
      render(<Login />);
      
      const submitButton = screen.getByRole('button', { name: 'Ingresar' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Por favor ingrese su usuario')).toBeInTheDocument();
      });
    });

    test('envía solicitud de login cuando el formulario es válido', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        data: { token: 'test-token', requires_2fa: false }
      });
      authService.login.mockImplementation(mockLogin);
      
      render(<Login />);
      
      const usernameInput = screen.getByLabelText('Usuario');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Ingresar' });
      
      fireEvent.change(usernameInput, { target: { value: 'tesorero' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'tesorero',
          password: 'password123'
        });
      });
    });

    test('muestra formulario de 2FA cuando es requerido', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        data: { token: 'test-token', requires_2fa: true }
      });
      authService.login.mockImplementation(mockLogin);
      
      render(<Login />);
      
      const usernameInput = screen.getByLabelText('Usuario');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Ingresar' });
      
      fireEvent.change(usernameInput, { target: { value: 'tesorero' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Verificación de dos factores')).toBeInTheDocument();
        expect(screen.getByLabelText('Código de verificación')).toBeInTheDocument();
      });
    });
  });

  describe('ForgotPassword', () => {
    test('renderiza correctamente el formulario de recuperación de contraseña', () => {
      render(<ForgotPassword />);
      
      expect(screen.getByText('Recuperar Contraseña')).toBeInTheDocument();
      expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Enviar instrucciones' })).toBeInTheDocument();
    });

    test('muestra error cuando el correo está vacío', async () => {
      render(<ForgotPassword />);
      
      const submitButton = screen.getByRole('button', { name: 'Enviar instrucciones' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Por favor ingrese su correo electrónico')).toBeInTheDocument();
      });
    });

    test('envía solicitud de recuperación cuando el formulario es válido', async () => {
      const mockRequestReset = jest.fn().mockResolvedValue({
        data: { message: 'Instrucciones enviadas' }
      });
      authService.requestPasswordReset.mockImplementation(mockRequestReset);
      
      render(<ForgotPassword />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const submitButton = screen.getByRole('button', { name: 'Enviar instrucciones' });
      
      fireEvent.change(emailInput, { target: { value: 'usuario@ejemplo.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockRequestReset).toHaveBeenCalledWith({
          email: 'usuario@ejemplo.com'
        });
      });
    });

    test('muestra mensaje de éxito después de enviar el correo', async () => {
      const mockRequestReset = jest.fn().mockResolvedValue({
        data: { message: 'Instrucciones enviadas' }
      });
      authService.requestPasswordReset.mockImplementation(mockRequestReset);
      
      render(<ForgotPassword />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const submitButton = screen.getByRole('button', { name: 'Enviar instrucciones' });
      
      fireEvent.change(emailInput, { target: { value: 'usuario@ejemplo.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Revise su correo electrónico')).toBeInTheDocument();
      });
    });
  });

  describe('ResetPassword', () => {
    test('renderiza correctamente el formulario de restablecimiento de contraseña', () => {
      render(<ResetPassword />);
      
      expect(screen.getByText('Restablecer Contraseña')).toBeInTheDocument();
      expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Restablecer contraseña' })).toBeInTheDocument();
    });

    test('muestra error cuando las contraseñas no coinciden', async () => {
      render(<ResetPassword />);
      
      const passwordInput = screen.getByLabelText('Nueva contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');
      const submitButton = screen.getByRole('button', { name: 'Restablecer contraseña' });
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmInput, { target: { value: 'password456' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
      });
    });

    test('envía solicitud de restablecimiento cuando el formulario es válido', async () => {
      const mockResetPassword = jest.fn().mockResolvedValue({
        data: { message: 'Contraseña restablecida' }
      });
      authService.resetPassword.mockImplementation(mockResetPassword);
      
      render(<ResetPassword />);
      
      const passwordInput = screen.getByLabelText('Nueva contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');
      const submitButton = screen.getByRole('button', { name: 'Restablecer contraseña' });
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('test-token', {
          password: 'password123',
          password_confirm: 'password123'
        });
      });
    });

    test('muestra mensaje de éxito después de restablecer la contraseña', async () => {
      const mockResetPassword = jest.fn().mockResolvedValue({
        data: { message: 'Contraseña restablecida' }
      });
      authService.resetPassword.mockImplementation(mockResetPassword);
      
      render(<ResetPassword />);
      
      const passwordInput = screen.getByLabelText('Nueva contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');
      const submitButton = screen.getByRole('button', { name: 'Restablecer contraseña' });
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Su contraseña ha sido restablecida')).toBeInTheDocument();
      });
    });
  });
});
