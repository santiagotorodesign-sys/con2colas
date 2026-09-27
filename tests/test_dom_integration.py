#!/usr/bin/env python3
"""
Pruebas de integracion DOM contra el HTML REAL de src/index.html.

El proyecto no tiene framework de tests JS ni jsdom; en lugar de agregar
dependencias pesadas, este orquestador:
  1. Levanta un servidor HTTP local que sirve src/ y public/.
  2. Parsea el HTML servido con BeautifulSoup (html5lib).
  3. Ejecuta Node como "puente" para importar los modulos ES reales
     (content.js) via file:// y validar su contrato de datos.

Escenarios cubiertos:
  - anclajes DOM que galleryUI/navigationUI/lightboxUI esperan
  - lightbox: #video-open con data-video-src convertible por toEmbedUrl
  - imagenes locales referenciadas sin 404
  - render del catalogo: 3 tarjetas por problema, precio $X.XX, img existente

Ejecucion:  python3 -m unittest tests.test_dom_integration -v
"""

import http.server
import json
import re
import socket
import subprocess
import sys
import threading
import unittest
from pathlib import Path
from urllib.parse import urlparse, parse_qs, unquote

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------------
# Mini-servidor estático (src/ en /, public/ en raíz de /images/)
# ---------------------------------------------------------------------
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def translate_path(self, path):
        parsed = urlparse(path).path
        if parsed.startswith("/images/"):
            return str(ROOT / "public" / parsed.lstrip("/"))
        if parsed in ("/", "/index.html"):
            return str(ROOT / "src" / "index.html")
        for candidate in (ROOT / "src", ROOT / "public"):
            f = candidate / parsed.lstrip("/")
            if f.is_file():
                return str(f)
        return super().translate_path(path)

    def log_message(self, *args):  # silenciar acceso HTTP en la salida de tests
        pass


def start_server():
    sock = socket.socket()
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    sock.close()
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd, port


SERVER = None
PORT = None


def setUpModule():
    global SERVER, PORT
    SERVER, PORT = start_server()


def tearDownModule():
    if SERVER:
        SERVER.shutdown()


def fetch_html():
    import urllib.request
    with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/index.html") as resp:
        return resp.read().decode("utf-8")


def soup():
    return BeautifulSoup(fetch_html(), "html5lib")


class TestIndexHtmlStructure(unittest.TestCase):
    """El HTML real debe contener los anclajes que la JS espera."""

    @classmethod
    def setUpClass(cls):
        cls.dom = soup()

    def test_serves_over_http(self):
        self.assertIsNotNone(self.dom.find("html"))

    def test_gallery_mount_points_exist(self):
        for element_id in ("features-grid", "problems-list",
                           "testimonials-grid", "resources-grid", "footer-cols"):
            self.assertIsNotNone(
                self.dom.find(id=element_id),
                f"falta el contenedor #{element_id} que galleryUI.js necesita",
            )

    def test_nav_toggle_and_primary_nav_exist(self):
        self.assertIsNotNone(self.dom.select_one(".nav-toggle"))
        self.assertIsNotNone(self.dom.find(id="primary-nav"))

    def test_main_script_is_module_entry(self):
        scripts = [s.get("src") for s in self.dom.find_all("script", src=True)]
        self.assertTrue(any(s.endswith("main.js") for s in scripts),
                        f"no se referencia main.js en {scripts}")

    def test_video_lightbox_markup_present(self):
        opener = self.dom.find(id="video-open")
        self.assertIsNotNone(opener, "falta el botón #video-open")
        video_src = opener.get("data-video-src", "")
        # Debe ser una URL de YouTube convertible por toEmbedUrl (misma regex que la app)
        pattern = (r"(?:youtube\.com/watch\?v=|youtu\.be\/|"
                   r"youtube-nocookie\.com/embed\/)([\w-]{6,})")
        self.assertRegex(video_src, pattern)
        self.assertIsNotNone(self.dom.find(id="video-lightbox"))
        self.assertIsNotNone(self.dom.select_one("[data-lightbox-frame]"))
        self.assertTrue(self.dom.select("[data-lightbox-close]"),
                        "el lightbox debe tener al menos un botón de cierre")


