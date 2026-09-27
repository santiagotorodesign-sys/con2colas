"""Servidor HTTP personalizado para Con2colas.

Redirige la raíz (/) hacia src/index.html y sirve estáticos desde la raíz
del proyecto (necesario porque el HTML usa rutas relativas ../public/...).
Evita el listado de directorios de python -m http.server.
"""
import http.server
import socketserver

PORT = 8000


class Handler(http.server.SimpleHTTPRequestHandler):
    """Redirige / a /src/index.html y desactiva el directory listing."""

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            self.send_response(302)
            self.send_header("Location", "/src/index.html")
            self.end_headers()
            return
        # Bloquear listado de directorios para cualquier otra carpeta
        import os
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            self.send_error(404, "Directory listing disabled")
            return
        return super().do_GET()

    def log_message(self, fmt, *args):
        pass  # silenciar log por request


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Con2colas server en http://localhost:{PORT}/ -> /src/index.html")
        httpd.serve_forever()
