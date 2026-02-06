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

- Node.js (v16+)
- MongoDB (v5+)
- npm nebo yarn
- Google Maps API klíč
- Stripe účet (pro platby)

### Instalace

```bash
# Klonování repozitáře
git clone https://github.com/M1N0-OR1G1NAL/DRONERSHARE_MOBILLITY.git
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
