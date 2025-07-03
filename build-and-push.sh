#!/bin/bash

# Script para build e push da imagem Docker do NeoSale API

# Configurações
IMAGE_NAME="neosale-api"
DOCKER_USERNAME="brunobspaiva"  # Substitua pelo seu usuário do Docker Hub

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
    esac
    
    echo "$major.$minor.$patch"
}

# Verificar se deve incrementar versão
echo -e "${YELLOW}🔄 Deseja incrementar a versão automaticamente?${NC}"
echo "1) Patch (0.1.0 -> 0.1.1) - Correções de bugs"
echo "2) Minor (0.1.0 -> 0.2.0) - Novas funcionalidades"
echo "3) Major (0.1.0 -> 1.0.0) - Mudanças que quebram compatibilidade"
echo "4) Manter versão atual"
read -p "Escolha uma opção (1-4): " choice

# Extrair versão atual do package.json
if [ -f "package.json" ]; then
    CURRENT_VERSION=$(grep '"version"' package.json | sed 's/.*"version": "\(.*\)".*/\1/')
    echo -e "${GREEN}📋 Versão atual: $CURRENT_VERSION${NC}"
else
    echo -e "${RED}❌ Arquivo package.json não encontrado${NC}"
    exit 1
fi

# Processar escolha do usuário
case $choice in
    1)
        NEW_VERSION=$(increment_version $CURRENT_VERSION "patch")
        ;;
    2)
        NEW_VERSION=$(increment_version $CURRENT_VERSION "minor")
        ;;
    3)
        NEW_VERSION=$(increment_version $CURRENT_VERSION "major")
        ;;
    4)
        NEW_VERSION=$CURRENT_VERSION
        ;;
    *)
        echo -e "${RED}❌ Opção inválida. Mantendo versão atual.${NC}"
        NEW_VERSION=$CURRENT_VERSION
        ;;
esac

# Atualizar package.json se a versão mudou
if [ "$NEW_VERSION" != "$CURRENT_VERSION" ]; then
    echo -e "${YELLOW}📝 Atualizando package.json para versão $NEW_VERSION...${NC}"
    sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/g" package.json
    echo -e "${GREEN}✅ Versão atualizada no package.json${NC}"
    
    # Fazer commit das mudanças
    echo -e "${YELLOW}📝 Fazendo commit das mudanças...${NC}"
    
    # Gerar descrição automática baseada nas alterações
    git add .
    
    # Detectar tipos de alterações
    added_files=$(git diff --cached --name-status | grep "^A" | wc -l)
    modified_files=$(git diff --cached --name-status | grep "^M" | wc -l)
    deleted_files=$(git diff --cached --name-status | grep "^D" | wc -l)
    
    # Detectar alterações em arquivos específicos
    has_src_changes=$(git diff --cached --name-only | grep "^src/" | wc -l)
    has_test_changes=$(git diff --cached --name-only | grep -E "(test|spec)" | wc -l)
    has_doc_changes=$(git diff --cached --name-only | grep -E "\.(md|txt|rst)$" | wc -l)
    has_config_changes=$(git diff --cached --name-only | grep -E "\.(json|yml|yaml|env)$" | wc -l)
    has_docker_changes=$(git diff --cached --name-only | grep -E "(Dockerfile|docker-compose|build-and-push)" | wc -l)
    has_style_changes=$(git diff --cached --name-only | grep -E "\.(css|scss|less|style)" | wc -l)
    
    # Detectar se há mudanças no package.json (versão)
    has_version_change=$(git diff --cached --name-only | grep "package.json" | wc -l)
    
    # Determinar tipo de commit semântico
    commit_type="chore"
    
    # Prioridade: feat > fix > docs > style > refactor > test > chore
    if [ $added_files -gt 0 ] && [ $has_src_changes -gt 0 ]; then
        commit_type="feat"
    elif [ $has_src_changes -gt 0 ] && [ $modified_files -gt 0 ]; then
        # Verificar se é correção (palavras-chave em arquivos modificados)
        fix_keywords=$(git diff --cached | grep -i -E "(fix|bug|error|issue|problem|correct)" | wc -l)
        if [ $fix_keywords -gt 0 ]; then
            commit_type="fix"
        else
            commit_type="feat"
        fi
    elif [ $has_doc_changes -gt 0 ]; then
        commit_type="docs"
    elif [ $has_style_changes -gt 0 ]; then
        commit_type="style"
    elif [ $has_test_changes -gt 0 ]; then
        commit_type="test"
    elif [ $has_config_changes -gt 0 ] || [ $has_docker_changes -gt 0 ]; then
        commit_type="chore"
    fi
    
    # Gerar descrição baseada nas alterações
    commit_description=""
    
    if [ $has_src_changes -gt 0 ]; then
        if [ "$commit_type" = "feat" ]; then
            commit_description="${commit_description}novas funcionalidades, "
        elif [ "$commit_type" = "fix" ]; then
            commit_description="${commit_description}correções de bugs, "
        else
            commit_description="${commit_description}atualizações no código, "
        fi
    fi
    
    if [ $has_docker_changes -gt 0 ]; then
        commit_description="${commit_description}melhorias no Docker/deploy, "
    fi
    
    if [ $has_config_changes -gt 0 ]; then
        commit_description="${commit_description}ajustes de configuração, "
    fi
    
    if [ $has_doc_changes -gt 0 ]; then
        commit_description="${commit_description}atualizações na documentação, "
    fi
    
    if [ $has_test_changes -gt 0 ]; then
        commit_description="${commit_description}atualizações nos testes, "
    fi
    
    if [ $has_style_changes -gt 0 ]; then
        commit_description="${commit_description}ajustes de estilo, "
    fi
    
    if [ $added_files -gt 0 ]; then
        commit_description="${commit_description}${added_files} arquivo(s) adicionado(s), "
    fi
    
    if [ $modified_files -gt 0 ]; then
        commit_description="${commit_description}${modified_files} arquivo(s) modificado(s), "
    fi
    
    if [ $deleted_files -gt 0 ]; then
        commit_description="${commit_description}${deleted_files} arquivo(s) removido(s), "
    fi
    
    # Remover vírgula final e definir descrição padrão se vazia
    commit_description=$(echo "$commit_description" | sed 's/, $//')
    
    if [ -z "$commit_description" ]; then
        commit_description="atualização de versão e melhorias gerais"
    fi
    
    echo -e "${GREEN}📋 Tipo de commit: $commit_type${NC}"
    echo -e "${GREEN}📋 Descrição gerada: $commit_description${NC}"
    
    git commit -m "$commit_type: bump version to $NEW_VERSION - $commit_description"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Commit realizado com sucesso${NC}"
    else
        echo -e "${YELLOW}⚠️  Nenhuma mudança para commit ou erro no commit${NC}"
    fi
