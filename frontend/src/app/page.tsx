'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import LogoComponent from '@/components/logo'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const router = useRouter()

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Si no está autenticado, no mostrar contenido
  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      <header className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white p-4 shadow-md">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <LogoComponent size="medium" />
            <h1 className="text-2xl font-bold">Sistema de Gestión Masónica "Luz y Verdad"</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="outline" className="bg-amber-600 hover:bg-amber-700 text-white border-amber-500">
                  Panel de Administración
                </Button>
              </Link>
            )}
            <div className="text-sm text-right mr-2">
              <div className="font-medium">{user?.name}</div>
              <div className="text-blue-200 capitalize">{user?.role}</div>
            </div>
            <Button variant="outline" className="bg-blue-700 hover:bg-blue-800 text-white border-blue-600" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full p-4 sm:p-8 flex-grow">
        <Tabs defaultValue="dashboard" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6 bg-blue-100">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Dashboard</TabsTrigger>
            <TabsTrigger value="miembros" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Miembros</TabsTrigger>
            <TabsTrigger value="tesoreria" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Tesorería</TabsTrigger>
            <TabsTrigger value="comunicaciones" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Comunicaciones</TabsTrigger>
            <TabsTrigger value="biblioteca" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Biblioteca</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-blue-200 shadow-md">
                <CardHeader className="bg-blue-700 text-white">
                  <CardTitle>Próximas Tenidas</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[200px] overflow-auto">
                    <div className="space-y-2">
                      <div className="p-2 border border-blue-200 rounded bg-blue-50">
                        <p className="font-medium text-blue-800">Tenida Regular</p>
                        <p className="text-sm text-blue-600">15 de Mayo, 2025 - 19:00</p>
                      </div>
                      <div className="p-2 border border-blue-200 rounded bg-blue-50">
                        <p className="font-medium text-blue-800">Tenida de Instrucción</p>
                        <p className="text-sm text-blue-600">22 de Mayo, 2025 - 19:00</p>
                      </div>
                      <div className="p-2 border border-blue-200 rounded bg-blue-50">
                        <p className="font-medium text-blue-800">Tenida Extraordinaria</p>
                        <p className="text-sm text-blue-600">29 de Mayo, 2025 - 19:00</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 shadow-md">
                <CardHeader className="bg-blue-700 text-white">
                  <CardTitle>Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">Total Miembros:</span>
                      <span className="font-medium text-blue-900 bg-blue-100 px-3 py-1 rounded-full">42</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">Asistencia Promedio:</span>
                      <span className="font-medium text-blue-900 bg-blue-100 px-3 py-1 rounded-full">85%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">Cuotas Pendientes:</span>
                      <span className="font-medium text-blue-900 bg-blue-100 px-3 py-1 rounded-full">7</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">Trabajos Presentados:</span>
                      <span className="font-medium text-blue-900 bg-blue-100 px-3 py-1 rounded-full">12</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 shadow-md">
                <CardHeader className="bg-blue-700 text-white">
                  <CardTitle>Anuncios Recientes</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[200px] overflow-auto">
                    <div className="space-y-2">
                      <div className="p-2 border border-blue-200 rounded bg-blue-50">
                        <p className="font-medium text-blue-800">Actualización de Estatutos</p>
                        <p className="text-sm text-blue-600">Publicado: 10 de Abril, 2025</p>
                      </div>
                      <div className="p-2 border border-blue-200 rounded bg-blue-50">
                        <p className="font-medium text-blue-800">Convocatoria Asamblea General</p>
                        <p className="text-sm text-blue-600">Publicado: 5 de Abril, 2025</p>
                      </div>
                      <div className="p-2 border border-blue-200 rounded bg-blue-50">
                        <p className="font-medium text-blue-800">Nuevo Material en Biblioteca</p>
                        <p className="text-sm text-blue-600">Publicado: 1 de Abril, 2025</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="miembros">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Directorio de Miembros</h2>
            <Card className="border-blue-200 shadow-md">
              <CardHeader className="bg-blue-700 text-white">
                <CardTitle>Miembros de la Logia</CardTitle>
                <CardDescription className="text-blue-100">
                  Directorio completo de hermanos
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Link href="/miembros">
                  <Button className="bg-blue-600 hover:bg-blue-700">Ver Directorio Completo</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tesoreria">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Gestión de Tesorería</h2>
            <Card className="border-blue-200 shadow-md">
              <CardHeader className="bg-blue-700 text-white">
                <CardTitle>Control de Finanzas</CardTitle>
                <CardDescription className="text-blue-100">
                  Administración de cuotas y finanzas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Link href="/tesoreria">
                  <Button className="bg-blue-600 hover:bg-blue-700">Acceder a Tesorería</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comunicaciones">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Centro de Comunicaciones</h2>
            <Card className="border-blue-200 shadow-md">
              <CardHeader className="bg-blue-700 text-white">
                <CardTitle>Comunicaciones</CardTitle>
                <CardDescription className="text-blue-100">
                  Gestión de anuncios y mensajes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Button className="bg-blue-600 hover:bg-blue-700">Acceder a Comunicaciones</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="biblioteca">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Biblioteca Digital</h2>
            <Card className="border-blue-200 shadow-md">
              <CardHeader className="bg-blue-700 text-white">
                <CardTitle>Recursos Masónicos</CardTitle>
                <CardDescription className="text-blue-100">
                  Documentos, libros y recursos digitales
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Link href="/biblioteca">
                  <Button className="bg-blue-600 hover:bg-blue-700">Acceder a Biblioteca</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <footer className="bg-blue-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center mb-4">
            <LogoComponent size="small" className="mr-2" />
            <p className="text-lg font-semibold">Sistema de Gestión Masónica "Luz y Verdad"</p>
          </div>
          <p className="text-sm text-blue-200">© 2025 - Todos los derechos reservados</p>
          <p className="text-xs text-blue-300 mt-1">Versión 1.1.0</p>
        </div>
      </footer>
    </main>
  )
}
