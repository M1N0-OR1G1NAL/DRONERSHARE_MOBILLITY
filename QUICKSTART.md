# 🚀 Quick Start Guide - DroneShare Mobility Platform

## Instalace a spuštění za 5 minut

### 1. Požadavky
- Node.js 14+ ([stáhnout](https://nodejs.org/))
- Google Maps API klíč ([získat](https://console.cloud.google.com/google/maps-apis))

### 2. Instalace

```bash
# Klonování repozitáře
git clone https://github.com/M1N0-OR1G1NAL/DRONERSHARE_MOBILLITY.git

# Přejít do adresáře
cd DRONERSHARE_MOBILLITY/frontend

# Nainstalovat závislosti
npm install
```

### 3. Konfigurace Google Maps API

```bash
# Vytvořit .env soubor
cp .env.example .env
```

Otevřete `.env` a přidejte váš API klíč:
```
REACT_APP_GOOGLE_MAPS_API_KEY=AIza...váš_klíč
```

### 4. Spuštění

```bash
npm start
```

Aplikace běží na: **http://localhost:3000** 🎉

## ✨ Funkce k vyzkoušení

### 1. Výběr trasy 📍
- Klikněte na záložku "Výběr trasy"
- Klikněte na mapu pro výběr bodu A (start)
- Klikněte znovu pro výběr bodu B (cíl)
- Trasa se automaticky vypočítá

### 2. Real-time sledování 📡
- Záložka "Sledování dronu"
- Klikněte "Spustit sledování"
- Sledujte dron v reálném čase na mapě

### 3. Platby 💳
- Záložka "Platby"
- Vyberte datum, čas a dobu pronájmu
- Zvolte platební metodu
- Vyplňte údaje (demo režim)

### 4. Správa dronů 🔧
- Záložka "Správa dronů"
- Prohlédněte dostupné drony
- Zkontrolujte stav baterie a dolet
- Přepněte na "Dokovací stanice"

### 5. Oprávnění ✓
- Záložka "Oprávnění"
- Zadejte číslo licence (např. CZ-RPAS-A1A3-123456)
- Klikněte "Ověřit licenci"

### 6. Fotokontrola 📸
- Záložka "Fotokontrola"
- Zapněte kameru nebo nahrajte fotky
- Pořiďte min. 3 fotky před letem
- Pokračujte k pořízení fotek po letu

### 7. Legislativa 📋
- Záložka "Legislativa"
- Vyplňte parametry letu
- Zaškrtněte pojištění a licenci
- Klikněte "Provést kontrolu shody"

## 🏗️ Build pro produkci

```bash
npm run build
```

Výstup v adresáři `build/` je připraven k nasazení.

## 🧪 Testování

```bash
npm test
```

## 🆘 Řešení problémů

### Mapa se nezobrazuje
- Zkontrolujte, že máte správný Google Maps API klíč v `.env`
- Ujistěte se, že jsou v Google Cloud Console aktivované API:
  - Maps JavaScript API
  - Directions API

### Kamere nefunguje
- Povolte přístup k kameře v prohlížeči
- Používejte HTTPS nebo localhost
- Zkuste alternativní metodu "Nahrát ze souboru"

### Build error
```bash
# Vyčistěte cache a reinstalujte
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Další informace

- [Hlavní README](../README.md)
- [Implementační dokumentace](../IMPLEMENTATION.md)
- [Frontend README](./frontend/README.md)

## 🎯 Demo data

Aplikace obsahuje demo data pro testování:
- 3 drony (DR001, DR002, DR003)
- 3 dokovací stanice (Praha Centrum, Holešovice, Smíchov)
- Výchozí pozice: Praha, Česká republika

## 💡 Tipy

1. **Mapy**: Klikejte přímo na mapu, nepoužívejte search box
2. **Fotky**: Pro nejlepší výsledky použijte kameru telefonu
3. **Legislativa**: Všechny kontroly jsou informativní pro demo účely
4. **Real-time**: Data jsou simulovaná, v produkci by byla z WebSocket

---

**Užijte si testování DroneShare Mobility! 🚁**
