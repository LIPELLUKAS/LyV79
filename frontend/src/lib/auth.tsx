'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Definir el tipo para el usuario
type User = {
  id: number
  username: string
  role: string
  name: string
}

// Definir el tipo para el contexto de autenticación
type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

// Crear el contexto de autenticación con un valor por defecto
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false
})

// Proveedor de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar si hay un usuario en localStorage al cargar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (error) {
          console.error('Error parsing stored user:', error)
          localStorage.removeItem('user')
        }
      }
      setIsLoading(false)
    }
  }, [])

  // Función para iniciar sesión
  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulación de API para demo
      if (username === 'admin' && password === 'admin123') {
        const userData = {
          id: 1,
          username: 'admin',
          role: 'admin',
          name: 'Administrador'
        }
        setUser(userData)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('token', 'demo-token-12345')
        }
        return
      } else if (username === 'secretario' && password === 'secretario123') {
        const userData = {
          id: 2,
          username: 'secretario',
          role: 'secretario',
          name: 'Secretario'
        }
        setUser(userData)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('token', 'demo-token-67890')
        }
        return
      } else if (username === 'tesorero' && password === 'tesorero123') {
        const userData = {
          id: 3,
          username: 'tesorero',
          role: 'tesorero',
          name: 'Tesorero'
        }
        setUser(userData)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('token', 'demo-token-abcde')
        }
        return
      } else if (username === 'miembro' && password === 'miembro123') {
        const userData = {
          id: 4,
          username: 'miembro',
          role: 'miembro',
          name: 'Miembro Regular'
        }
        setUser(userData)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('token', 'demo-token-fghij')
        }
        return
      }
      
      throw new Error('Credenciales incorrectas')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Función para cerrar sesión
  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  return useContext(AuthContext)
}
