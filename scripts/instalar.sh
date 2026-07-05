#!/usr/bin/env bash
# SRC Shield — instalador (Linux/macOS/Git Bash).
#
# Adiciona o baseline de segurança ao SEU projeto: o pipeline de CI, o Dependabot,
# as regras (SEGURANCA.md) e o checklist. Não sobrescreve arquivos existentes
# sem avisar. Leia antes de rodar — um instalador de segurança deve ser auditável.
#
# Uso (a partir da RAIZ do seu projeto, com o src-shield clonado ao lado):
#   git clone https://github.com/SamuelRCar/src-shield
#   cd meu-projeto
#   bash ../src-shield/scripts/instalar.sh
#
# Ou aponte o destino explicitamente:
#   bash scripts/instalar.sh /caminho/do/meu-projeto
set -euo pipefail

SHIELD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${1:-$(pwd)}"

echo "SRC Shield → instalando em: $DEST"
[ -d "$DEST" ] || { echo "ERRO: destino não existe: $DEST"; exit 1; }

copiar() { # origem destino
  local src="$SHIELD_DIR/$1" dst="$DEST/$2"
  mkdir -p "$(dirname "$dst")"
  if [ -e "$dst" ]; then
    echo "  = já existe, mantido: $2 (compare com $1)"
  else
    cp "$src" "$dst"
    echo "  + criado: $2"
  fi
}

copiar "templates/consumer/.github/workflows/security.yml" ".github/workflows/security.yml"
copiar "templates/consumer/.github/dependabot.yml"          ".github/dependabot.yml"
copiar "governanca/SEGURANCA.md"                            "SEGURANCA.md"
copiar "governanca/checklist-baseline.md"                   "checklist-baseline.md"
copiar ".gitleaks.toml"                                     ".gitleaks.toml"

echo
echo "Pronto. Próximos passos:"
echo "  1. Confira .github/workflows/security.yml (run-npm/run-pip, dependency-review)"
echo "  2. Ajuste .github/dependabot.yml aos ecossistemas do projeto"
echo "  3. Garanta que .env está no .gitignore (segredos nunca no Git)"
echo "  4. Faça commit e abra um PR — o pipeline roda sozinho"
echo "  5. Preencha o checklist-baseline.md antes do primeiro deploy público"
echo
echo "Guia completo: https://github.com/SamuelRCar/src-shield/blob/main/COMO-APLICAR.md"
