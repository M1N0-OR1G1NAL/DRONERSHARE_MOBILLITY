# DroneShare Mobility Platform - Frontend

Moderní webová aplikace pro sdílení dronů a správu autonomní letecké dopravy.

## 🌟 Funkce

### 1. Výběr trasy (Route Selection)
- Interaktivní mapa s Google Maps API
- Výběr bodu A a B kliknutím na mapu
- Automatický výpočet trasy a vzdálenosti
- Zobrazení odhadovaného času letu

### 2. Real-time lokalizace dronu
- Sledování polohy dronu v reálném čase
- Zobrazení telemetrie (výška, rychlost, baterie)
- Interaktivní mapa s aktuální pozicí
- Live aktualizace dat

### 3. Platby a rezervace
- Rezervace dronu na konkrétní datum a čas
- Výběr doby pronájmu
- Integrace platebních metod (karta, PayPal)
- Automatický výpočet ceny

### 4. Správa dronu
- Přehled dostupných dronů
- Informace o doletu a stavu baterie
- Umístění dokovacích stanic
- Vizualizace obsazenosti doků
- Sledování stavu údržby

### 5. Kontrola oprávnění k pilotování
- Ověření pilotní licence
- Kontrola platnosti certifikace
- Zobrazení kategorie oprávnění
- Seznam požadavků pro provoz

### 6. Fotokontrola dronu
- Pořízení fotek před a po letu
- Využití kamery nebo upload souborů
- Dokumentace stavu dronu
- Prevence poškození

### 7. Legislativní kontrola
- Kontrola shody s EU legislativou
- Mapa letových zón
- Ověření parametrů letu
- Seznam požadavků a omezení

## 🚀 Instalace

### Požadavky
- Node.js 14+ 
- npm nebo yarn
- Google Maps API klíč

### Postup

1. Klonování repozitáře:
```bash
git clone https://github.com/M1N0-OR1G1NAL/DRONERSHARE_MOBILLITY.git
cd DRONERSHARE_MOBILLITY/frontend
```

2. Instalace závislostí:
```bash
npm install
```

3. Konfigurace:
```bash
cp .env.example .env
```

Upravte soubor `.env` a přidejte váš Google Maps API klíč:
```
REACT_APP_GOOGLE_MAPS_API_KEY=váš_api_klíč
```

4. Spuštění vývojového serveru:
```bash
npm start
```

Aplikace běží na `http://localhost:3000`

## 🏗️ Build pro produkci

```bash
npm run build
```

Vytvoří optimalizovanou build verzi v adresáři `build/`.

## 🧪 Testování

```bash
npm test
```

## 📁 Struktura projektu

```
frontend/
├── public/                 # Statické soubory
├── src/
│   ├── components/        # React komponenty
│   │   ├── RouteSelection/
│   │   ├── DroneTracking/
│   │   ├── Payment/
│   │   ├── DroneManagement/
│   │   ├── Authorization/
│   │   ├── PhotoControl/
│   │   └── Legislative/
│   ├── App.tsx            # Hlavní komponenta
│   ├── App.css            # Hlavní styly
│   └── index.tsx          # Entry point
├── package.json
└── README.md
```

## 🔧 Technologie

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Google Maps API** - Mapové služby
- **@react-google-maps/api** - React wrappery pro Google Maps
- **CSS3** - Styling

## 📋 Dostupné skripty

- `npm start` - Spustí vývojový server
- `npm run build` - Vytvoří produkční build
- `npm test` - Spustí testy
- `npm run eject` - Eject z Create React App (nevratné!)

## 🌍 Legislativní požadavky

Aplikace je navržena v souladu s:
- Nařízení EU 2019/947 (provoz dronů)
- České národní legislativy ÚCL
- GDPR pro zpracování osobních údajů

## 🔐 Bezpečnost

- Ověření pilotní licence
- Kontrola pojištění
- Fotodokumentace stavu dronu
- Shoda s bezletovými zónami

## 🤝 Přispívání

Příspěvky jsou vítány! Pro větší změny nejprve otevřete issue.

## 📄 Licence

Viz soubor LICENSE v kořenovém adresáři projektu.

## 📞 Kontakt

Pro otázky a podporu kontaktujte projektový tým.

---

**DroneShare Mobility** - Spojujeme pokročilé drony s umělou inteligencí, obnovitelnou energií a flexibilním sdílením pro vytvoření ekologické dopravní sítě nové generace. 🌟
