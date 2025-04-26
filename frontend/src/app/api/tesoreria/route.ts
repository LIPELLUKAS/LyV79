// src/app/api/tesoreria/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Datos simulados de cuotas para demostración
const cuotas = [
  { id: 1, miembro: 'Juan Pérez', miembroId: 1, monto: 150, fecha: '01/04/2025', estado: 'Pagado', fechaPago: '02/04/2025' },
  { id: 2, miembro: 'Carlos Rodríguez', miembroId: 2, monto: 150, fecha: '01/04/2025', estado: 'Pagado', fechaPago: '03/04/2025' },
  { id: 3, miembro: 'Miguel González', miembroId: 3, monto: 150, fecha: '01/04/2025', estado: 'Pendiente', fechaPago: null },
  { id: 4, miembro: 'Roberto Sánchez', miembroId: 4, monto: 150, fecha: '01/04/2025', estado: 'Pagado', fechaPago: '01/04/2025' },
  { id: 5, miembro: 'Fernando López', miembroId: 5, monto: 150, fecha: '01/04/2025', estado: 'Pagado', fechaPago: '05/04/2025' },
  { id: 6, miembro: 'Alejandro Martínez', miembroId: 6, monto: 150, fecha: '01/04/2025', estado: 'Pendiente', fechaPago: null },
  { id: 7, miembro: 'Eduardo Díaz', miembroId: 7, monto: 150, fecha: '01/04/2025', estado: 'Pendiente', fechaPago: null },
  { id: 8, miembro: 'Ricardo Morales', miembroId: 8, monto: 150, fecha: '01/04/2025', estado: 'Exento', fechaPago: null },
];

export async function GET(request: NextRequest) {
  try {
    // En una implementación real, aquí verificaríamos la autenticación
    
    // Obtener parámetros de consulta (si los hay)
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const miembroId = searchParams.get('miembroId');
    
    // Filtrar cuotas según los parámetros
    let resultado = [...cuotas];
    
    if (estado) {
      resultado = resultado.filter(c => c.estado.toLowerCase() === estado.toLowerCase());
    }
    
    if (miembroId) {
      resultado = resultado.filter(c => c.miembroId === parseInt(miembroId));
    }
    
    return NextResponse.json({ cuotas: resultado });
  } catch (error) {
    console.error('Error al obtener cuotas:', error);
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
    if (!body.miembroId || !body.monto) {
      return NextResponse.json(
        { error: 'Se requieren campos obligatorios' },
        { status: 400 }
      );
    }
    
    // Registrar pago (simulado)
    const cuotaExistente = cuotas.find(c => 
      c.miembroId === body.miembroId && 
      c.estado === 'Pendiente'
    );
    
    if (!cuotaExistente) {
      return NextResponse.json(
        { error: 'No se encontró una cuota pendiente para este miembro' },
        { status: 404 }
      );
    }
    
    // Actualizar estado (simulado)
    const cuotaActualizada = {
      ...cuotaExistente,
      estado: 'Pagado',
      fechaPago: new Date().toLocaleDateString('es-ES')
    };
    
    // En una implementación real, aquí actualizaríamos en la base de datos
    
    return NextResponse.json({ 
      mensaje: 'Pago registrado con éxito',
      cuota: cuotaActualizada 
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
