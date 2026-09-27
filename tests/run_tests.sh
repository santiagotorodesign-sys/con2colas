#!/usr/bin/env bash
# run_tests.sh — ejecuta TODAS las pruebas unitarias e de integración del proyecto.
#
#   1) Python (unittest): scripts/qa_checker.py, scripts/update_context.py
#      y pruebas de integración DOM + navegador real (Chromium headless).
#   2) JavaScript (node --test): módulos puros ES (whatsappButton, lightboxUI,
#      icons, content).
#
# Uso:  bash tests/run_tests.sh   (o ./tests/run_tests.sh)
set -uo pipefail
cd "$(dirname "$0")/.."

echo "════════ Pruebas Python (unittest) ════════"
python3 -m unittest discover tests -v 2>&1 | grep -Ev "^❌|^✅" # silenciar prints esperados del QA
PY_STATUS=${PIPESTATUS[0]}

echo ""
echo "════════ Pruebas JS (node --test) ════════"
node --test tests/js/*.test.mjs
JS_STATUS=$?

echo ""
if [ "$PY_STATUS" -eq 0 ] && [ "$JS_STATUS" -eq 0 ]; then
  echo "✅ Todas las pruebas pasaron."
  exit 0
else
  echo "❌ Hubo pruebas fallidas (python=$PY_STATUS, js=$JS_STATUS)."
  exit 1
fi
