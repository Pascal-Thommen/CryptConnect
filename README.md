CONTEXT & INSTRUCTIONS FOR HERMES AI AGENT

Project: Crypt Connect (CC) — High-Fidelity Demo (Paraguay & DeFi)

Repository: https://github.com/Pascal-Thommen/CryptConnect

Deployment: GitHub -> Portainer -> Docker (Nginx)

1. System Rolle & Entwicklungsauftrag

Du bist ein erfahrener Full-Stack-Softwareentwickler. Dein Auftrag ist es, das Repository unter https://github.com/Pascal-Thommen/CryptConnect mit einer voll funktionsfähigen, optisch überragenden und interaktiven Web-App als Progressive Web App (PWA) für Android-Geräte zu befüllen.

Die App läuft als reine Client-Side-Demo (kein echtes Backend, alle Aktionen werden im Browser lokal hochgradig realistisch simuliert), muss jedoch absolut robust, fehlerfrei und mathematisch präzise funktionieren, um das Vertrauen von Investoren zu gewinnen.

2. Erwartete Repository-Struktur

Erstelle und deploye im Repository folgende Ordner- und Dateistruktur:

/
├── Dockerfile              # Leichtgewichtiges Nginx-alpine Image
├── nginx.conf              # SPA-Routing & Header-Konfiguration
└── src/
    ├── index.html          # Die gesamte App (Single-File Mandat für HTML/JS/CSS)
    ├── manifest.json       # PWA-Konfiguration für die Android-Installation
    └── sw.js               # Service Worker für Offline-Caching


Docker-Konfigurationsvorlagen

Dockerfile

FROM nginx:alpine
COPY ./src /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


nginx.conf

events { worker_connections 1024; }
http {
    include mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;

    server {
        listen 80;
        server_name localhost;

        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
        }
    }
}


PWA-Konfigurationsvorlagen

manifest.json (in /src)

