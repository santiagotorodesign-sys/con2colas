#!/usr/bin/env python3
"""
update_context.py — Agente actualizador de contexto para Con2colas.

Lee una fuente de datos (CSV o JSON) y:
  1. Actualiza docs/products.json (altas, precios, stock, descripciones conductuales).
  2. Regenera docs/faq.json con plantillas coherentes con brand-voice.md.
  3. Escribe un registro en data/update_log.txt.

Uso:
    python scripts/update_context.py --source data/products_data.csv
    python scripts/update_context.py --source data/products_source.json

Requisitos: pandas (solo para CSV). JSON nativo funciona sin dependencias.
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

# ------------------------------------------------------------------
# Rutas base del proyecto (el script vive en scripts/, raíz = parent)
# ------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT / "docs"
DATA_DIR = ROOT / "data"
PRODUCTS_JSON = DOCS_DIR / "products.json"
FAQ_JSON = DOCS_DIR / "faq.json"
LOG_FILE = DATA_DIR / "update_log.txt"

WHATSAPP_NUMBER = "56984024167"


# ------------------------------------------------------------------
# Utilidades
# ------------------------------------------------------------------
def now_iso() -> str:
    """Fecha/hora actual en ISO-8601 UTC."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def log(lines: list[str]) -> None:
    """Anexa el registro de la ejecución a data/update_log.txt."""
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    header = f"\n===== Ejecución {now_iso()} =====\n"
    with LOG_FILE.open("a", encoding="utf-8") as fh:
        fh.write(header + "\n".join(lines) + "\n")


def build_whatsapp_message(name: str) -> str:
    """Genera el mensaje de WhatsApp automático para un producto nuevo."""
    return f"Hola Con2colas! Me interesa el {name}. ¿Podrían asesorarme?"


# ------------------------------------------------------------------
# Carga de fuentes
# ------------------------------------------------------------------
def load_source(path: Path) -> list[dict]:
    """Lee la fuente de datos: CSV (pandas) o JSON. Valida filas."""
    if not path.exists():
        raise FileNotFoundError(f"No existe la fuente de datos: {path}")

    if path.suffix.lower() == ".csv":
        try:
            import pandas as pd  # noqa: WPS433 (import perezoso intencional)
        except ImportError:
            raise RuntimeError(
                "Falta 'pandas' para leer CSV. Instálalo con: pip install pandas"
            )
        df = pd.read_csv(path)
        records = df.to_dict(orient="records")
    elif path.suffix.lower() == ".json":
        raw = json.loads(path.read_text(encoding="utf-8"))
        records = raw.get("products", raw if isinstance(raw, list) else [])
    else:
        raise ValueError(f"Formato no soportado: {path.suffix} (usa .csv o .json)")

    return [clean_record(r) for r in records if r and r.get("name")]


def clean_record(rec: dict) -> dict:
    """Normaliza tipos y convierte tags 'a,b,c' en lista."""
    out = {k: v for k, v in rec.items() if str(v) != "nan"}
    if "price" in out:
        out["price"] = float(out["price"])
    if "stock" in out:
        out["stock"] = int(float(out["stock"]))
    if isinstance(out.get("tags"), str):
        out["tags"] = [t.strip() for t in out["tags"].split(",") if t.strip()]
    return out


# ------------------------------------------------------------------
# Validación (reglas de negocio)
# ------------------------------------------------------------------
def validate(product: dict) -> list[str]:
    """Devuelve lista de errores; vacío = producto válido."""
    errors = []
    name = product.get("name", "?")
    if not product.get("id"):
        errors.append(f"[{name}] falta 'id'")
    price = product.get("price")
    if price is None or float(price) < 0:
        errors.append(f"[{name}] precio inválido o negativo: {price}")
    stock = product.get("stock")
    if stock is None or int(stock) < 0:
        errors.append(f"[{name}] stock inválido o negativo: {stock}")
    return errors


# ------------------------------------------------------------------
# Actualización de products.json
# ------------------------------------------------------------------
FIELDS_TO_UPDATE = (
    "price", "stock", "behavioral_function", "sales_argument",
    "target_problem", "category", "line", "image_path", "tags",
)


def merge_products(existing: list[dict], incoming: list[dict]):
    """Aplica cambios; devuelve (lista_final, agregados, modificados)."""
    by_id = {p["id"]: p for p in existing if p.get("id")}
    added, modified = [], []

    for prod in incoming:
        pid = prod["id"]
        if pid not in by_id:
            prod.setdefault("whatsapp_message", build_whatsapp_message(prod["name"]))
            by_id[pid] = prod
            added.append(pid)
        else:
            target = by_id[pid]
            changed = [f for f in FIELDS_TO_UPDATE
                       if f in prod and target.get(f) != prod[f]]
            if changed:
                target.update({f: prod[f] for f in changed})
                modified.append(f"{pid} ({', '.join(changed)})")

    ordered = list(by_id.values())
    return ordered, added, modified


