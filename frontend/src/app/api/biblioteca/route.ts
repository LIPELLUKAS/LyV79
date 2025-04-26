// src/app/api/biblioteca/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Datos simulados de documentos para demostración
const documentos = [
  { id: 1, titulo: 'Constitución de la Gran Logia', categoria: 'Normativa', grado: 'Todos', fecha: '10/01/2025', autor: 'Gran Logia', descripcion: 'Documento constitutivo de la Gran Logia' },
  { id: 2, titulo: 'Ritual del Primer Grado', categoria: 'Ritual', grado: 'Aprendiz', fecha: '15/01/2025', autor: 'Comité de Rituales', descripcion: 'Ritual oficial para el grado de Aprendiz' },
  { id: 3, titulo: 'Ritual del Segundo Grado', categoria: 'Ritual', grado: 'Compañero', fecha: '15/01/2025', autor: 'Comité de Rituales', descripcion: 'Ritual oficial para el grado de Compañero' },
  { id: 4, titulo: 'Ritual del Tercer Grado', categoria: 'Ritual', grado: 'Maestro', fecha: '15/01/2025', autor: 'Comité de Rituales', descripcion: 'Ritual oficial para el grado de Maestro' },
  { id: 5, titulo: 'Historia de la Masonería', categoria: 'Historia', grado: 'Todos', fecha: '20/02/2025', autor: 'Dr. Juan Martínez', descripcion: 'Compendio histórico de la masonería universal' },
  { id: 6, titulo: 'Simbolismo Masónico', categoria: 'Educación', grado: 'Todos', fecha: '05/03/2025', autor: 'Prof. Carlos Sánchez', descripcion: 'Estudio sobre los símbolos masónicos y su significado' },
  { id: 7, titulo: 'Reglamento Interno', categoria: 'Normativa', grado: 'Todos', fecha: '12/03/2025', autor: 'Comité de Legislación', descripcion: 'Reglamento interno de la logia' },
  { id: 8, titulo: 'Plancha sobre la Tolerancia', categoria: 'Trabajo', grado: 'Todos', fecha: '01/04/2025', autor: 'H∴ Miguel González', descripcion: 'Trabajo presentado sobre el valor de la tolerancia' },
];

export async function GET(request: NextRequest) {
  try {
    // En una implementación real, aquí verificaríamos la autenticación
    
    // Obtener parámetros de consulta (si los hay)
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');
    const grado = searchParams.get('grado');
    
    // Filtrar documentos según los parámetros
    let resultado = [...documentos];
    
    if (categoria) {
      resultado = resultado.filter(d => d.categoria.toLowerCase() === categoria.toLowerCase());
    }
    
    if (grado) {
      resultado = resultado.filter(d => d.grado.toLowerCase() === grado.toLowerCase() || d.grado === 'Todos');
    }
    
    return NextResponse.json({ documentos: resultado });
  } catch (error) {
    console.error('Error al obtener documentos:', error);
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
    if (!body.titulo || !body.categoria || !body.grado) {
      return NextResponse.json(
        { error: 'Se requieren campos obligatorios' },
        { status: 400 }
      );
    }
    
    // Crear nuevo documento (simulado)
    const nuevoDocumento = {
      id: documentos.length + 1,
      ...body,
      fecha: new Date().toLocaleDateString('es-ES')
    };
    
    // En una implementación real, aquí guardaríamos en la base de datos
    
    return NextResponse.json({ 
      mensaje: 'Documento subido con éxito',
      documento: nuevoDocumento 
    }, { status: 201 });
  } catch (error) {
    console.error('Error al subir documento:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
