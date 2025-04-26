// src/app/api/miembros/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Datos simulados de miembros para demostración
const miembros = [
  { id: 1, nombre: 'Juan Pérez', grado: 'Maestro Masón', cargo: 'Venerable Maestro', estado: 'Activo', email: 'juan@ejemplo.com', telefono: '+1234567890', fechaIniciacion: '15/05/2015' },
  { id: 2, nombre: 'Carlos Rodríguez', grado: 'Maestro Masón', cargo: 'Primer Vigilante', estado: 'Activo', email: 'carlos@ejemplo.com', telefono: '+1234567891', fechaIniciacion: '20/06/2016' },
  { id: 3, nombre: 'Miguel González', grado: 'Maestro Masón', cargo: 'Segundo Vigilante', estado: 'Activo', email: 'miguel@ejemplo.com', telefono: '+1234567892', fechaIniciacion: '10/03/2017' },
  { id: 4, nombre: 'Roberto Sánchez', grado: 'Maestro Masón', cargo: 'Secretario', estado: 'Activo', email: 'roberto@ejemplo.com', telefono: '+1234567893', fechaIniciacion: '05/09/2015' },
  { id: 5, nombre: 'Fernando López', grado: 'Maestro Masón', cargo: 'Tesorero', estado: 'Activo', email: 'fernando@ejemplo.com', telefono: '+1234567894', fechaIniciacion: '12/11/2016' },
  { id: 6, nombre: 'Alejandro Martínez', grado: 'Compañero', cargo: 'Maestro de Ceremonias', estado: 'Activo', email: 'alejandro@ejemplo.com', telefono: '+1234567895', fechaIniciacion: '18/07/2020' },
  { id: 7, nombre: 'Eduardo Díaz', grado: 'Aprendiz', cargo: 'Guardatemplo', estado: 'Activo', email: 'eduardo@ejemplo.com', telefono: '+1234567896', fechaIniciacion: '22/02/2023' },
  { id: 8, nombre: 'Ricardo Morales', grado: 'Maestro Masón', cargo: 'Orador', estado: 'Inactivo', email: 'ricardo@ejemplo.com', telefono: '+1234567897', fechaIniciacion: '30/04/2018' },
];

export async function GET(request: NextRequest) {
  try {
    // En una implementación real, aquí verificaríamos la autenticación
    
    // Obtener parámetros de consulta (si los hay)
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const grado = searchParams.get('grado');
    
    // Filtrar miembros según los parámetros
    let resultado = [...miembros];
    
    if (estado) {
      resultado = resultado.filter(m => m.estado.toLowerCase() === estado.toLowerCase());
    }
    
    if (grado) {
      resultado = resultado.filter(m => m.grado.toLowerCase() === grado.toLowerCase());
    }
    
    return NextResponse.json({ miembros: resultado });
  } catch (error) {
    console.error('Error al obtener miembros:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // En una implementación real, aquí verificaríamos la autenticación
    
    const body = await request.json();
    
    // Validación básica
    if (!body.nombre || !body.grado) {
      return NextResponse.json(
        { error: 'Se requieren campos obligatorios' },
        { status: 400 }
      );
    }
    
    // Crear nuevo miembro (simulado)
    const nuevoMiembro = {
      id: miembros.length + 1,
      ...body,
      estado: body.estado || 'Activo'
    };
    
    // En una implementación real, aquí guardaríamos en la base de datos
    
    return NextResponse.json({ 
      mensaje: 'Miembro creado con éxito',
      miembro: nuevoMiembro 
    }, { status: 201 });
  } catch (error) {
    console.error('Error al crear miembro:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