fi

VERSION=$NEW_VERSION
echo -e "${GREEN}🚀 Usando versão: $VERSION${NC}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando build da imagem Docker do NeoSale API${NC}"

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente.${NC}"
    exit 1
fi

# Build da imagem
echo -e "${YELLOW}📦 Fazendo build da imagem...${NC}"
docker build -t $IMAGE_NAME:$VERSION .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro no build da imagem${NC}"
    exit 1
fi

# Criar tags para o Docker Hub
echo -e "${YELLOW}🏷️  Criando tags para o Docker Hub...${NC}"
docker tag $IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:$VERSION
docker tag $IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:latest

echo -e "${GREEN}✅ Tags criadas: $VERSION e latest${NC}"

# Login no Docker Hub (opcional - descomente se necessário)
# echo -e "${YELLOW}🔐 Fazendo login no Docker Hub...${NC}"
# docker login

# Push para o Docker Hub
echo -e "${YELLOW}📤 Enviando imagem versionada para o Docker Hub...${NC}"
docker push $DOCKER_USERNAME/$IMAGE_NAME:$VERSION

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Versão $VERSION enviada com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao enviar versão $VERSION${NC}"
    exit 1
fi

echo -e "${YELLOW}📤 Enviando tag latest para o Docker Hub...${NC}"
docker push $DOCKER_USERNAME/$IMAGE_NAME:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Imagens enviadas com sucesso para o Docker Hub!${NC}"
    echo -e "${GREEN}📋 Versões disponíveis:${NC}"
    echo -e "${GREEN}   - $DOCKER_USERNAME/$IMAGE_NAME:$VERSION${NC}"
    echo -e "${GREEN}   - $DOCKER_USERNAME/$IMAGE_NAME:latest${NC}"
    echo -e "${GREEN}🚀 Para executar: docker run -p 3000:3000 $DOCKER_USERNAME/$IMAGE_NAME:$VERSION${NC}"
    
    # Deploy automático no EasyPanel
    echo -e "${YELLOW}🚀 Iniciando deploy automático no EasyPanel...${NC}"
    
    # Configurações do EasyPanel (ajuste conforme necessário)
    EASYPANEL_URL="https://evolution-api-neosale-api.mrzt3w.easypanel.host"
    EASYPANEL_PROJECT="neosale-api"
    EASYPANEL_TOKEN="seu_token_aqui"  # Token fixo no código
    
    # Verificar se o token está definido
    if [ -z "$EASYPANEL_TOKEN" ] || [ "$EASYPANEL_TOKEN" = "seu_token_aqui" ]; then
        echo -e "${YELLOW}⚠️  EASYPANEL_TOKEN não configurado. Pulando deploy automático.${NC}"
        echo -e "${YELLOW}💡 Para habilitar deploy automático, configure o token no arquivo build-and-push.sh${NC}"
    else
        # Fazer deploy via API do EasyPanel
        echo -e "${YELLOW}📡 Fazendo deploy da versão $VERSION no EasyPanel...${NC}"
        
        # Comando curl para trigger do deploy (ajuste conforme a API do EasyPanel)
        DEPLOY_RESPONSE=$(curl -s -X POST \
            -H "Authorization: Bearer $EASYPANEL_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"image\": \"$DOCKER_USERNAME/$IMAGE_NAME:$VERSION\",
                \"project\": \"$EASYPANEL_PROJECT\"
            }" \
            "$EASYPANEL_URL/api/deploy" 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Deploy iniciado com sucesso no EasyPanel!${NC}"
            echo -e "${GREEN}🌐 URL: $EASYPANEL_URL${NC}"
            echo -e "${GREEN}📦 Versão deployada: $VERSION${NC}"
        else
            echo -e "${YELLOW}⚠️  Não foi possível fazer deploy automático no EasyPanel${NC}"
            echo -e "${YELLOW}💡 Faça o deploy manual em: $EASYPANEL_URL${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Erro ao enviar tag latest${NC}"
    exit 1
fi

# Fazer push das mudanças para o repositório
echo -e "${YELLOW}📤 Fazendo push das mudanças para o repositório...${NC}"
git push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Push realizado com sucesso${NC}"
else
    echo -e "${YELLOW}⚠️  Erro no push ou nenhuma mudança para enviar${NC}"
fi

echo -e "${GREEN}✨ Processo concluído!${NC}"