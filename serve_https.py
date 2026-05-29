import http.server
import ssl
import os
import sys

os.chdir('/opt/data/workspace/CryptConnect/src')

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Service-Worker-Allowed', '/')
        super().end_headers()

port = 8443
for p in [8443, 8444, 8445, 8446, 8447, 8448, 8449, 8450]:
    try:
        server_address = ('0.0.0.0', p)
        httpd = http.server.HTTPServer(server_address, Handler)
        port = p
        break
    except OSError:
        continue

ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ctx.load_cert_chain('/opt/data/workspace/CryptConnect/certs/cert.pem',
                    '/opt/data/workspace/CryptConnect/certs/key.pem')
httpd.socket = ctx.wrap_socket(httpd.socket, server_side=True)

sys.stderr.write(f"READY:{port}\n")
sys.stderr.flush()
httpd.serve_forever()
