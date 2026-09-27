#!/usr/bin/env python3
"""
Pruebas unitarias para scripts/qa_checker.py.

Ejecución:
    python -m unittest discover tests -v
o bien:
    python tests/test_qa_checker.py
"""

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

# ---------------------------------------------------------------------
# Carga el módulo qa_checker.py desde scripts/ (no es un paquete instalable)
# ---------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
MODULE_PATH = ROOT / "scripts" / "qa_checker.py"
_spec = importlib.util.spec_from_file_location("qa_checker", MODULE_PATH)
qa = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(qa)


class TestLoadChecks(unittest.TestCase):
    """Carga robusta de la configuración qa_checks.json."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.cfg = Path(self.tmp.name) / "qa_checks.json"

    def _write(self, payload):
        if isinstance(payload, str):
            self.cfg.write_text(payload, encoding="utf-8")
        else:
            self.cfg.write_text(json.dumps(payload), encoding="utf-8")

    def test_returns_checks_list(self):
        self._write({"checks": [{"type": "file_exists", "path": "x"}]})
        checks = qa.load_checks(self.cfg)
        self.assertEqual(checks, [{"type": "file_exists", "path": "x"}])

    def test_missing_config_exits_1(self):
        with self.assertRaises(SystemExit) as ctx:
            qa.load_checks(Path(self.tmp.name) / "no_existe.json")
        self.assertEqual(ctx.exception.code, 1)

    def test_malformed_json_exits_1(self):
        self._write("{ esto no es json ")
        with self.assertRaises(SystemExit) as ctx:
            qa.load_checks(self.cfg)
        self.assertEqual(ctx.exception.code, 1)

    def test_missing_checks_key_exits_1(self):
        self._write({"otra_cosa": []})
        with self.assertRaises(SystemExit) as ctx:
            qa.load_checks(self.cfg)
        self.assertEqual(ctx.exception.code, 1)

    def test_empty_checks_list_exits_1(self):
        self._write({"checks": []})
        with self.assertRaises(SystemExit) as ctx:
            qa.load_checks(self.cfg)
        self.assertEqual(ctx.exception.code, 1)


class TestReadFile(unittest.TestCase):
    def test_reads_existing_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            f = Path(tmp) / "a.txt"
            f.write_text("hola", encoding="utf-8")
            self.assertEqual(qa.read_file(f), "hola")

    def test_returns_none_for_missing_file(self):
        self.assertIsNone(qa.read_file(Path("/ruta/inexistente/x.txt")))

    def test_returns_none_for_binary_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            f = Path(tmp) / "bin.dat"
            f.write_bytes(b"\xff\xfe\x00invalid-utf8")
            self.assertIsNone(qa.read_file(f))


class TestCheckFileExists(unittest.TestCase):
    def setUp(self):
        # Aísla BASE_DIR para trabajar dentro de un directorio temporal
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name)
        self._orig_base = qa.BASE_DIR
        qa.BASE_DIR = self.base
        self.addCleanup(setattr, qa, "BASE_DIR", self._orig_base)

    def test_existing_file_passes(self):
        (self.base / "f.txt").write_text("x", encoding="utf-8")
        ok, _ = qa.check_file_exists({"path": "f.txt"})
        self.assertTrue(ok)

    def test_missing_file_fails_with_reason(self):
        ok, reason = qa.check_file_exists({"path": "no-existe.txt"})
        self.assertFalse(ok)
        self.assertIn("no-existe.txt", reason)

    def test_directory_is_not_a_file(self):
        (self.base / "dir").mkdir()
        ok, _ = qa.check_file_exists({"path": "dir"})
        self.assertFalse(ok)

    def test_empty_path_fails(self):
        ok, _ = qa.check_file_exists({})
        self.assertFalse(ok)


class TestCheckContainsText(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name)
        self._orig_base = qa.BASE_DIR
        qa.BASE_DIR = self.base
        self.addCleanup(setattr, qa, "BASE_DIR", self._orig_base)

    def test_found_text_passes(self):
        (self.base / "a.txt").write_text("uno dos tres", encoding="utf-8")
        ok, _ = qa.check_contains_text({"file": "a.txt", "text": "dos"})
        self.assertTrue(ok)

    def test_missing_text_fails_with_reason(self):
        (self.base / "a.txt").write_text("uno", encoding="utf-8")
        ok, reason = qa.check_contains_text({"file": "a.txt", "text": "cuatro"})
        self.assertFalse(ok)
        self.assertIn("cuatro", reason)

    def test_unreadable_file_fails(self):
        ok, reason = qa.check_contains_text({"file": "fantasma.txt", "text": "x"})
        self.assertFalse(ok)
        self.assertIn("No se pudo leer", reason)

    def test_match_is_case_sensitive(self):
        (self.base / "a.txt").write_text("Hola", encoding="utf-8")
        ok, _ = qa.check_contains_text({"file": "a.txt", "text": "hola"})
        self.assertFalse(ok)


class TestCheckNotContainsText(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name)
        self._orig_base = qa.BASE_DIR
        qa.BASE_DIR = self.base
        self.addCleanup(setattr, qa, "BASE_DIR", self._orig_base)

    def test_absent_text_passes(self):
        (self.base / "a.txt").write_text("limpio", encoding="utf-8")
        ok, _ = qa.check_not_contains_text({"file": "a.txt", "text": "prohibido"})
        self.assertTrue(ok)

    def test_present_text_fails(self):
        (self.base / "a.txt").write_text("contiene secreto", encoding="utf-8")
        ok, reason = qa.check_not_contains_text({"file": "a.txt", "text": "secreto"})
        self.assertFalse(ok)
        self.assertIn("prohibido", reason)

    def test_missing_file_trivially_passes(self):
        ok, _ = qa.check_not_contains_text({"file": "no-existe.txt", "text": "x"})
        self.assertTrue(ok)


class TestDispatchTable(unittest.TestCase):
    def test_supports_the_three_documented_types(self):
        self.assertEqual(
            set(qa.DISPATCH),
            {"file_exists", "contains_text", "not_contains_text"},
        )

    def test_dispatched_functions_are_callable(self):
        for fn in qa.DISPATCH.values():
            self.assertTrue(callable(fn))


class TestRealProjectConfig(unittest.TestCase):
    """Humo: la configuración real del proyecto debe ser válida y pasar."""

    def test_project_qa_checks_all_pass(self):
        cfg = ROOT / "qa_checks.json"
        self.assertTrue(cfg.exists(), "qa_checks.json debería existir en la raíz")
        original_base = qa.BASE_DIR
        try:
            qa.BASE_DIR = ROOT
            checks = qa.load_checks(cfg)
            for check in checks:
                runner = qa.DISPATCH.get(check.get("type"))
                self.assertIsNotNone(runner, f"tipo desconocido: {check.get('type')}")
                ok, reason = runner(check)
                self.assertTrue(ok, f"check falló: {check} → {reason}")
        finally:
            qa.BASE_DIR = original_base


if __name__ == "__main__":
    unittest.main(verbosity=2)
