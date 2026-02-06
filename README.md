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
# 🚁 DroneShare Mobility

> Spojujeme pokročilé drony s umělou inteligencí, obnovitelnou energií a flexibilním sdílením pro vytvoření ekologické dopravní sítě nové generace.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D5.0-green.svg)](https://www.mongodb.com/)

DroneShare Mobility je komplexní systém pro správu flotily autonomních leteckých zařízení. Aplikace umožňuje uživatelům přepravu dronem z bodu A do bodu B v reálném čase a využít různé úrovně služeb podle potřeb.

## ✨ Klíčové funkce

### 🎯 Objednání taxi dronu
- Výběr startovní polohy (bod A) a cílové polohy (bod B) na mapě
- **Level 1**: Fixed pickup location - uživatel jde na pevné místo (dronový dok)
- **Level 2**: User location pickup - dron přiletí na polohu uživatele
- **Level 3**: Self-piloting - sdílení dronů podobně jako carsharing

### 🤖 Autonomní řízení
- AI-based navigation s využitím senzorů (GPS, LIDAR, kamery)
- Real-time collision avoidance (vyhýbání kolizím)
- Komunikace s ostatními drony a objekty v okolí
- A* algoritmus pro optimalizaci trasy

### 🔋 Ekologické dobíjení
- Solární a větrné stanice rozmístěné v lokalitách
- Drony osazené solárními panely
- Inteligentní energy management systém
- Monitoring renewable energy generation

### 📸 Bezpečnostní prvky
- Kontrola oprávnění k pilotování dronů (Level 3)
- Fotokontrola propůjčeného dronu před i po startu letu
- Legislativní kontrola letových tras
- Emergency stop/landing protocols

### 👥 Systém přístupových úrovní (Flight Tier System)

Platforma implementuje **4 fáze přihlášení** pro různé typy uživatelů:

#### **Tier 0: Návštěvník** (Prospective Visitor)
- 🌐 Prohlížení platformy a marketingového obsahu
- 📋 Výchozí úroveň pro nové uživatele

#### **Tier 1: Aktivní Předplatitel** (Active Subscriber)
Registrovaní uživatelé s přístupem ke třem službám:
- 🚕 **Automatizovaná taxi jízda** - Autonomní přeprava z bodu A do B
- 🎮 **Půjčení dronu** - Osobní pilotování s různými tarify
- 📦 **Transport balíků** - Logistika a přeprava zboží

#### **Tier 2: Správce Systému** (System Overseer)
- 🔧 Administrativní přístup k platformě
- 👥 Správa uživatelů a oprávnění

#### **Tier 3: Technická Obsluha** (Technical Crew)
- 🛠️ Údržba a diagnostika dronové flotily
- 🔍 Fleet monitoring a servis

Více informací v dokumentaci: [Flight Tier System](/docs/FLIGHT_TIER_SYSTEM.md)

## 🏗️ Architektura

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Mobile App     │◄────────┤   Backend API   │◄────────┤  IoT Platform   │
│  (React Native) │         │   (Node.js)     │         │  (AWS/Azure)    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                            │                            │
        ▼                            ▼                            ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  User Interface │         │   MongoDB       │         │  Physical Drones│
│  - Maps         │         │   Database      │         │  - Sensors      │
│  - Tracking     │         │                 │         │  - AI Control   │
│  - Payments     │         │                 │         │  - Solar Panels │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Technologie

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO (real-time tracking)
- AWS IoT / Azure IoT (drone communication)
- Stripe (payment processing)

**Frontend:**
- React Native / Expo
- Google Maps API
- Socket.IO Client
- React Navigation

**IoT Layer:**
- MQTT protocol
- Sensor data integration
- Autonomous flight control

## 🚀 Rychlý start

### Požadavky
- Node.js 14+
- npm nebo yarn
- Google Maps API klíč

- Node.js (v16+)
- MongoDB (v5+)
- npm nebo yarn
- Google Maps API klíč
- Stripe účet (pro platby)

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

cd DRONERSHARE_MOBILLITY

# Backend setup
cd backend
npm install
cp .env.example .env
# Upravte .env s vlastními hodnotami
npm run dev

# Frontend setup (v novém terminálu)
cd frontend
npm install
npm start
```

Detailní instrukce naleznete v [dokumentaci pro setup](docs/SETUP.md).

## 📚 Dokumentace

- **[Architecture Documentation](docs/ARCHITECTURE.md)** - Podrobný popis architektury systému
- **[Setup Guide](docs/SETUP.md)** - Kompletní instalační a konfigurační průvodce
- **[API Documentation](docs/API.md)** - REST API dokumentace s příklady

## 🎯 Řešené problémy

- **Přeplněná městská doprava**: Vzdušná doprava jako alternativa k pozemní
- **Dlouhé časy dojíždění**: Rychlá point-to-point doprava
- **Nedostatečná flexibilita**: Tři úrovně služeb pro různé potřeby
- **Ekologické problémy**: 100% elektrické drony s renewable energy charging

## 👥 Cílová skupina

- **Urbanistická města** s velkým objemem obyvatel
- **Firmy** hledající efektivní fleet management
- **Ekologicky smýšlející zákazníci** preferující sustainable transport
- **Delivery služby** pro přepravu balíků

## 🔐 Bezpečnost

- JWT-based authentication
- Encrypted communication channels (TLS/SSL)
- PCI-DSS compliant payment processing
- GDPR compliance
- Real-time anomaly detection
- Geofencing for restricted areas

## 📊 Service Levels

| Feature | Level 1 | Level 2 | Level 3 |
|---------|---------|---------|---------|
| Pickup Location | Fixed dock | User location | User choice |
| Pilot Required | No | No | Yes (verified license) |
| Photo Verification | No | No | Yes |
| Price Multiplier | 1.0x | 1.3x | 1.5x |
| Use Case | Commute | On-demand | Rental |

## 🛠️ Development

```bash
# Spuštění testů
cd backend
npm test

# Linting
npm run lint

# Build
npm run build
```

## 📝 Licence

Tento projekt je licencován pod MIT licencí - viz [LICENSE](LICENSE) soubor.

## 🤝 Přispívání

Příspěvky jsou vítány! Pro větší změny prosím nejprve otevřete issue pro diskuzi.

## 📞 Kontakt

- **GitHub Issues**: Pro technické problémy a dotazy
- **Documentation**: Kompletní dokumentace v `/docs` složce

## 🌟 Budoucí vylepšení

- [ ] Machine learning pro predictive maintenance
- [ ] Multi-drone coordination pro heavy cargo
- [ ] Emergency medical transport
- [ ] Integration s public transport systems
- [ ] Carbon footprint tracking
- [ ] Dynamic pricing based on demand

---

**Poznámka**: Tento projekt je MVP (Minimum Viable Product) demonstrující koncept autonomního drone sharing systému. Pro produkční nasazení je nutné implementovat kompletní bezpečnostní opatření, získat letecké certifikace a splnit všechny regulatorní požadavky.
# 🚁 Drontylity Engine

## Průlomová platforma pro sdílení autonomních dronů

Drontylity představuje revoluční řešení urbánní mobility budoucnosti. Naše vize spojuje pokročilé drony s umělou inteligencí, obnovitelnou energií a flexibilním sdílením pro vytvoření ekologické dopravní sítě nové generace.

---

## 🌟 Co je Drontylity?

Drontylity Engine je softwarový systém pro správu flotily autonomních leteckých zařízení. Aplikace umožňuje uživatelům objednat přepravu dronem z bodu A do bodu B, sledovat let v reálném čase a využívat různé úrovně služeb podle jejich potřeb.

**Naše služba nabízí tři úrovně:**

**Level 1 - Základní přeprava**  
Uživatel dojde na předem určenou stanici, kde dron čeká připravený k odletu. Jednoduchý a cenově dostupný způsob rychlé přepravy.

**Level 2 - Osobní přílet**  
Dron přiletí přímo k aktuální pozici uživatele a následně ho dopraví do cílové destinace. Maximální komfort bez nutnosti docházet na stanici.

**Level 3 - Autonomní sdílení**  
Podobně jako carsharing - uživatel si pronajme dron na libovolnou dobu, použije ho podle svých potřeb a vrátí do kteréhokoli dostupného doku v síti.

---

## ✨ Proč Drontylity?

### Výhody našeho řešení

**🌿 Ekologická udržitelnost**  
Všechny drony v naší flotile využívají výhradně čistou energii z fotovoltaických a větrných dobíjecích stanic rozmístěných po městě.

**⚡ Rychlost a efektivita**  
Přesun vzduchem eliminuje dopravní zácpy a zkracuje časy přepravy až o 70% oproti pozemní dopravě v městských oblastech.

**🎯 Flexibilita využití**  
Tři různé úrovně služeb zajišťují, že každý najde řešení odpovídající jeho potřebám a rozpočtu.

**🤖 Plná automatizace**  
Senzorické systémy a AI navigace zajišťují bezpečný let bez nutnosti lidského pilotování. Kolizní detekce pracuje v reálném čase.

**📱 Intuitivní ovládání**  
Mobilní aplikace s jednoduchým rozhraním - zadejte start a cíl, vyberte úroveň služby a sledujte přílet dronu na mapě.

---

## ⚠️ Čím Drontylity NENÍ

Je důležité pochopit současná omezení technologie:

**Není náhradou všech dopravních prostředků**  
Drony jsou ideální pro kratší a střední vzdálenosti v městských oblastech, nikoliv pro dálkové lety přes kontinenty.

**Není dostupné za všech povětrnostních podmínek**  
Bezpečnost je priorita - při silném dešti, bouřkách nebo extrémním větru je provoz pozastaven.

**Není bez regulačních požadavků**  
Provoz vyžaduje povolení leteckých úřadů a dodržování vzdušných koridorů stanovených legislativou.

**Není řešení pro okamžitý transport**  
I když je služba rychlá, příprava dronu a navigace k vašemu místu vyžaduje určitý čas (obvykle 3-8 minut).

**Není vhodné pro přepravu nadměrného nákladu**  
Aktuální kapacita je optimalizována pro jednoho pasažéra nebo ekvivalentní hmotnost nákladu (cca 80-100 kg).

---

## 🎯 Naše mise

**Transformovat městskou mobilitu prostřednictvím autonomních leteckých systémů napájených obnovitelnou energií.**

Věříme, že budoucnost dopravy neleží jen na silnicích, ale i ve vzduchu. Naším cílem je vytvořit síť, která:
- Odlehčí přetíženým městským komunikacím
- Dramaticky sníží emise CO₂ v dopravním sektoru  
- Zpřístupní rychlou mobilitu širokému spektru obyvatel
- Posune lidstvo blíže k vizi plně udržitelných měst

---

## 🚀 Cíle projektu

### Krátkodobé (6-12 měsíců)
- Vyvinout funkční MVP mobilní aplikace s rezervačním systémem
- Implementovat základní backend pro správu flotily a tras
- Otestovat integraci s komerčními dronovými platformami (DJI, Skydio)
- Získat pilotní licenci pro testování v kontrolovaném prostoru

### Střednědobé (1-2 roky)
- Spustit Level 1 službu v jednom pilotním městě s 10-15 stanicemi
- Rozšířit flotilu na 50+ autonomních jednotek
- Implementovat pokročilé AI algoritmy pro optimalizaci tras a energetického managementu
- Vybudovat prvních 20 solárních/větrných dobíjecích stanic

### Dlouhodobé (3-5 let)
- Rozšíření do 10+ metropolí v Evropě
- Plná autonomie všech úrovní služeb (Level 1-3)
- Flotila 500+ dronů s kompletní obnovitelnou energetickou infrastrukturou
- Integrace s dalšími dopravními systémy (MHD, vlaky) pro multimodální mobilitu
- Otevření API pro třetí strany a vytvoření ekosystému partnerů

---

## 🛠️ Architektura systému

### Mobilní aplikace (Frontend)
- Interaktivní mapa s výběrem trasy
- Real-time tracking pozice dronu
- Platební integrace a správa rezervací
- Dashboard pro Level 3 (stav baterie, dostupné doky)

### Serverová logika (Backend)
- Optimalizační algoritmy pro plánování letových tras
- Správa energetické sítě a monitoring stavu flotily
- API pro komunikaci s dronovými jednotkami
- Analytics a prediktivní modelování poptávky

### IoT vrstva (Drony)
- Cloudové propojení jednotlivých zařízení
- Senzorické systémy pro navigaci a kolizní prevenci
- Telemetrie a diagnostika v reálném čase
- Automatické procedury pro nouzová přistání

---

## 👥 Jak se zapojit

Hledáme nadšené vývojáře, inženýry a vizionáře, kteří chtějí přispět k revoluci v městské mobilitě!

### Pro vývojáře

**Oblasti, kde potřebujeme pomoc:**
- Backend vývoj (Python, Node.js, Go)
- Frontend mobilní aplikace (React Native, Flutter)
- AI/ML specialisty pro navigační algoritmy
- IoT inženýry se zkušenostmi s drony
- DevOps pro cloudovou infrastrukturu

**Jak začít:**
1. Forkněte tento repozitář
2. Vytvořte novou větev pro vaši práci (`git checkout -b feature/vase-funkcionalita`)
3. Commitujte změny s popisnými zprávami
4. Otevřete Pull Request s detailním popisem vašich úprav

### Pro investory a partnery

Pokud věříte v budoucnost udržitelné urbánní mobility a chcete se podílet na této cestě, kontaktujte nás pro diskusi o partnerství nebo investičních příležitostech.

### Pro testery a early adopters

Jakmile budeme mít funkční prototyp, budeme hledat dobrovolníky pro beta testování v pilotních lokalitách.

---

## 📋 Technologický stack

**Plánované technologie:**
- Cloud: AWS IoT / Azure IoT Hub
- Backend: Microservices architektura
- Database: PostgreSQL + Redis
- Real-time: WebSocket komunikace
- AI/ML: TensorFlow pro navigační modely
- Mapping: Vlastní implementace nad otevřenými daty

---

## 📄 Právní a patentová ochrana

Pracujeme na patentové ochraně klíčových inovací:
- Systém autonomního řízení s integrací obnovitelných zdrojů energie
- Algoritmy pro dynamickou optimalizaci flotily
- Mechanismy solárně-větrného dobíjení pro vzdušná vozidla

---

## 🌍 Kontakt

Pro otázky, návrhy nebo spolupráci nás kontaktujte prostřednictvím Issues v tomto repozitáři.

**Společně vytvoříme mobilitu budoucnosti! 🚁✨**

---

*Tento projekt je ve fázi koncepce a aktivního vývoje. Veškeré uvedené specifikace a časové rámce jsou orientační a mohou se měnit podle technologického pokroku a tržních podmínek.*
