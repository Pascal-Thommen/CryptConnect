import http.server
import os
import sys

os.chdir('/opt/data/workspace/CryptConnect/src')

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Service-Worker-Allowed', '/')
        super().end_headers()

server_address = ('0.0.0.0', 8080)
httpd = http.server.HTTPServer(server_address, Handler)
sys.stderr.write("READY:8080\n")
sys.stderr.flush()
httpd.serve_forever()
