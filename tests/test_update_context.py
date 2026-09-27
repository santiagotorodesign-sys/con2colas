#!/usr/bin/env python3
"""
Pruebas unitarias para scripts/update_context.py.

Cubren: clean_record, validate, merge_products, generate_faqs,
load_source (JSON) y build_whatsapp_message.

Ejecución:
    python -m unittest discover tests -v
"""

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODULE_PATH = ROOT / "scripts" / "update_context.py"
_spec = importlib.util.spec_from_file_location("update_context", MODULE_PATH)
uc = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(uc)


class TestBuildWhatsappMessage(unittest.TestCase):
    def test_message_format(self):
        msg = uc.build_whatsapp_message("Kong Classic")
        self.assertEqual(
            msg, "Hola Con2colas! Me interesa el Kong Classic. ¿Podrían asesorarme?"
        )


class TestCleanRecord(unittest.TestCase):
    def test_converts_nan_fields_to_absent(self):
        rec = {"name": "X", "price": "12.5", "stock": float("nan"), "tags": "a, b"}
        out = uc.clean_record(rec)
        self.assertNotIn("stock", out)
        self.assertEqual(out["price"], 12.5)

    def test_normalizes_price_and_stock_types(self):
        out = uc.clean_record({"name": "X", "price": "999", "stock": "7.0"})
        self.assertIsInstance(out["price"], float)
        self.assertIsInstance(out["stock"], int)
        self.assertEqual(out["stock"], 7)

    def test_splits_tags_string_into_list(self):
        out = uc.clean_record({"name": "X", "tags": "ansiedad, , masticar ,"})
        self.assertEqual(out["tags"], ["ansiedad", "masticar"])

    def test_leaves_list_tags_untouched(self):
        out = uc.clean_record({"name": "X", "tags": ["a", "b"]})
        self.assertEqual(out["tags"], ["a", "b"])


class TestValidate(unittest.TestCase):
    def base_product(self, **overrides):
        p = {"id": "p1", "name": "Test", "price": 100, "stock": 5}
        p.update(overrides)
        return p

    def test_valid_product_has_no_errors(self):
        self.assertEqual(uc.validate(self.base_product()), [])

    def test_missing_id_flagged(self):
        errors = uc.validate(self.base_product(id=""))
        self.assertTrue(any("falta 'id'" in e for e in errors))

    def test_negative_price_flagged(self):
        errors = uc.validate(self.base_product(price=-1))
        self.assertTrue(any("precio" in e for e in errors))

    def test_missing_price_flagged(self):
        errors = uc.validate({"id": "p1", "name": "Test", "stock": 1})
        self.assertTrue(any("precio" in e for e in errors))

    def test_negative_stock_flagged(self):
        errors = uc.validate(self.base_product(stock=-3))
        self.assertTrue(any("stock" in e for e in errors))

    def test_zero_price_and_stock_are_valid(self):
        self.assertEqual(uc.validate(self.base_product(price=0, stock=0)), [])


class TestMergeProducts(unittest.TestCase):
    def test_new_product_is_added_with_whatsapp_message(self):
        incoming = [{"id": "n1", "name": "Nuevo", "price": 10, "stock": 1}]
        merged, added, modified = uc.merge_products([], incoming)
        self.assertEqual(added, ["n1"])
        self.assertEqual(modified, [])
        self.assertEqual(len(merged), 1)
        self.assertIn("whatsapp_message", merged[0])

    def test_existing_product_gets_updated_fields(self):
        existing = [{"id": "a1", "name": "Viejo", "price": 100, "stock": 5}]
        incoming = [{"id": "a1", "name": "NO SE DEBE CAMBIAR", "price": 80}]
        merged, added, modified = uc.merge_products(existing, incoming)
        self.assertEqual(added, [])
        self.assertEqual(len(modified), 1)
        self.assertIn("price", modified[0])
        target = next(p for p in merged if p["id"] == "a1")
        self.assertEqual(target["price"], 80)
        # 'name' no está en FIELDS_TO_UPDATE: no se toca
        self.assertEqual(target["name"], "Viejo")

    def test_no_changes_means_not_modified(self):
        existing = [{"id": "a1", "name": "P", "price": 10, "stock": 1}]
        incoming = [{"id": "a1", "name": "P", "price": 10, "stock": 1}]
        _, added, modified = uc.merge_products(existing, incoming)
        self.assertEqual((added, modified), ([], []))

    def test_products_without_id_do_not_break_merge(self):
        existing = [{"name": "sin-id"}, {"id": "ok", "name": "OK"}]
        merged, _, _ = uc.merge_products(existing, [])
        ids = [p.get("id") for p in merged]
        self.assertIn("ok", ids)


