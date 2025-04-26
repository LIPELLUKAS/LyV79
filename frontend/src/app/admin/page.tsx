'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const router = useRouter()

  // Redirigir si no está autenticado o no es administrador
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (!isAdmin) {
      router.push('/')
    }
  }, [isAuthenticated, isAdmin, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Si no está autenticado o no es administrador, no mostrar contenido
  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50 to-white">
      <header className="w-full bg-gradient-to-r from-amber-700 to-amber-800 text-white p-4 shadow-md">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <div className="text-amber-800 text-xl font-bold">L&V</div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
              <p className="text-amber-200 text-sm">Sistema de Gestión Masónica "Luz y Verdad"</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" className="bg-amber-600 hover:bg-amber-700 text-white border-amber-500">
                Volver al Dashboard
              </Button>
            </Link>
            <div className="text-sm text-right mr-2">
              <div className="font-medium">{user?.name}</div>
              <div className="text-amber-200 capitalize">{user?.role}</div>
            </div>
            <Button variant="outline" className="bg-amber-700 hover:bg-amber-800 text-white border-amber-600" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full p-4 sm:p-8 flex-grow">
        <Tabs defaultValue="configuracion" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6 bg-amber-100">
            <TabsTrigger value="configuracion" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">Configuración</TabsTrigger>
            <TabsTrigger value="usuarios" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">Usuarios</TabsTrigger>
            <TabsTrigger value="contenido" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">Contenido</TabsTrigger>
            <TabsTrigger value="sistema" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">Sistema</TabsTrigger>
          </TabsList>

          <TabsContent value="configuracion" className="space-y-4">
            <h2 className="text-3xl font-bold text-amber-900 mb-6">Configuración de la Logia</h2>
            
            <Card className="border-amber-200 shadow-md mb-6">
              <CardHeader className="bg-amber-700 text-white">
                <CardTitle>Información General</CardTitle>
                <CardDescription className="text-amber-100">
                  Datos básicos de la logia
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">Nombre de la Logia</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-amber-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      defaultValue="Logia Luz y Verdad Nº 79"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">Número</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-amber-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      defaultValue="79"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">Oriente</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-amber-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      defaultValue="São Paulo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">Gran Logia</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-amber-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      defaultValue="Grande Loja Maçônica do Estado de São Paulo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">Fecha de Fundación</label>
                    <input 
                      type="date" 
                      className="w-full p-2 border border-amber-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      defaultValue="1975-03-15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">Rito</label>
                    <select className="w-full p-2 border border-amber-300 rounded-md focus:ring-amber-500 focus:border-amber-500">
                      <option>Rito Escocés Antiguo y Aceptado</option>
                      <option>Rito de York</option>
                      <option>Rito Brasileño</option>
                      <option>Rito Moderno</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-amber-700 mb-1">Dirección</label>
                  <textarea 
                    className="w-full p-2 border border-amber-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                    rows={3}
                    defaultValue="Rua da Fraternidade, 123 - Centro, São Paulo - SP, 01234-567"
                  />
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-amber-700 mb-2">Logo de la Logia</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-amber-100 border border-amber-300 rounded-md flex items-center justify-center">
                      <div className="text-amber-800 text-2xl font-bold">L&V</div>
                    </div>
                    <Button className="bg-amber-600 hover:bg-amber-700">Cambiar Logo</Button>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button className="bg-amber-600 hover:bg-amber-700">Guardar Cambios</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-amber-200 shadow-md">
              <CardHeader className="bg-amber-700 text-white">
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription className="text-amber-100">
                  Personalización de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">Tema del Sistema</label>
                    <select className="w-full p-2 border border-amber-300 rounded-md focus:ring-amber-500 focus:border-amber-500">
                      <option>Azul (Predeterminado)</option>
                      <option>Dorado</option>
                      <option>Clásico</option>
                      <option>Oscuro</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="emailNotifications" 
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-amber-300 rounded"
                      defaultChecked
                    />
                    <label htmlFor="emailNotifications" className="ml-2 block text-sm text-amber-700">
                      Activar notificaciones por email
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="autoBackup" 
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-amber-300 rounded"
                      defaultChecked
                    />
                    <label htmlFor="autoBackup" className="ml-2 block text-sm text-amber-700">
                      Realizar copias de seguridad automáticas
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button className="bg-amber-600 hover:bg-amber-700">Guardar Configuración</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios" className="space-y-4">
            <h2 className="text-3xl font-bold text-amber-900 mb-6">Gestión de Usuarios</h2>
            
            <Card className="border-amber-200 shadow-md">
              <CardHeader className="bg-amber-700 text-white">
                <CardTitle>Usuarios del Sistema</CardTitle>
                <CardDescription className="text-amber-100">
                  Administración de cuentas y permisos
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-end mb-4">
                  <Button className="bg-amber-600 hover:bg-amber-700">Añadir Usuario</Button>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-amber-100">
                      <TableRow>
                        <TableHead className="text-amber-800">Nombre</TableHead>
                        <TableHead className="text-amber-800">Usuario</TableHead>
                        <TableHead className="text-amber-800">Rol</TableHead>
                        <TableHead className="text-amber-800">Estado</TableHead>
                        <TableHead className="text-amber-800">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Administrador</TableCell>
                        <TableCell>admin</TableCell>
                        <TableCell>
                          <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                            Administrador
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Activo
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">Editar</Button>
                            <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">Desactivar</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Secretario</TableCell>
                        <TableCell>secretario</TableCell>
                        <TableCell>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            Secretario
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Activo
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">Editar</Button>
                            <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">Desactivar</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Tesorero</TableCell>
                        <TableCell>tesorero</TableCell>
                        <TableCell>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Tesorero
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Activo
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">Editar</Button>
                            <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">Desactivar</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Miembro Regular</TableCell>
                        <TableCell>miembro</TableCell>
                        <TableCell>
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            Miembro
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Activo
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">Editar</Button>
                            <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">Desactivar</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contenido" className="space-y-4">
            <h2 className="text-3xl font-bold text-amber-900 mb-6">Gestión de Contenido</h2>
            
            <Card className="border-amber-200 shadow-md">
              <CardHeader className="bg-amber-700 text-white">
                <CardTitle>Contenido del Sistema</CardTitle>
                <CardDescription className="text-amber-100">
                  Administración de anuncios, eventos y documentos
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="anuncios">
                  <TabsList className="bg-amber-100 mb-4">
                    <TabsTrigger value="anuncios" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">Anuncios</TabsTrigger>
                    <TabsTrigger value="eventos" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">Eventos</TabsTrigger>
                    <TabsTrigger value="documentos" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">Documentos</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="anuncios" className="space-y-4">
                    <div className="flex justify-end mb-4">
                      <Button className="bg-amber-600 hover:bg-amber-700">Nuevo Anuncio</Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 border border-amber-200 rounded-md bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-amber-900">Actualización de Estatutos</h3>
                            <p className="text-sm text-amber-700">Publicado: 10 de Abril, 2025</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">Editar</Button>
                            <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">Eliminar</Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border border-amber-200 rounded-md bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-amber-900">Convocatoria Asamblea General</h3>
                            <p className="text-sm text-amber-700">Publicado: 5 de Abril, 2025</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">Editar</Button>
                            <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">Eliminar</Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border border-amber-200 rounded-md bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-amber-900">Nuevo Material en Biblioteca</h3>
                            <p className="text-sm text-amber-700">Publicado: 1 de Abril, 2025</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">Editar</Button>
                            <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">Eliminar</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="eventos">
                    <div className="flex justify-end mb-4">
                      <Button className="bg-amber-600 hover:bg-amber-700">Nuevo Evento</Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 border border-amber-200 rounded-md bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-amber-900">Tenida Regular</h3>
                            <p className="text-sm text-amber-700">15 de Mayo, 2025 - 19:00</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">Editar</Button>
                            <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">Eliminar</Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border border-amber-200 rounded-md bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-amber-900">Tenida de Instrucción</h3>
                            <p className="text-sm text-amber-700">22 de Mayo, 2025 - 19:00</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">Editar</Button>
                            <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">Eliminar</Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border border-amber-200 rounded-md bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-amber-900">Tenida Extraordinaria</h3>
                            <p className="text-sm text-amber-700">29 de Mayo, 2025 - 19:00</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">Editar</Button>
                            <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">Eliminar</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="documentos">
                    <div className="flex justify-end mb-4">
                      <Button className="bg-amber-600 hover:bg-amber-700">Subir Documento</Button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-amber-100">
                          <TableRow>
                            <TableHead className="text-amber-800">Título</TableHead>
                            <TableHead className="text-amber-800">Categoría</TableHead>
                            <TableHead className="text-amber-800">Fecha</TableHead>
                            <TableHead className="text-amber-800">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Estatutos Actualizados</TableCell>
                            <TableCell>Documentos Oficiales</TableCell>
                            <TableCell>10/04/2025</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">Ver</Button>
                                <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">Editar</Button>
                                <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">Eliminar</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Manual de Procedimientos</TableCell>
                            <TableCell>Manuales</TableCell>
                            <TableCell>05/03/2025</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">Ver</Button>
                                <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">Editar</Button>
                                <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">Eliminar</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Plancha de Arquitectura</TableCell>
                            <TableCell>Trabajos</TableCell>
                            <TableCell>20/02/2025</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">Ver</Button>
                                <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">Editar</Button>
                                <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">Eliminar</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sistema" className="space-y-4">
            <h2 className="text-3xl font-bold text-amber-900 mb-6">Información del Sistema</h2>
            
            <Card className="border-amber-200 shadow-md">
              <CardHeader className="bg-amber-700 text-white">
                <CardTitle>Estado del Sistema</CardTitle>
                <CardDescription className="text-amber-100">
                  Información técnica y mantenimiento
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <h3 className="font-medium text-amber-800 mb-2">Versión del Sistema</h3>
                      <p className="text-amber-900">1.1.0</p>
                    </div>
                    
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <h3 className="font-medium text-amber-800 mb-2">Última Actualización</h3>
                      <p className="text-amber-900">26 de Abril, 2025</p>
                    </div>
                    
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <h3 className="font-medium text-amber-800 mb-2">Estado de la Base de Datos</h3>
                      <p className="text-green-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Operativa
                      </p>
                    </div>
                    
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <h3 className="font-medium text-amber-800 mb-2">Última Copia de Seguridad</h3>
                      <p className="text-amber-900">26 de Abril, 2025 - 12:00</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4 mt-6">
                    <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      Realizar Copia de Seguridad
                    </Button>
                    <Button className="bg-amber-600 hover:bg-amber-700">
                      Verificar Actualizaciones
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <footer className="bg-amber-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-2">
              <div className="text-amber-900 text-sm font-bold">L&V</div>
            </div>
            <p className="text-lg font-semibold">Sistema de Gestión Masónica "Luz y Verdad"</p>
          </div>
          <p className="text-sm text-amber-200">© 2025 - Todos los derechos reservados</p>
          <p className="text-xs text-amber-300 mt-1">Panel de Administración - Versión 1.1.0</p>
        </div>
      </footer>
    </main>
  )
}
