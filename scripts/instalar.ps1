# SRC Shield — instalador (Windows / PowerShell).
#
# Adiciona o baseline de segurança ao SEU projeto: pipeline de CI, Dependabot,
# regras (SEGURANCA.md) e checklist. Não sobrescreve o que já existe.
# Leia antes de rodar — um instalador de segurança deve ser auditável.
#
# Uso (a partir da RAIZ do seu projeto, com o src-shield clonado ao lado):
#   git clone https://github.com/SamuelRCar/src-shield
#   cd meu-projeto
#   powershell -File ..\src-shield\scripts\instalar.ps1
#
# Ou aponte o destino:
#   powershell -File scripts\instalar.ps1 -Dest C:\caminho\meu-projeto
param([string]$Dest = (Get-Location).Path)

$ErrorActionPreference = "Stop"
$ShieldDir = Split-Path -Parent $PSScriptRoot

Write-Host "SRC Shield -> instalando em: $Dest"
if (-not (Test-Path $Dest)) { throw "Destino nao existe: $Dest" }

function Copiar($src, $dst) {
  $from = Join-Path $ShieldDir $src
  $to = Join-Path $Dest $dst
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $to) | Out-Null
  if (Test-Path $to) {
    Write-Host "  = ja existe, mantido: $dst (compare com $src)"
  } else {
    Copy-Item $from $to
    Write-Host "  + criado: $dst"
  }
}

Copiar "templates/consumer/.github/workflows/security.yml" ".github/workflows/security.yml"
Copiar "templates/consumer/.github/dependabot.yml"          ".github/dependabot.yml"
Copiar "governanca/SEGURANCA.md"                            "SEGURANCA.md"
Copiar "governanca/checklist-baseline.md"                   "checklist-baseline.md"
Copiar ".gitleaks.toml"                                     ".gitleaks.toml"

Write-Host ""
Write-Host "Pronto. Proximos passos:"
Write-Host "  1. Confira .github/workflows/security.yml (run-npm/run-pip, dependency-review)"
Write-Host "  2. Ajuste .github/dependabot.yml aos ecossistemas do projeto"
Write-Host "  3. Garanta que .env esta no .gitignore"
Write-Host "  4. Commit + PR -> o pipeline roda sozinho"
Write-Host "  5. Preencha o checklist-baseline.md antes do primeiro deploy"
Write-Host ""
Write-Host "Guia: https://github.com/SamuelRCar/src-shield/blob/main/COMO-APLICAR.md"