class TestGenerateFaqs(unittest.TestCase):
    def test_generates_max_two_faqs_per_product(self):
        products = [{
            "id": "p1",
            "name": "LickiMat",
            "category": "Dispositivos de Calma",
            "target_problem": "ansiedad, aburrimiento, destructivo",
            "tags": ["calma"],
        }]
        faqs = uc.generate_faqs(products)
        self.assertEqual(len(faqs), 2)  # máximo 2 por producto
        self.assertIn("ansiedad", faqs[0]["question"].lower())
        self.assertTrue(faqs[0]["id"].startswith("faq-"))

    def test_duplicate_questions_are_deduplicated(self):
        products = [
            {"id": "p1", "name": "A", "category": "General",
             "target_problem": "tirones", "tags": []},
            {"id": "p2", "name": "B", "category": "General",
             "target_problem": "tirones", "tags": []},
        ]
        faqs = uc.generate_faqs(products)
        questions = [f["question"] for f in faqs]
        self.assertEqual(len(questions), len(set(questions)))

    def test_answer_includes_recommended_product(self):
        products = [{"id": "p1", "name": "Kong", "category": "Otra",
                     "target_problem": "ansiedad", "tags": []}]
        faqs = uc.generate_faqs(products)
        self.assertIn("Recomendamos: Kong.", faqs[0]["answer"])

    def test_related_products_share_category(self):
        products = [
            {"id": "p1", "name": "A", "category": "Cat", "target_problem": "x", "tags": []},
            {"id": "p2", "name": "B", "category": "Cat", "target_problem": "y", "tags": []},
            {"id": "p3", "name": "C", "category": "Otra", "target_problem": "z", "tags": []},
        ]
        faqs = uc.generate_faqs(products)
        by_question = {f["question"]: f for f in faqs}
        # FAQs de productos 'Cat' → relacionados solo con productos 'Cat'
        self.assertEqual(by_question["¿Cómo ayudo a mi perro con: x?"]["related_products"],
                         ["p1", "p2"])
        self.assertEqual(by_question["¿Cómo ayudo a mi perro con: y?"]["related_products"],
                         ["p1", "p2"])
        # FAQ del producto de otra categoría → se relaciona consigo misma
        self.assertEqual(by_question["¿Cómo ayudo a mi perro con: z?"]["related_products"],
                         ["p3"])

    def test_empty_target_problem_yields_no_faqs(self):
        products = [{"id": "p1", "name": "A", "category": "C", "tags": []}]
        self.assertEqual(uc.generate_faqs(products), [])


class TestLoadSourceJson(unittest.TestCase):
    def test_loads_wrapped_products_list(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "products.json"
            src.write_text(json.dumps({"products": [
                {"id": "p1", "name": "Uno", "price": "10", "stock": "2"},
                {"name": ""},          # sin nombre -> descartada
                None,                  # vacía -> descartada
            ]}), encoding="utf-8")
            records = uc.load_source(src)
            self.assertEqual(len(records), 1)
            self.assertEqual(records[0]["price"], 10.0)

    def test_loads_bare_list_documented_known_limitation(self):
        """Nota: load_source() llama a raw.get(...) sin comprobar si raw es
        lista, por lo que un JSON raíz tipo lista falla con AttributeError.
        Este test fija el comportamiento ACTUAL como documentación viva;
        si se corrige el bug (soportar lista raíz), debe actualizarse."""
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "list.json"
            src.write_text(json.dumps([{"id": "p1", "name": "Uno"}]), encoding="utf-8")
            with self.assertRaises(AttributeError):
                uc.load_source(src)

    def test_missing_file_raises(self):
        with self.assertRaises(FileNotFoundError):
            uc.load_source(Path("/no/existe.json"))

    def test_unsupported_extension_raises(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "data.xml"
            src.write_text("<x/>", encoding="utf-8")
            with self.assertRaises(ValueError):
                uc.load_source(src)


class TestWriteJson(unittest.TestCase):
    def test_creates_dirs_and_utf8_output(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "sub" / "dir" / "salida.json"
            uc.write_json(out, {"mensaje": "ñ á ü"})
            content = out.read_text(encoding="utf-8")
            self.assertIn("ñ á ü", content)  # ensure_ascii=False
            self.assertTrue(content.endswith("\n"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
