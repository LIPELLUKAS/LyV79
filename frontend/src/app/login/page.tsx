'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import LogoComponent from '@/components/logo'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    router.push('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(username, password)
      router.push('/')
    } catch (err) {
      setError('Credenciales incorrectas. Por favor, inténtelo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-900 to-blue-950">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <LogoComponent size="xlarge" className="mb-4" />
          <h1 className="text-3xl font-bold text-white text-center">Sistema de Gestión Masónica</h1>
          <h2 className="text-xl text-blue-200 text-center mt-2">"Luz y Verdad"</h2>
        </div>

        <Card className="border-2 border-blue-300">
          <CardHeader className="bg-blue-800 text-white">
            <CardTitle className="text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-blue-200 text-center">
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  placeholder="Ingrese su nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Credenciales de demostración:</p>
              <p className="mt-1">Admin: admin / admin123</p>
              <p>Secretario: secretario / secretario123</p>
              <p>Tesorero: tesorero / tesorero123</p>
              <p>Miembro: miembro / miembro123</p>
            </div>
          </CardContent>
        </Card>
        
        <footer className="mt-8 text-center text-sm text-blue-300">
          <p>© 2025 Sistema de Gestión Masónica "Luz y Verdad"</p>
          <p className="mt-1">Todos los derechos reservados</p>
        </footer>
      </div>
    </main>
  )
}
