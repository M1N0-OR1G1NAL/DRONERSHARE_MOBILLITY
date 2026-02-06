# Implementační dokumentace - DroneShare Mobility Platform

## Přehled implementovaných funkcí

### 1. Výběr trasy (RouteSelection)
**Soubor:** `frontend/src/components/RouteSelection/`

**Funkce:**
- Interaktivní Google Maps mapa
- Kliknutí na mapu pro výběr bodu A (start) a bodu B (cíl)
- Automatický výpočet trasy pomocí Google Directions API
- Zobrazení vzdálenosti a odhadovaného času letu
- Možnost resetování trasy

**Technické detaily:**
- Použití `@react-google-maps/api` pro React integraci
- DirectionsService pro výpočet trasy
- DirectionsRenderer pro zobrazení trasy na mapě
- Automatické spuštění výpočtu po výběru obou bodů

### 2. Real-time lokalizace dronu (DroneTracking)
**Soubor:** `frontend/src/components/DroneTracking/`

**Funkce:**
- Real-time sledování pozice dronu na mapě
- Telemetrie dronu (pozice, výška, baterie, rychlost)
- Start/Stop sledování
- Aktualizace každé 2 sekundy (simulované - v produkci WebSocket)

**Technické detaily:**
- Vlastní marker ikona pro dron (modrý kroužek)
- Barevné kódování stavu baterie (zelená/oranžová/červená)
- setInterval pro simulaci real-time dat
- Auto-center mapy na pozici dronu

### 3. Platby a rezervace (Payment)
**Soubor:** `frontend/src/components/Payment/`

**Funkce:**
- Výběr data a času rezervace
- Výběr doby pronájmu (30min - 2h)
- Automatický výpočet ceny (100 CZK / 30 min)
- Platba kartou nebo PayPal
- Formulář pro údaje platební karty

**Technické detaily:**
- Validace formuláře
- Dynamický výpočet ceny dle doby pronájmu
- Podmíněné zobrazení platebních metod
- Připraven pro integraci platební brány

### 4. Správa dronů (DroneManagement)
**Soubor:** `frontend/src/components/DroneManagement/`

**Funkce:**
- Přehled dronů s detaily (ID, baterie, dolet, nosnost)
- Status dronu (dostupný, v provozu, nabíjení, údržba)
- Seznam dokovacích stanic
- Vizualizace obsazenosti doků
- Progress bar pro baterii

**Technické detaily:**
- Dva taby: Drony a Dokovací stanice
- Barevné kódování statusů
- Grid layout pro responzivní design
- Vizuální indikátory obsazených/volných míst v docích

### 5. Kontrola oprávnění (Authorization)
**Soubor:** `frontend/src/components/Authorization/`

**Funkce:**
- Zadání čísla pilotní licence
- Ověření licence (simulované API call)
- Zobrazení výsledku (platná/vypršelá/čekající)
- Seznam požadavků pro provoz dronů

**Technické detaily:**
- Mock API call s timeoutem 1.5s
- Barevné kódování stavu licence
- Informativní sekce o požadavcích
- Validace vstupu

### 6. Fotokontrola (PhotoControl)
**Soubor:** `frontend/src/components/PhotoControl/`

**Funkce:**
- Fotografie před letem (min. 3)
- Fotografie po letu (min. 3)
- Využití webové kamery (MediaDevices API)
- Upload souborů z disku
- Náhled a mazání fotek
- Kontrola minimálního počtu fotek

**Technické detaily:**
- Navigator.mediaDevices pro přístup ke kameře
- FileReader pro upload souborů
- Canvas pro zachycení snímku z videa
- Two-phase workflow (před/po letu)
- Timestamp pro každou fotku

### 7. Legislativní kontrola (Legislative)
**Soubor:** `frontend/src/components/Legislative/`

**Funkce:**
- Kontrola parametrů letu (hmotnost, výška)
- Ověření pojištění a licence
- Kontrola lokace (zakázané zóny)
- Přehled letových zón (otevřená/omezená/zakázaná)
- Seznam legislativních požadavků

**Technické detaily:**
- Validace vstupu podle EU nařízení 2019/947
- Max. hmotnost 25kg (kategorie Open)
- Max. výška 120m
- Detekce restricted keywords v lokaci
- Barevné kódování výsledků (zelená/červená)

## Technický stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript 4.9.5** - Type safety
- **@react-google-maps/api 2.20.3** - Google Maps integrace
- **react-router-dom 7.1.3** - Routing (připraveno)

### Build & Development
- **Create React App** - Build tooling
- **Node.js 14+** - Runtime
- **npm/yarn** - Package management

## Spuštění projektu

### Development
```bash
cd frontend
npm install
cp .env.example .env
# Nastavte REACT_APP_GOOGLE_MAPS_API_KEY
npm start
```

### Production build
```bash
npm run build
```

### Testování
```bash
npm test
```

## Konfigurace

### Proměnné prostředí
- `REACT_APP_GOOGLE_MAPS_API_KEY` - Google Maps API klíč (povinný pro mapy)

### Google Maps API
Vyžaduje aktivované API:
- Maps JavaScript API
- Directions API
- Geocoding API (volitelné)

## Struktur komponent

```
App (main router)
├── RouteSelection (mapa a výběr trasy)
├── DroneTracking (real-time tracking)
├── Payment (platby a rezervace)
├── DroneManagement (správa dronů a doků)
├── Authorization (ověření licence)
├── PhotoControl (fotografie před/po letu)
└── Legislative (legislativní kontrola)
```

## Budoucí vylepšení

1. **Backend integrace**
   - REST API nebo GraphQL
   - WebSocket pro real-time tracking
   - Autentizace a autorizace uživatelů

2. **Platební brány**
   - Stripe integrace
   - PayPal SDK
   - Česká banka integrace (KB, ČSOB)

3. **Pokročilé funkce**
   - History letů
   - Rating systém
   - Notifikace (push, email)
   - Multi-language support

4. **Mobile app**
   - React Native verze
   - GPS tracking
   - Offline mode

## Licence shoda

Aplikace je navržena dle:
- **EU Nařízení 2019/947** - Pravidla a postupy pro provoz bezpilotních letadel
- **EU Nařízení 2019/945** - Požadavky na bezpilotní letadla
- **České legislativy ÚCL** - Úřad pro civilní letectví
- **GDPR** - Ochrana osobních údajů

## Bezpečnost

### Implementované
- Client-side validace
- Ověření licence
- Foto dokumentace
- Legislativní kontroly

### Potřebné pro produkci
- HTTPS
- API autentizace (JWT, OAuth)
- Rate limiting
- Input sanitization
- SQL injection prevention (backend)
- XSS protection

## Kontakt a podpora

Pro technické otázky a bug reports vytvořte issue na GitHubu.

---
Verze: 1.0.0
Datum: 2026-02-06