# ------------------------------------------------------------------
# Generación de faq.json (plantillas tono de marca)
# ------------------------------------------------------------------
CATEGORY_FAQ_TEMPLATES = {
    "Ansiedad por Separación": (
        "No es rebeldía ni venganza. Es una respuesta biológica al aburrimiento "
        "y la falta de enriquecimiento cognitivo. Su cerebro necesita estimulación "
        "y la masticación/lamiendo es una forma natural de liberar tensión."
    ),
    "Paseo Estructurado": (
        "Antes se creía que tirar de la correa era un problema de jerarquía, pero "
        "la ciencia muestra que suele ser dolor o sobrecarga ambiental. Un arnés "
        "en Y libera su anatomía y una correa larga le permite gestionar distancias."
    ),
    "Enriquecimiento Alimenticio": (
        "Comer rápido dispara el estrés. El enriquecimiento alimenticio convierte "
        "cada toma en trabajo cognitivo: lamer y masticar activa la calma real."
    ),
    "Dispositivos de Calma": (
        "El lamiendo repetitivo activa el sistema nervioso parasimpático y baja "
        "el pulso. No es un truco: es fisiología aplicada al bienestar."
    ),
}


def generate_faqs(products: list[dict]) -> list[dict]:
    """Construye FAQs desde problemas conductuales y categorías de productos."""
    faqs = []
    seen_questions = set()
    n = 1
    for prod in products:
        problems = [p.strip() for p in str(prod.get("target_problem", "")).split(",") if p.strip()]
        for problem in problems[:2]:  # máx. 2 FAQ por producto
            question = f"¿Cómo ayudo a mi perro con: {problem.lower()}?"
            if question in seen_questions:
                continue
            seen_questions.add(question)
            template = CATEGORY_FAQ_TEMPLATES.get(
                prod.get("category", ""),
                "Cada conducta tiene una función. Te ayudamos a entenderla y "
                "redirigirla con herramientas libres de aversivos.",
            )
            related = [other["id"] for other in products
                       if other.get("category") == prod.get("category")][:3]
            faqs.append({
                "id": f"faq-{n:03d}",
                "question": question,
                "category": prod.get("category", "General"),
                "answer": f"{template} Recomendamos: {prod['name']}.",
                "related_products": related,
                "tags": prod.get("tags", [])[:4],
            })
            n += 1
    return faqs


# ------------------------------------------------------------------
# Escritura de JSON
# ------------------------------------------------------------------
def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


# ------------------------------------------------------------------
# Main
# ------------------------------------------------------------------
def main() -> int:
    parser = argparse.ArgumentParser(description="Actualiza el contexto de Con2colas.")
    parser.add_argument("--source", required=True, help="Ruta a CSV o JSON de productos")
    args = parser.parse_args()

    source = Path(args.source)
    if not source.is_absolute():
        source = ROOT / source

    try:
        incoming = load_source(source)
    except (FileNotFoundError, ValueError, RuntimeError) as exc:
        print(f"❌ Error: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:  # formato incorrecto de CSV, etc.
        print(f"❌ Error leyendo {source}: {exc}", file=sys.stderr)
        return 1

    # Validación fila a fila
    valid, invalid_msgs = [], []
    for prod in incoming:
        errs = validate(prod)
        if errs:
            invalid_msgs.extend(errs)
        else:
            valid.append(prod)
    if invalid_msgs:
        print("⚠️  Filas descartadas:")
        for m in invalid_msgs:
            print(f"   - {m}")

    # Cargar catálogo actual (si existe)
    existing_products = []
    if PRODUCTS_JSON.exists():
        try:
            existing_products = json.loads(
                PRODUCTS_JSON.read_text(encoding="utf-8")).get("products", [])
        except json.JSONDecodeError:
            print("⚠️  products.json estaba mal formado; se regenera.")

    merged, added, modified = merge_products(existing_products, valid)

    write_json(PRODUCTS_JSON, {"products": merged, "last_updated": now_iso()})
    faqs = generate_faqs(merged)
    write_json(FAQ_JSON, {"faqs": faqs, "last_updated": now_iso()})

    summary = [
        f"Fuente: {source.relative_to(ROOT)} ({len(incoming)} filas)",
        f"Archivos actualizados: {PRODUCTS_JSON.relative_to(ROOT)}, {FAQ_JSON.relative_to(ROOT)}",
        f"Productos totales: {len(merged)} | Agregados: {len(added)} | Modificados: {len(modified)}",
        f"FAQs generadas: {len(faqs)}",
    ]
    if added:
        summary.append("Agregados: " + ", ".join(added))
    if modified:
        summary.append("Modificados: " + "; ".join(modified))
    log(summary)

    print("✅ Actualización completada:")
    for line in summary:
        print(f"   {line}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
