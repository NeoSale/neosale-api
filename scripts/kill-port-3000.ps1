# Script para matar processos na porta 3000 antes de iniciar o servidor
Write-Host "Verificando processos na porta 3000..." -ForegroundColor Yellow

# Buscar processos na porta 3000
$processes = netstat -ano | findstr :3000

if ($processes) {
    Write-Host "Processos encontrados na porta 3000:" -ForegroundColor Red
    Write-Host $processes
    
    # Extrair PIDs dos processos
    $pids = $processes | ForEach-Object {
        if ($_ -match '\s+(\d+)\s*$') {
            $matches[1]
        }
    } | Sort-Object -Unique
    
    # Matar cada processo
    foreach ($processId in $pids) {
        if ($processId -and $processId -ne "0") {
            try {
                Write-Host "Matando processo PID: $processId" -ForegroundColor Yellow
                taskkill /PID $processId /F 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "Processo $processId finalizado com sucesso" -ForegroundColor Green
                } else {
                    Write-Host "Falha ao finalizar processo $processId" -ForegroundColor Red
                }
            } catch {
                Write-Host "Erro ao finalizar processo $processId - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    
    # Aguardar um momento para garantir que os processos foram finalizados
    Start-Sleep -Seconds 2
    
    # Verificar novamente
    $remainingProcesses = netstat -ano | findstr :3000
    if ($remainingProcesses) {
        Write-Host "Ainda existem processos na porta 3000:" -ForegroundColor Red
        Write-Host $remainingProcesses
    } else {
        Write-Host "Porta 3000 liberada com sucesso!" -ForegroundColor Green
    }
} else {
    Write-Host "Nenhum processo encontrado na porta 3000" -ForegroundColor Green
}

Write-Host "Iniciando servidor..." -ForegroundColor Cyan