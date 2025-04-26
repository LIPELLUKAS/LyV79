'use client'
import { ReactNode, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

// Componente para proteger rutas que requieren autenticación
export default function ProtectedRoute({ 
  children,
  requiredRole = null
}: { 
  children: ReactNode,
  requiredRole?: string | null
}) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si no está cargando y no está autenticado, redirigir a login
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
    
    // Si requiere un rol específico y el usuario no tiene ese rol, redirigir al dashboard
    if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router, requiredRole, user])

  // Mientras carga o si no cumple los requisitos, no mostrar nada
  if (isLoading || !isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null
  }

  // Si está autenticado y cumple con el rol requerido (si hay), mostrar el contenido
  return <>{children}</>
}
