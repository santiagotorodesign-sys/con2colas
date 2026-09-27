"""Servidor HTTP personalizado para Con2colas.

Sirve el sitio desde src/ (index.html, css/, js/) y publica las imagenes
de public/images/ en la ruta /images/. Sin redirecciones 302 (compatible
con proxys/tuneles que no los siguen) y sin listado de directorios.
"""
import http.server
import socketserver
import os

PORT = 8000
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
IMAGES = os.path.join(ROOT, "public", "images")


class Handler(http.server.SimpleHTTPRequestHandler):
    """Mapea / -> src/index.html e /images/* -> public/images/*."""

    def translate_path(self, path):
        clean = path.split("?", 1)[0].split("#", 1)[0]
        if clean in ("/", "/index.html"):
            return os.path.join(SRC, "index.html")
        if clean.startswith("/images/"):
            return os.path.join(IMAGES, clean[len("/images/"):])
        # Rutas relativas del HTML: ./css/..., ./js/... viven en src/
        return os.path.join(SRC, clean.lstrip("/"))

    def do_GET(self):
        full = self.translate_path(self.path)
        allowed = (SRC + os.sep, IMAGES + os.sep)
        if not full.startswith(allowed) or not os.path.isfile(full):
            self.send_error(404, "Not found")
            return
        return super().do_GET()

    def log_message(self, fmt, *args):
        pass  # silenciar log por request


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Con2colas server en http://localhost:{PORT}/ (raiz -> src/index.html)")
        httpd.serve_forever()
