'use client'
import { ReactNode } from 'react'
import { Providers } from './providers'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <title>Sistema de Gestión Masónica "Luz y Verdad"</title>
        <meta name="description" content="Plataforma de gestión para la Logia Luz y Verdad Nº 79" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
