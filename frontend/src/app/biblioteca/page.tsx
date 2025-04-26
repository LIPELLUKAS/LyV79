'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function BibliotecaPage() {
  const [activeTab, setActiveTab] = useState('documentos')
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else {
      fetchDocumentos()
    }
  }, [isAuthenticated, router])

  const fetchDocumentos = async () => {
    try {
      const response = await fetch('/api/biblioteca')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar documentos')
      }
      
      setDocumentos(data.documentos)
    } catch (err) {
      setError(err.message || 'Error al cargar datos')
      console.error('Error al cargar documentos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Si no está autenticado, no renderizar el contenido
  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="flex min-h-screen flex-col p-4 sm:p-8">
      <header className="w-full bg-primary text-primary-foreground p-4 mb-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sistema de Gestión Masónica "Luz y Verdad"</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="bg-primary-foreground text-primary" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="mb-6">
        <h2 className="text-3xl font-bold">Biblioteca Digital</h2>
        <p className="text-muted-foreground">Acceda a documentos y recursos masónicos</p>
      </div>

      <Tabs defaultValue="documentos" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="libros">Libros</TabsTrigger>
          <TabsTrigger value="planchas">Planchas</TabsTrigger>
          <TabsTrigger value="multimedia">Multimedia</TabsTrigger>
        </TabsList>

        <TabsContent value="documentos">
          <Card>
            <CardHeader>
              <CardTitle>Repositorio de Documentos</CardTitle>
              <CardDescription>Documentos oficiales y de referencia</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end mb-4">
                <Button>Subir Documento</Button>
              </div>
              
              {loading ? (
                <div className="text-center py-8">Cargando documentos...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Grado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentos.map((documento: any) => (
                      <TableRow key={documento.id}>
                        <TableCell className="font-medium">{documento.titulo}</TableCell>
                        <TableCell>{documento.categoria}</TableCell>
                        <TableCell>{documento.grado}</TableCell>
                        <TableCell>{documento.fecha}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Ver</Button>
                            <Button variant="outline" size="sm">Descargar</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="libros">
          <Card>
            <CardHeader>
              <CardTitle>Catálogo de Libros</CardTitle>
              <CardDescription>Biblioteca física y digital</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8">Catálogo de libros (en desarrollo)</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planchas">
          <Card>
            <CardHeader>
              <CardTitle>Trabajos y Planchas</CardTitle>
              <CardDescription>Trabajos presentados por los miembros</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8">Repositorio de planchas (en desarrollo)</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multimedia">
          <Card>
            <CardHeader>
              <CardTitle>Recursos Multimedia</CardTitle>
              <CardDescription>Videos, audios e imágenes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8">Biblioteca multimedia (en desarrollo)</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <footer className="mt-auto pt-6 pb-4">
        <div className="border-t pt-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Sistema de Gestión Masónica "Luz y Verdad" - Todos los derechos reservados</p>
          <p className="mt-1">Versión 1.0.0</p>
        </div>
      </footer>
    </main>
  )
}