{
  "short_name": "CryptConnect",
  "name": "Crypt Connect Paraguay",
  "icons": [
    {
      "src": "https://img.icons8.com/color/192/000000/double-ring.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "https://img.icons8.com/color/512/000000/double-ring.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": "/index.html",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "display": "standalone",
  "orientation": "portrait"
}


sw.js (in /src)

const CACHE_NAME = 'cc-v1';
const ASSETS = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://unpkg.com/lucide@latest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});


3. Geschäfts- & Steuerregeln für Paraguay (100% Pflicht)

Rule A: Das Dual-Welten-System (Ohne PIN-Barriere)

Die App startet direkt im Dashboard (kein PIN- oder Biometrie-Sperrbildschirm, um die Präsentation flüssig zu halten) und teilt sich visuell und farblich nahtlos in zwei getrennte Welten auf (Wechsel per Tab-Umschalter im Header):

Welt 1: "Krypto-Wallet"

Design: Hochmodernes DeFi-Design im Dark-Mode (Slate-, Indigo- und Violett-Töne).

Features: Echte Live-Preise, Senden, Empfangen, Swaps, Rendite-Anzeigen.

Welt 2: "Banca Paraguay"

Design: Traditionelles, vertrauenswürdiges Online-Banking im Light-Mode (Smaragdgrün- und Weiß-Nuancen).

Features: Guaraníes (Gs.) Kontostand, kostenlose Überweisungen, Inlands-Zahlungsverkehr.

Rule B: Echte Krypto-Live-Preise & API-Anbindung

Die App darf keine statischen oder rein fiktiven Krypto-Preise verwenden.

Frage beim Laden der Seite (und optional alle 30 Sekunden im Hintergrund) über eine kostenfreie, schlüssellose öffentliche API (wie z. B. https://min-api.cryptocompare.com/data/price?fsym=...&tsyms=USD) die echten aktuellen USD-Wechselkurse für:

Bitcoin (BTC)

Digitaler Euro (EURC / EUR)

Digitaler Schweizer Franken (dCHF / CHF)

Tether (USDT)

Die im Dashboard angezeigte Gesamtsumme der Konten darf keine fiktive Zahl sein. Sie muss sich mathematisch absolut präzise aus der Summe deiner tatsächlichen Krypto-Bestände multipliziert mit den abgerufenen Live-Preisen (umgerechnet in USD oder Gs. mit dem festen Kurs von $1 \text{ USD} = 7.500 \text{ Gs.}$) zusammensetzen.

Rule C: Paraguayische Steuerlogik (DNIT / e-kuatia konform)

Gebührenfreie Transaktionen:

Überweisungen innerhalb des paraguayischen Bankensystems (Gs. zu Gs.) sind zu $0\%$ kostenfrei.

Interne CC-zu-CC Transfers (Senden an andere User via E-Mail/Telefon) sind komplett kostenlos ($0\%$ CC-Gebühr).

Gebührenpflichtige Transaktionen:

Krypto senden & empfangen (extern) sowie Krypto $\leftrightarrow$ Gs. Bankkonto (Ein-/Auszahlungen) kosten $1\%$ CC-Servicegebühr + Netzwerkgebühren.

Diese $1\%$ Gebühr beinhaltet die paraguayische Gesetzsteuer IVA (Mehrwertsteuer) von 10%.

Mathematische Formeln zur Steuerberechnung:


$$\text{Servicegebühr} = \text{Transaktionsbetrag} \times 0.01$$

$$\text{Enthaltene IVA (10\%)} = \frac{\text{Servicegebühr}}{11}$$

Das "Steuer-Center" (Centro de Facturación):

Jede kostenpflichtige Aktion generiert einen Beleg im e-kuatia-Stil (RUC, Timbrado-Nummer, detaillierte MwSt.-Aufschlüsselung mit Gravadas 10% und IVA 10%).

Biete die Funktion "Monatsabrechnung simulieren" an: Sie konsolidiert alle angefallenen Einzelgebühren des Monats zu einer einzigen steuerlich korrekten Sammel-Factura (Factura Resumen).

Rule D: Virtuelle Debitkarte & Kaskaden-Fallback (Strikte Limits)

Visualisiere eine minimalistische, hochmoderne virtuelle Debitkarte (Guaraníes-basiert) im cleanen Design ohne fremde Markenlogos.

Platziere darunter einen Button "Zu Google Pay hinzufügen" (im Google-konformen Design).

Echte Karte (Keine App-Überweisungen): Die Karte ist eine normale Bezahlkarte. Sie wird nicht für Überweisungen innerhalb der App genutzt, sondern extern beim POS-Terminal (Point of Sale), in Onlineshops oder bei Google Pay.

Zahlungsquellen-Manager (Prioritäten-Kaskade) mit strikter Mathematik:

Der User legt in den Einstellungen die Priorität fest (z. B. 1. Gs.-Konto, 2. USDT, 3. dCHF, 4. BTC).

Bei der Simulation eines Einkaufs (z. B. "Kaffee für 20.000 Gs." oder ein größerer Einkauf) prüft die App die Kaskade. Ist das Gs.-Konto leer, konvertiert sie automatisch den Gegenwert aus dem Krypto-Topf an Priorität 2 (inklusive der $1\%$ Umrechnungsgebühr).

Strikte mathematische Grenze: Wenn das Guthaben der ausgewählten Zahlungsquelle (inkl. Gebühren) nicht ausreicht, wird die Zahlung rigoros abgelehnt ("Transacción Rechazada - Fondos Insuficientes"). Es gibt keine fiktive Überziehung! Der Benutzer kann maximal das ausgeben, was er tatsächlich besitzt.

Rule E: Demo QR-Code (Sicherheit)

Wenn der Nutzer auf "Empfangen" klickt, wird ein QR-Code auf dem Bildschirm gerendert.

Dieser QR-Code muss im codierten Inhalt unmissverständlich als Demo gekennzeichnet sein (z. B. Textinhalt: demo:cryptconnect_0.001_btc oder demo:address_123456789), um zu zeigen, dass es sich um eine absolut sichere Testumgebung handelt und niemand versehentlich echte Gelder dorthin sendet.

Rule F: Passive DeFi-Rendite (3% APY)

Auf vertrauenswürdige Stablecoins (USDT, EURC, dCHF) sowie BTC gewährt CC eine jährliche Rendite von $3\%$ APY, ohne das Guthaben sperren zu müssen.

Visualisierung: Ein animierter Zähler auf dem Dashboard lässt die akkumulierte Rendite im Sekundentakt anwachsen (im LocalStorage gesichert).

Integriere Chart.js für ein Liniendiagramm, das die prognostizierte Renditeentwicklung über 12 Monate zeigt.

Rule G: Krumme, realistische Demo-Daten

Beim ersten App-Start müssen im LocalStorage folgende voreingestellte Werte geladen werden:

Bankkonto (Gs.): 3.141.500 Gs.

Krypto-Wallet (Gegenwert ca. 20.000.000 Gs. basierend auf den Live-Preisen):

Bitcoin (BTC): 0.0241 BTC

Digitaler Euro (EURC): 650 EURC

Digitaler Schweizer Franken (dCHF): 530 dCHF

Tether (USDT): 100 USDT

Rule H: Mehrsprachigkeit (i18n)

Fliegender Sprachwechsel ohne Neuladen zwischen Spanisch (Standard), Englisch und Deutsch.

Sämtliche Texte, Fehlermeldungen und simulierten Facturas müssen dynamisch aus einem zentralen Translation-Object in JavaScript geladen werden.
