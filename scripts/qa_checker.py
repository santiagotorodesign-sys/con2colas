#!/usr/bin/env python3
"""
qa_checker.py — Sistema de verificación QA reutilizable.

Lee 'qa_checks.json' (en esta misma carpeta) y ejecuta cada check:
  - file_exists      : verifica que un archivo exista.
  - contains_text    : verifica que un archivo contenga una cadena.
  - not_contains_text: verifica que un archivo NO contenga una cadena.

Salida: ✅ verde por cada check aprobado, ❌ rojo por cada fallo,
y resumen final 'X/Y checks pasaron'.

Uso:  python qa_checker.py
Exit code: 0 si todo pasa, 1 si algún check falla o hay error de config.
"""

import json
import sys
from pathlib import Path

# Rutas base: todo relativo a la carpeta de este script
BASE_DIR = Path(__file__).resolve().parent.parent  # raíz del proyecto (scripts/)
CONFIG_PATH = BASE_DIR / "qa_checks.json"

# Códigos ANSI para colores en terminal
GREEN = "\033[92m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"


def load_checks(config_path: Path):
    """Carga el JSON de configuración de forma robusta."""
    if not config_path.exists():
        print(f"{RED}❌ No se encontró el archivo de configuración: {config_path}{RESET}")
        sys.exit(1)
    try:
        data = json.loads(config_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"{RED}❌ qa_checks.json está mal formado: {exc}{RESET}")
        sys.exit(1)

    checks = data.get("checks")
    if not isinstance(checks, list) or not checks:
        print(f"{RED}❌ Falta la clave 'checks' (lista no vacía) en qa_checks.json{RESET}")
        sys.exit(1)
    return checks


def read_file(path: Path):
    """Lee un archivo devolviendo su contenido, o None si no existe/es ilegible."""
    try:
        return path.read_text(encoding="utf-8")
    except (FileNotFoundError, UnicodeDecodeError, OSError):
        return None


def check_file_exists(check):
    target = BASE_DIR / check.get("path", "")
    return target.is_file(), f"No existe '{check.get('path')}'"


def check_contains_text(check):
    target = BASE_DIR / check.get("file", "")
    content = read_file(target)
    if content is None:
        return False, f"No se pudo leer '{check.get('file')}'"
    found = check.get("text", "") in content
    return found, f"Falta el texto '{check.get('text')}' en '{check.get('file')}'"


def check_not_contains_text(check):
    target = BASE_DIR / check.get("file", "")
    content = read_file(target)
    if content is None:
        # Si el archivo no existe, trivialmente NO contiene el texto prohibido.
        return True, ""
    present = check.get("text", "") in content
    return (not present), f"El texto prohibido '{check.get('text')}' sigue en '{check.get('file')}'"


DISPATCH = {
    "file_exists": check_file_exists,
    "contains_text": check_contains_text,
    "not_contains_text": check_not_contains_text,
}


def main():
    checks = load_checks(CONFIG_PATH)
    passed = 0

    print(f"\n{BOLD}── QA Report ──────────────────────────────{RESET}")
    for i, check in enumerate(checks, start=1):
        ctype = check.get("type")
        desc = check.get("description", "(sin descripción)")

        runner = DISPATCH.get(ctype)
        if runner is None:
            print(f"{RED}❌ [{i}] Tipo de check desconocido: '{ctype}' — {desc}{RESET}")
            continue

        try:
            ok, reason = runner(check)
        except Exception as exc:  # nunca romper el reporte por un check
            ok, reason = False, f"Error inesperado: {exc}"

        if ok:
            passed += 1
            print(f"{GREEN}✅ [{i}] {desc}{RESET}")
        else:
            print(f"{RED}❌ [{i}] {desc} → {reason}{RESET}")

    total = len(checks)
    color = GREEN if passed == total else RED
    print(f"{BOLD}──────────────────────────────────────────{RESET}")
    print(f"{color}{BOLD}{passed}/{total} checks pasaron{RESET}\n")
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
