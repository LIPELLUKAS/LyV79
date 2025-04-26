'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import ProtectedRoute from '@/components/protected-route'
import LogoComponent from '@/components/logo'

export default function TesoreriaPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Verificar si el usuario tiene permisos para editar (admin o tesorero)
  const canEdit = user?.role === 'admin' || user?.role === 'tesorero'

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
        <header className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white p-4 shadow-md">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <LogoComponent size="medium" />
              <h1 className="text-2xl font-bold">Sistema de Gestión Masónica "Luz y Verdad"</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" className="bg-blue-700 hover:bg-blue-800 text-white border-blue-600">
                  Volver al Dashboard
                </Button>
              </Link>
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
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Gestión de Tesorería</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-blue-200 shadow-md">
              <CardHeader className="bg-blue-700 text-white">
                <CardTitle>Balance General</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Ingresos Totales:</span>
                    <span className="font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">$12,500.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Gastos Totales:</span>
                    <span className="font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">$8,750.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Balance:</span>
                    <span className="font-medium text-blue-900 bg-blue-100 px-3 py-1 rounded-full">$3,750.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 shadow-md">
              <CardHeader className="bg-blue-700 text-white">
                <CardTitle>Cuotas</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Miembros al día:</span>
                    <span className="font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">35</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Miembros con atraso:</span>
                    <span className="font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">7</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Recaudación mensual:</span>
                    <span className="font-medium text-blue-900 bg-blue-100 px-3 py-1 rounded-full">$1,050.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 shadow-md">
              <CardHeader className="bg-blue-700 text-white">
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {canEdit ? (
                    <>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-2">Registrar Pago</Button>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-2">Registrar Gasto</Button>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Generar Informe</Button>
                    </>
                  ) : (
                    <p className="text-blue-700 text-center">No tiene permisos para realizar acciones en tesorería.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-blue-200 shadow-md mb-6">
            <CardHeader className="bg-blue-700 text-white">
              <CardTitle>Estado de Cuotas</CardTitle>
              <CardDescription className="text-blue-100">
                Registro de pagos de miembros
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Buscar miembro..." 
                    className="px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700">Buscar</Button>
                </div>
                
                {canEdit && (
                  <Button className="bg-green-600 hover:bg-green-700">Exportar a Excel</Button>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-blue-100">
                    <TableRow>
                      <TableHead className="text-blue-800">Miembro</TableHead>
                      <TableHead className="text-blue-800">Último Pago</TableHead>
                      <TableHead className="text-blue-800">Estado</TableHead>
                      <TableHead className="text-blue-800">Monto Pendiente</TableHead>
                      <TableHead className="text-blue-800">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Juan Pérez</TableCell>
                      <TableCell>15/04/2025</TableCell>
                      <TableCell>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Al día
                        </span>
                      </TableCell>
                      <TableCell>$0.00</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">Ver Historial</Button>
                          {canEdit && (
                            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">Registrar Pago</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Carlos Rodríguez</TableCell>
                      <TableCell>10/04/2025</TableCell>
                      <TableCell>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Al día
                        </span>
                      </TableCell>
                      <TableCell>$0.00</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">Ver Historial</Button>
                          {canEdit && (
                            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">Registrar Pago</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Miguel González</TableCell>
                      <TableCell>05/02/2025</TableCell>
                      <TableCell>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                          Atrasado
                        </span>
                      </TableCell>
                      <TableCell>$60.00</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">Ver Historial</Button>
                          {canEdit && (
                            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">Registrar Pago</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Roberto Sánchez</TableCell>
                      <TableCell>20/03/2025</TableCell>
                      <TableCell>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                          Próximo a vencer
                        </span>
                      </TableCell>
                      <TableCell>$0.00</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">Ver Historial</Button>
                          {canEdit && (
                            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">Registrar Pago</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Luis Martínez</TableCell>
                      <TableCell>18/04/2025</TableCell>
                      <TableCell>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Al día
                        </span>
                      </TableCell>
                      <TableCell>$0.00</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">Ver Historial</Button>
                          {canEdit && (
                            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">Registrar Pago</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-center mt-6">
                <nav className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50" disabled>Anterior</Button>
                  <Button variant="outline" size="sm" className="border-blue-300 bg-blue-100 text-blue-700">1</Button>
                  <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">2</Button>
                  <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">3</Button>
                  <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">Siguiente</Button>
                </nav>
              </div>
            </CardContent>
          </Card>
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
    </ProtectedRoute>
  )
}
