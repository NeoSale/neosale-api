# Script PowerShell para iniciar Docker no Windows
# Uso: .\scripts\start-docker.ps1

Write-Host "Docker Status Check" -ForegroundColor Cyan

# Funcao para verificar se Docker esta rodando
function Test-DockerRunning {
    try {
        $null = docker info 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Funcao para verificar se Docker Desktop esta instalado
function Test-DockerInstalled {
    $dockerPaths = @(
        "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe",
        "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe",
        "${env:LOCALAPPDATA}\Docker\Docker Desktop.exe"
    )
    
    foreach ($path in $dockerPaths) {
        if (Test-Path $path) {
            return $path
        }
    }
    return $null
}

# Funcao para iniciar Docker Desktop
function Start-DockerDesktop {
    param([string]$DockerPath)
    
    Write-Host "Iniciando Docker Desktop..." -ForegroundColor Yellow
    
    try {
        # Inicia Docker Desktop em background
        Start-Process -FilePath $DockerPath -WindowStyle Hidden
        Write-Host "Docker Desktop foi iniciado" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Erro ao iniciar Docker Desktop: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Funcao para aguardar Docker ficar disponivel
function Wait-ForDocker {
    param(
        [int]$MaxAttempts = 30,
        [int]$IntervalSeconds = 2
    )
    
    Write-Host "Aguardando Docker ficar disponivel..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        Write-Host "Tentativa $i/$MaxAttempts" -ForegroundColor Gray
        
        if (Test-DockerRunning) {
            Write-Host "Docker esta pronto!" -ForegroundColor Green
            return $true
        }
        
        if ($i -lt $MaxAttempts) {
            Write-Host "Aguardando ${IntervalSeconds}s..." -ForegroundColor Gray
            Start-Sleep -Seconds $IntervalSeconds
        }
    }
    
    Write-Host "Timeout: Docker nao ficou disponivel em $($MaxAttempts * $IntervalSeconds) segundos" -ForegroundColor Red
    return $false
}

# Script principal
try {
    # Verifica se Docker ja esta rodando
    if (Test-DockerRunning) {
        Write-Host "Docker ja esta rodando!" -ForegroundColor Green
        exit 0
    }
    
    # Verifica se Docker Desktop esta instalado
    $dockerPath = Test-DockerInstalled
    if (-not $dockerPath) {
        Write-Host "Docker Desktop nao foi encontrado!" -ForegroundColor Red
        Write-Host "Por favor, instale o Docker Desktop:" -ForegroundColor Yellow
        Write-Host "   https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
        exit 1
    }
    
    Write-Host "Docker Desktop encontrado em: $dockerPath" -ForegroundColor Green
    
    # Tenta iniciar Docker Desktop
    if (-not (Start-DockerDesktop -DockerPath $dockerPath)) {
        throw "Falha ao iniciar Docker Desktop"
    }
    
    # Aguarda Docker ficar disponivel
    if (-not (Wait-ForDocker)) {
        throw "Docker nao ficou disponivel no tempo esperado"
    }
    
    Write-Host "Docker esta pronto para uso!" -ForegroundColor Green
    exit 0
    
}
catch {
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "" 
    Write-Host "Instrucoes manuais:" -ForegroundColor Yellow
    Write-Host "   - Abra o Docker Desktop manualmente" -ForegroundColor White
    Write-Host "   - Verifique se o Docker esta instalado corretamente" -ForegroundColor White
    Write-Host "   - Reinicie o computador se necessario" -ForegroundColor White
    Write-Host "   - Execute como Administrador se houver problemas de permissao" -ForegroundColor White
    exit 1
}