# ═══════════════════════════════════════════════════════════════
# setup-supabase.ps1 — Setup automatizado do banco Supabase
# Executa: schema + RLS + auth trigger + seed
# Uso (PowerShell, dentro de crm-app/):
#   .\scripts\setup-supabase.ps1
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Setup Supabase — CRM Techmalhas" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Validar .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "ERRO: .env.local não encontrado." -ForegroundColor Red
    Write-Host "   Edite crm-app/.env.local com os valores do Supabase primeiro." -ForegroundColor Yellow
    exit 1
}

$envContent = Get-Content ".env.local" -Raw
if ($envContent -match "COLE_AQUI") {
    Write-Host "ERRO: .env.local ainda tem placeholders <<COLE_AQUI_*>>" -ForegroundColor Red
    Write-Host "   Substitua TODOS os valores antes de rodar este script." -ForegroundColor Yellow
    exit 1
}

if ($envContent -match "PREVIEW_MODE=true") {
    Write-Host "AVISO: PREVIEW_MODE ainda esta 'true' em .env.local" -ForegroundColor Yellow
    $answer = Read-Host "   Quer mudar para 'false' agora? (s/N)"
    if ($answer -eq "s" -or $answer -eq "S") {
        (Get-Content ".env.local") -replace "PREVIEW_MODE=true", "PREVIEW_MODE=false" | Set-Content ".env.local"
        Write-Host "   PREVIEW_MODE alterado para false" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "[1/4] Gerando Prisma Client..." -ForegroundColor Cyan
pnpm prisma generate
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "[2/4] Aplicando schema (migration 001)..." -ForegroundColor Cyan
pnpm prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "Falhou. Verifique se DATABASE_URL e DIRECT_URL estao corretos." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/4] Aplicando RLS e auth trigger..." -ForegroundColor Cyan
Write-Host ""
Write-Host "ATENCAO: Os arquivos abaixo precisam ser aplicados manualmente:" -ForegroundColor Yellow
Write-Host "   1. prisma/migrations/002_rls_policies.sql" -ForegroundColor Yellow
Write-Host "   2. prisma/migrations/003_auth_user_trigger.sql" -ForegroundColor Yellow
Write-Host ""
Write-Host "Como aplicar (mais facil):" -ForegroundColor White
Write-Host "   1. Abra https://supabase.com/dashboard" -ForegroundColor White
Write-Host "   2. Selecione seu projeto 'crm-techmalhas-prod'" -ForegroundColor White
Write-Host "   3. Va em 'SQL Editor' (icone de banco lateral)" -ForegroundColor White
Write-Host "   4. Cole o conteudo de cada arquivo .sql e clique 'Run'" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "Ja aplicou os 2 arquivos SQL no Supabase? (s/N)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "OK. Rode novamente este script depois de aplicar." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "[4/4] Populando banco com dados de exemplo (seed)..." -ForegroundColor Cyan
pnpm prisma:seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "Seed falhou (pode ser normal se ja foi rodado antes)." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  Setup concluido!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor White
Write-Host "  1. Reinicie o dev server: pnpm dev" -ForegroundColor White
Write-Host "  2. Acesse: http://localhost:3000/login" -ForegroundColor White
Write-Host "  3. Use o usuario admin criado pelo seed (veja saida acima)" -ForegroundColor White
Write-Host ""
