// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Simulación de usuarios para demostración
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Administrador' },
  { id: 2, username: 'venerable', password: 'vm2025', role: 'venerable', name: 'Venerable Maestro' },
  { id: 3, username: 'secretario', password: 'sec2025', role: 'secretario', name: 'Secretario' },
  { id: 4, username: 'tesorero', password: 'tes2025', role: 'tesorero', name: 'Tesorero' },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validación básica
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Se requiere nombre de usuario y contraseña' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // En una implementación real, aquí generaríamos un JWT
    // Por ahora, simplemente devolvemos los datos del usuario (excepto la contraseña)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token: `demo-token-${user.id}-${Date.now()}`,
    });
  } catch (error) {
    console.error('Error en autenticación:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
