# DRONERSHARE_MOBILLITY
Spojujeme pokročilé drony s umělou inteligencí, obnovitelnou energií a flexibilním sdílením pro vytvoření ekologické dopravní sítě nové generace.  🌟  

## 🚁 O projektu

Drontylity Engine systém pro správu flotily autonomních leteckých zařízení. Aplikace umožňuje uživatelům přepravu dronem z bodu A do bodu B v reálném čase a využít různé úrovně služeb podle potřeb.

## ✨ Hlavní funkce

### Frontend (Web aplikace)

1. **📍 Výběr trasy**
   - Uživatel vybere bod A a B na mapě s využitím Google Maps API
   - Automatický výpočet vzdálenosti a doby letu
   - Interaktivní mapové rozhraní

2. **📡 Real-time lokalizace**
   - Sledování polohy objednaného dronu v reálném čase
   - Zobrazení telemetrie (výška, rychlost, stav baterie)
   - Live tracking na mapě

3. **💳 Platby a rezervace**
   - Umožnění rezervace dronu na konkrétní čas
   - Integrace platebních bran (karta, PayPal)
   - Automatický výpočet ceny dle doby pronájmu

4. **🔧 Správa dronu (pro sdílení)**
   - Informace o doletu a maximálním dosahu
   - Stav baterie a údržby
   - Umístění dokovacích stanic
   - Vizualizace obsazenosti doků

5. **✅ Kontrola oprávnění k pilotování dronů**
   - Ověření pilotní licence
   - Kontrola platnosti certifikace
   - Kategorie oprávnění (A1/A3, atd.)

6. **📸 Fotokontrola propůjčeného dronu**
   - Před startem letu - dokumentace výchozího stavu
   - Po přistání - kontrola poškození
   - Použití kamery nebo upload souborů
   - Minimálně 3 fotografie z různých úhlů

7. **📋 Legislativní kontrola**
   - Kontrola shody s EU nařízením 2019/947
   - Ověření letových zón (povolené/omezené/zakázané)
   - Kontrola parametrů letu (hmotnost, výška)
   - Povinné pojištění

## 🚀 Rychlý start

### Požadavky
- Node.js 14+
- npm nebo yarn
- Google Maps API klíč

### Instalace

```bash
# Klonování repozitáře
git clone https://github.com/M1N0-OR1G1NAL/DRONERSHARE_MOBILLITY.git
cd DRONERSHARE_MOBILLITY/frontend

# Instalace závislostí
npm install

# Konfigurace Google Maps API
cp .env.example .env
# Upravte .env a přidejte váš API klíč

# Spuštění vývojového serveru
npm start
```

Aplikace poběží na `http://localhost:3000`

## 📁 Struktura projektu

```
DRONERSHARE_MOBILLITY/
├── frontend/                    # React frontend aplikace
│   ├── src/
│   │   ├── components/         # React komponenty
│   │   │   ├── RouteSelection/     # Výběr trasy
│   │   │   ├── DroneTracking/      # Real-time tracking
│   │   │   ├── Payment/            # Platby a rezervace
│   │   │   ├── DroneManagement/    # Správa dronů
│   │   │   ├── Authorization/      # Kontrola oprávnění
│   │   │   ├── PhotoControl/       # Fotokontrola
│   │   │   └── Legislative/        # Legislativní kontrola
│   │   ├── App.tsx             # Hlavní komponenta
│   │   └── index.tsx           # Entry point
│   ├── public/                 # Statické soubory
│   └── package.json            # Závislosti
├── README.md                    # Tato dokumentace
└── LICENSE                      # Licence projektu
```

## 🔧 Technologie

- **Frontend**: React 18, TypeScript
- **Mapy**: Google Maps API
- **Styling**: CSS3
- **Build**: Create React App

## 🌍 Legislativa a compliance

Aplikace je navržena v souladu s:
- **EU Nařízení 2019/947** - Pravidla pro provoz dronů
- **České národní legislativy ÚCL** (Úřad pro civilní letectví)
- **GDPR** - Ochrana osobních údajů

### Základní požadavky pro provoz:
- Registrace dronu nad 250g
- Pilotní licence (minimálně A1/A3)
- Pojištění odpovědnosti
- Dodržování maximální výšky letu 120m
- Respektování zakázaných zón

## 🔐 Bezpečnostní funkce

- ✅ Ověření pilotní licence před rezervací
- ✅ Kontrola pojištění
- ✅ Fotodokumentace stavu dronu před a po letu
- ✅ Kontrola shody s bezletovými zónami
- ✅ Real-time monitoring během letu

## 📖 Dokumentace

Podrobná dokumentace k jednotlivým funkcím je k dispozici v:
- [Frontend dokumentace](./frontend/README.md)

## 🤝 Přispívání

Příspěvky jsou vítány! Pro větší změny:
1. Forkněte repozitář
2. Vytvořte feature branch (`git checkout -b feature/amazing-feature`)
3. Commitněte změny (`git commit -m 'Add amazing feature'`)
4. Pushněte do branch (`git push origin feature/amazing-feature`)
5. Otevřete Pull Request

## 📄 Licence

Tento projekt je licencován pod licencí specifikovanou v souboru [LICENSE](LICENSE).

## 📞 Kontakt

Pro otázky a podporu kontaktujte projektový tým.

---

Vytvořeno s ❤️ pro budoucnost udržitelné mobility

