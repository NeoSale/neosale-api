#!/bin/bash

# Script para incrementar versão automaticamente sem interação
# Uso: bash version-bump.sh [patch|minor|major]

# Configurações
VERSION_TYPE=${1:-patch}  # Default para patch se não especificado

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para incrementar versão
increment_version() {
    local version=$1
    local type=$2
    
    IFS='.' read -ra ADDR <<< "$version"
    major=${ADDR[0]}
    minor=${ADDR[1]}
    patch=${ADDR[2]}
    
    case $type in
        "major")
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        "minor")
            minor=$((minor + 1))
            patch=0
            ;;
        "patch")
            patch=$((patch + 1))
            ;;
        *)
            echo -e "${RED}❌ Tipo de versão inválido: $type${NC}"
            echo "Tipos válidos: patch, minor, major"
            exit 1
            ;;
    esac
    
    echo "$major.$minor.$patch"
}

echo -e "${GREEN}🔄 Incrementando versão ($VERSION_TYPE)...${NC}"

# Extrair versão atual do package.json
if [ -f "package.json" ]; then
    CURRENT_VERSION=$(grep '"version"' package.json | sed 's/.*"version": "\(.*\)".*/\1/')
    echo -e "${GREEN}📋 Versão atual: $CURRENT_VERSION${NC}"
else
    echo -e "${RED}❌ Arquivo package.json não encontrado${NC}"
    exit 1
fi

# Calcular nova versão
NEW_VERSION=$(increment_version $CURRENT_VERSION $VERSION_TYPE)

# Atualizar package.json
echo -e "${YELLOW}📝 Atualizando package.json para versão $NEW_VERSION...${NC}"
sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/g" package.json

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Versão atualizada com sucesso!${NC}"
    echo -e "${GREEN}🚀 Nova versão: $NEW_VERSION${NC}"
    
    # Opcional: fazer commit automático
    if command -v git &> /dev/null; then
        echo -e "${YELLOW}📝 Fazendo commit da nova versão...${NC}"
        git add package.json
        git commit -m "chore: bump version to $NEW_VERSION"
        echo -e "${GREEN}✅ Commit realizado${NC}"
    fi
else
    echo -e "${RED}❌ Erro ao atualizar package.json${NC}"
    exit 1
fi

echo -e "${GREEN}✨ Processo concluído!${NC}"
echo -e "${YELLOW}💡 Agora você pode executar: bash build-and-push.sh${NC}"