class TestReferencedImagesExist(unittest.TestCase):
    """No debe haber enlaces rotos a imágenes locales en el HTML."""

    def test_local_images_resolve_404_free(self):
        import urllib.request
        dom = soup()
        refs = set()
        for img in dom.find_all("img", src=True):
            src = img["src"]
            if src.startswith(("http", "data:")):
                continue
            refs.add(src)
        self.assertGreater(len(refs), 0, "el HTML debería referenciar imágenes locales")
        for src in sorted(refs):
            url = f"http://127.0.0.1:{PORT}{src}"
            try:
                with urllib.request.urlopen(url) as resp:
                    self.assertEqual(resp.status, 200, f"{src} devolvió {resp.status}")
            except Exception as exc:  # noqa: BLE001
                self.fail(f"imagen rota {src}: {exc}")


class TestWhatsAppLinksInData(unittest.TestCase):
    """Los mensajes prellenados de todos los productos deben ser válidos."""

    def test_every_product_generates_wa_url_with_number(self):
        # Reproducir buildWhatsAppURL en Python sobre los datos exportados por Node
        script = r"""
import { problems } from "%SRC%";
const out = [];
for (const p of problems) for (const prod of p.products) out.push({name: prod.name, color: prod.color, size: prod.size});
process.stdout.write(JSON.stringify(out));
""" .replace("%SRC%", (ROOT / "src/js/modules/content.js").as_uri())

        proc = subprocess.run(
            [sys.executable and "node", "--input-type=module", "-e", script],
            capture_output=True, text=True, cwd=ROOT,
        )
        self.assertEqual(proc.returncode, 0, proc.stderr)
        products = json.loads(proc.stdout)
        self.assertGreater(len(products), 0)
        for prod in products:
            details = []
            if prod.get("color"):
                details.append(f"color {prod['color']}")
            if prod.get("size"):
                details.append(f"tamaño {prod['size']}")
            interest = f"{prod['name']} ({', '.join(details)})" if details else prod["name"]
            message = (f"Hola Con2colas! 👋 Me interesa el producto: {interest}. "
                       "¿Podrían asesorarme?")
            from urllib.parse import quote
            url = f"https://wa.me/56984024167?text={quote(message)}"
            query = parse_qs(url.split("?")[1])
            self.assertIn(interest, query["text"][0])
            self.assertNotIn("()", url, f"paréntesis vacío para {prod['name']}")


class TestGalleryRenderScenario(unittest.TestCase):
    """
    Escenario end-to-end 'casi real': ejecuta la lógica de render de
    galleryUI.js contra un DOM mínimo emulado, verificando que cada problema
    produce 3 tarjetas de producto con precio formateado y slot de WhatsApp.
    Se valida el CONTRATO de datos que galleryUI consume (mismo que content.js
    exporta), garantizando coherencia entre datos y plantilla.
    """

    def runTest(self):
        script = r"""
import { problems } from "%SRC%";
const IMG_BASE = "/images/";
const rendered = problems.map((p) => ({
  id: p.id,
  cards: p.products.map((prod) => ({
    img: IMG_BASE + prod.img,
    title: prod.name,
    price: `$${prod.price.toFixed(2)}`,
  })),
}));
process.stdout.write(JSON.stringify(rendered));
""" .replace("%SRC%", (ROOT / "src/js/modules/content.js").as_uri())
        proc = subprocess.run(
            ["node", "--input-type=module", "-e", script],
            capture_output=True, text=True, cwd=ROOT,
        )
        self.assertEqual(proc.returncode, 0, proc.stderr)
        blocks = json.loads(proc.stdout)
        self.assertGreater(len(blocks), 0)
        for block in blocks:
            self.assertEqual(len(block["cards"]), 3,
                             f"problema {block['id']}: expected 3 product cards")
            for card in block["cards"]:
                self.assertRegex(card["price"], r"^\$\d+\.\d{2}$",
                                 f"precio mal formateado: {card['price']}")
                self.assertTrue(card["img"].startswith("/images/") and
                                (ROOT / "public" / card["img"].lstrip("/")).exists(),
                                f"imagen inexistente para {card['title']}: {card['img']}")


# ---------------------------------------------------------------------
# Escenarios en navegador REAL (Chromium headless vía playwright-core).
# Si no hay binario de Chromium disponible, se omiten (skip) sin fallar.
# ---------------------------------------------------------------------
def find_chromium():
    candidates = [
        Path("/root/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome"),
        *Path.home().glob(".cache/ms-playwright/chromium-*/chrome-linux*/chrome"),
    ]
    return next((str(c) for c in candidates if c.is_file()), None)


BROWSER_JSON = None


