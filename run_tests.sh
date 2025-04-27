#!/bin/bash

# Script para ejecutar pruebas del Sistema de Gestión Masónica "Luz y Verdad"
# Este script ejecuta pruebas tanto del backend (Django) como del frontend (React)

echo "=== Iniciando pruebas del Sistema de Gestión Masónica 'Luz y Verdad' ==="
echo ""

# Directorio base del proyecto
BASE_DIR="$(pwd)"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/frontend"

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar mensajes de estado
show_status() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ ÉXITO${NC}: $2"
  else
    echo -e "${RED}✗ ERROR${NC}: $2"
    FAILED=1
  fi
}

# Variable para rastrear si alguna prueba falló
FAILED=0

echo -e "${YELLOW}=== Pruebas del Backend (Django) ===${NC}"

# Activar entorno virtual
echo "Activando entorno virtual..."
cd $BACKEND_DIR
source venv/bin/activate

# Instalar dependencias de prueba si no están instaladas
echo "Verificando dependencias de prueba..."
pip install pytest pytest-django pytest-cov > /dev/null 2>&1
show_status $? "Instalación de dependencias de prueba"

# Ejecutar pruebas de Django
echo "Ejecutando pruebas del módulo de autenticación..."
python -m pytest authentication/tests.py -v
AUTH_STATUS=$?
show_status $AUTH_STATUS "Pruebas del módulo de autenticación"

echo "Ejecutando pruebas del módulo de tesorería..."
python -m pytest treasury/tests.py -v
TREASURY_STATUS=$?
show_status $TREASURY_STATUS "Pruebas del módulo de tesorería"

echo "Ejecutando pruebas del módulo de miembros..."
python -m pytest members/tests.py -v
MEMBERS_STATUS=$?
show_status $MEMBERS_STATUS "Pruebas del módulo de miembros"

echo "Ejecutando pruebas del módulo de comunicaciones..."
python -m pytest communications/tests.py -v
COMMS_STATUS=$?
show_status $COMMS_STATUS "Pruebas del módulo de comunicaciones"

echo "Ejecutando pruebas del módulo de rituales..."
python -m pytest rituals/tests.py -v
RITUALS_STATUS=$?
show_status $RITUALS_STATUS "Pruebas del módulo de rituales"

echo "Ejecutando pruebas del módulo de biblioteca..."
python -m pytest library/tests.py -v
LIBRARY_STATUS=$?
show_status $LIBRARY_STATUS "Pruebas del módulo de biblioteca"

echo "Ejecutando pruebas del módulo de administración..."
python -m pytest core/tests.py -v
CORE_STATUS=$?
show_status $CORE_STATUS "Pruebas del módulo de administración"

# Generar informe de cobertura
echo "Generando informe de cobertura del backend..."
python -m pytest --cov=. --cov-report=html:coverage_report
show_status $? "Generación de informe de cobertura"

# Desactivar entorno virtual
deactivate

echo ""
echo -e "${YELLOW}=== Pruebas del Frontend (React) ===${NC}"

# Cambiar al directorio del frontend
cd $FRONTEND_DIR

# Instalar dependencias si es necesario
echo "Verificando dependencias del frontend..."
npm install > /dev/null 2>&1
show_status $? "Instalación de dependencias del frontend"

# Ejecutar pruebas de React
echo "Ejecutando pruebas del módulo de autenticación..."
npm test -- src/pages/__tests__/auth.test.js
AUTH_FE_STATUS=$?
show_status $AUTH_FE_STATUS "Pruebas del módulo de autenticación (frontend)"

echo "Ejecutando pruebas del módulo de tesorería..."
npm test -- src/pages/__tests__/treasury.test.js
TREASURY_FE_STATUS=$?
show_status $TREASURY_FE_STATUS "Pruebas del módulo de tesorería (frontend)"

echo "Ejecutando pruebas del módulo de miembros..."
npm test -- src/pages/__tests__/members.test.js
MEMBERS_FE_STATUS=$?
show_status $MEMBERS_FE_STATUS "Pruebas del módulo de miembros (frontend)"

# Generar informe de cobertura del frontend
echo "Generando informe de cobertura del frontend..."
npm test -- --coverage
show_status $? "Generación de informe de cobertura del frontend"

echo ""
echo -e "${YELLOW}=== Resumen de Pruebas ===${NC}"

# Mostrar resumen de resultados
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ Todas las pruebas se ejecutaron correctamente${NC}"
  echo ""
  echo "Informes de cobertura disponibles en:"
  echo "  - Backend: $BACKEND_DIR/coverage_report/index.html"
  echo "  - Frontend: $FRONTEND_DIR/coverage/lcov-report/index.html"
else
  echo -e "${RED}✗ Algunas pruebas fallaron. Revise los detalles anteriores.${NC}"
fi

echo ""
echo "=== Pruebas completadas ==="
