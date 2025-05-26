#!/bin/bash

# Script para criar um superusuário no Django usando Docker

# Cores para melhor visualização
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Criando superusuário Django via Docker...${NC}"

# Definir credenciais padrão
USERNAME="admin"
EMAIL="admin@example.com"
PASSWORD="admin123"

# Verificar se o contêiner backend está rodando
if [ "$(docker-compose ps -q backend)" ]; then
    echo -e "${GREEN}Contêiner backend encontrado.${NC}"
    
    # Criar superusuário usando python manage.py
    echo -e "${YELLOW}Criando superusuário com:${NC}"
    echo -e "Username: ${GREEN}$USERNAME${NC}"
    echo -e "Email: ${GREEN}$EMAIL${NC}"
    echo -e "Password: ${GREEN}$PASSWORD${NC}"
    
    # Comando para criar superusuário sem interação
    docker-compose exec -T backend python -c "
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'luz_y_verdad.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

if not User.objects.filter(username='$USERNAME').exists():
    User.objects.create_superuser('$USERNAME', '$EMAIL', '$PASSWORD')
    print('Superusuário criado com sucesso!')
else:
    print('Superusuário já existe!')
"
    
    echo -e "${GREEN}Processo concluído!${NC}"
    echo -e "${YELLOW}Você pode acessar o painel administrativo em:${NC} http://localhost/admin"
    echo -e "${YELLOW}Use as credenciais:${NC}"
    echo -e "Username: ${GREEN}$USERNAME${NC}"
    echo -e "Password: ${GREEN}$PASSWORD${NC}"
else
    echo -e "${YELLOW}Contêiner backend não está rodando.${NC}"
    echo -e "${YELLOW}Iniciando contêineres...${NC}"
    
    # Iniciar contêineres
    docker-compose up -d
    
    # Aguardar o backend iniciar
    echo -e "${YELLOW}Aguardando o backend iniciar...${NC}"
    sleep 10
    
    # Tentar criar superusuário novamente
    echo -e "${YELLOW}Criando superusuário com:${NC}"
    echo -e "Username: ${GREEN}$USERNAME${NC}"
    echo -e "Email: ${GREEN}$EMAIL${NC}"
    echo -e "Password: ${GREEN}$PASSWORD${NC}"
    
    # Comando para criar superusuário sem interação
    docker-compose exec -T backend python -c "
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'luz_y_verdad.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

if not User.objects.filter(username='$USERNAME').exists():
    User.objects.create_superuser('$USERNAME', '$EMAIL', '$PASSWORD')
    print('Superusuário criado com sucesso!')
else:
    print('Superusuário já existe!')
"
    
    echo -e "${GREEN}Processo concluído!${NC}"
    echo -e "${YELLOW}Você pode acessar o painel administrativo em:${NC} http://localhost/admin"
    echo -e "${YELLOW}Use as credenciais:${NC}"
    echo -e "Username: ${GREEN}$USERNAME${NC}"
    echo -e "Password: ${GREEN}$PASSWORD${NC}"
fi