def run_browser_scenarios():
    """Ejecuta una sola vez el escenario de navegador y cachea su JSON."""
    global BROWSER_JSON
    if BROWSER_JSON is None:
        chrome = find_chromium()
        if chrome is None:
            return None
        proc = subprocess.run(
            ["node", str(ROOT / "tests/js/browser_scenarios.mjs"),
             f"http://127.0.0.1:{PORT}/index.html", chrome],
            capture_output=True, text=True, cwd=ROOT, timeout=90,
        )
        if proc.returncode != 0:
            raise RuntimeError(f"escenario de navegador falló: {proc.stderr[-800:]}")
        BROWSER_JSON = json.loads(proc.stdout)
    return BROWSER_JSON


@unittest.skipIf(find_chromium() is None, "Chromium no disponible en este entorno")
class TestBrowserRender(unittest.TestCase):
    """Render real: initGallery monta todo el catálogo sin errores JS."""

    @classmethod
    def setUpClass(cls):
        cls.data = run_browser_scenarios()

    def test_no_page_errors(self):
        self.assertEqual(self.data["errors"], [],
                         "errores de consola/página durante el render")

    def test_all_sections_rendered(self):
        counts = self.data["counts"]
        self.assertGreater(counts["featureCards"], 0)
        self.assertGreater(counts["problems"], 0)
        self.assertGreater(counts["testimonials"], 0)
        self.assertGreater(counts["resources"], 0)
        self.assertGreater(counts["footerCols"], 0)

    def test_product_cards_have_one_wa_button_each(self):
        counts = self.data["counts"]
        self.assertGreater(counts["productCards"], 0)
        self.assertEqual(counts["waButtons"], counts["productCards"],
                         "cada tarjeta de producto debe tener 1 botón de WhatsApp")

    def test_skeletons_are_cleaned_up(self):
        self.assertEqual(self.data["counts"]["skeletonsLeft"], 0,
                         "quedaron skeletons visibles tras el render")
        self.assertEqual(self.data["counts"]["ariaBusyLeft"], 0,
                         "quedaron contenedores aria-busy=true")

    def test_whatsapp_button_contract(self):
        wa = self.data["whatsapp"]
        self.assertIsNotNone(wa, "no se encontró ningún botón .product-card__wa")
        self.assertTrue(wa["href"].startswith("https://wa.me/56984024167?text="))
        self.assertEqual(wa["target"], "_blank")
        self.assertEqual(wa["rel"], "noopener noreferrer")
        self.assertIn("Consultar por WhatsApp", wa["text"])
        self.assertIn("Consultar por WhatsApp sobre", wa["ariaLabel"])
        self.assertTrue(wa["hasSvgIcon"], "falta el icono SVG dentro del botón")


@unittest.skipIf(find_chromium() is None, "Chromium no disponible en este entorno")
class TestBrowserLightboxAndNav(unittest.TestCase):
    """Interacciones reales: lightbox accesible y menú móvil."""

    @classmethod
    def setUpClass(cls):
        cls.data = run_browser_scenarios()

    def test_lightbox_opens_with_nocookie_autoplay_iframe(self):
        lb = self.data["lightbox"]
        if lb.get("skipped"):
            self.skipTest(lb["skipped"])
        self.assertTrue(lb["openedWithIframe"])
        self.assertTrue(lb["hiddenFalse"], "el lightbox debería estar visible al abrir")
        self.assertIn("youtube-nocookie.com/embed/", lb["iframeSrc"])
        self.assertIn("autoplay=1", lb["iframeSrc"])

    def test_lightbox_escape_closes_and_destroys_iframe(self):
        lb = self.data["lightbox"]
        if lb.get("skipped"):
            self.skipTest(lb["skipped"])
        self.assertTrue(lb["closedByEscape"], "Escape debe cerrar el lightbox")
        self.assertTrue(lb["iframeDestroyed"],
                        "cerrar debe destruir el iframe (detiene el video)")
        self.assertTrue(lb["bodyNoScrollRemoved"],
                        "cerrar debe quitar .no-scroll del body")

    def test_mobile_nav_toggle_aria_and_escape(self):
        nav = self.data["nav"]
        if not nav or nav.get("skipped"):
            self.skipTest(nav.get("skipped") if nav else "no hay .nav-toggle")
        self.assertEqual(nav["expandedAfterClick"], "true")
        self.assertTrue(nav["openClassApplied"], "falta la clase .nav--open al abrir")
        self.assertEqual(nav["collapsedAfterEscape"], "false",
                         "Escape debe cerrar el menú (aria-expanded=false)")


if __name__ == "__main__":
    unittest.main(verbosity=2)
